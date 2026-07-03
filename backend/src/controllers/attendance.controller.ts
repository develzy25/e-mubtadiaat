import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const getAttendance = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const classId = c.req.query('classId');
    const month = c.req.query('month'); // YYYY-MM

    if (!classId || !month) {
      return c.json({ success: false, message: 'classId and month are required' }, 400);
    }

    // Check if attendance record exists for this month
    const existingAtt = await db.select().from(schema.attendance)
      .where(and(
        eq(schema.attendance.classId, classId),
        eq(schema.attendance.month, month)
      )).get();

    let details: any[] = [];

    if (existingAtt) {
      // Fetch existing details
      details = await db.select().from(schema.attendanceDetails)
        .where(eq(schema.attendanceDetails.attendanceId, existingAtt.id));
    }

    // Always fetch the santri list for this class to ensure we have all students
    const santriList = await db.select().from(schema.santriRefs)
      .where(and(eq(schema.santriRefs.classId, classId), eq(schema.santriRefs.status, 'ACTIVE')));

    // Merge santri list with existing details
    const mergedData = santriList.map(santri => {
      const detail = details.find(d => d.santriId === santri.id);
      return {
        santriId: santri.id,
        nis: santri.nis,
        name: santri.name,
        hadir: detail?.hadir || 0,
        sakit: detail?.sakit || 0,
        izin: detail?.izin || 0,
        alpha: detail?.alpha || 0,
        notes: detail?.notes || ''
      };
    });

    return c.json({
      success: true,
      data: {
        attendanceId: existingAtt?.id || null,
        month,
        classId,
        details: mergedData
      }
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    return c.json({ success: false, message: 'Internal Server Error' }, 500);
  }
};

export const saveAttendance = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { classId, month, details, recordedBy } = body;
    
    if (!classId || !month || !details || !recordedBy) {
      return c.json({ success: false, message: 'Missing required fields' }, 400);
    }

    // Transaction - D1 supports batching, but for complex logic, we do it step by step
    
    // Check if exists
    let att = await db.select().from(schema.attendance)
      .where(and(
        eq(schema.attendance.classId, classId),
        eq(schema.attendance.month, month)
      )).get();

    if (!att) {
      // Create new
      const newId = `att_${crypto.randomUUID()}`;
      await db.insert(schema.attendance).values({
        id: newId,
        classId,
        month,
        recordedBy
      });
      att = { id: newId } as any;
    } else {
      // Delete existing details to recreate them (simplest approach for full updates)
      await db.delete(schema.attendanceDetails).where(eq(schema.attendanceDetails.attendanceId, att.id));
    }

    // Insert new details
    const detailsToInsert = details.map((d: any) => ({
      id: `att_det_${crypto.randomUUID()}`,
      attendanceId: att!.id,
      santriId: d.santriId,
      hadir: d.hadir,
      sakit: d.sakit,
      izin: d.izin,
      alpha: d.alpha,
      notes: d.notes || null
    }));

    if (detailsToInsert.length > 0) {
      await db.insert(schema.attendanceDetails).values(detailsToInsert);
    }

    return c.json({ success: true, message: 'Attendance saved successfully' });

  } catch (error) {
    console.error('Error saving attendance:', error);
    return c.json({ success: false, message: 'Internal Server Error' }, 500);
  }
};
