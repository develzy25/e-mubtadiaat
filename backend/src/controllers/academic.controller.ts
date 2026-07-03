import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Helper for audit logging
const logAudit = async (db: any, userId: string, activity: string, tableName: string, recordId: string, oldData: any, newData: any) => {
  try {
    await db.insert(schema.auditLogs).values({
      id: `audit_${crypto.randomUUID()}`,
      userId,
      role: 'ADMIN',
      activity,
      tableName,
      recordId,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      ipAddress: '127.0.0.1',
      device: 'Web Browser (Desktop)',
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

// --- JADWAL PELAJARAN ---

export const getJadwal = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const classId = c.req.param('classId')!;
    const kwartal = parseInt(c.req.query('kwartal') || '1');
    const year = c.req.query('year') || '2025-2026';

    const list = await db.select()
      .from(schema.jadwalPelajaran)
      .where(
        and(
          eq(schema.jadwalPelajaran.classId, classId),
          eq(schema.jadwalPelajaran.kwartal, kwartal),
          eq(schema.jadwalPelajaran.academicYear, year)
        )
      );

    return c.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const saveJadwalBatch = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { classId, kwartal, academicYear, items, recordedBy = 'admin-system' } = body;

    // Delete existing schedule for this specific kwartal/year
    await db.delete(schema.jadwalPelajaran)
      .where(
        and(
          eq(schema.jadwalPelajaran.classId, classId),
          eq(schema.jadwalPelajaran.kwartal, kwartal),
          eq(schema.jadwalPelajaran.academicYear, academicYear)
        )
      );

    // Insert new schedule entries
    const newEntries = items.map((item: any) => ({
      id: `jwl_${crypto.randomUUID()}`,
      classId,
      kwartal,
      academicYear,
      kitabName: item.kitabName,
      hari: item.hari,
      sesi: item.sesi,
      pengajar: item.pengajar
    }));

    if (newEntries.length > 0) {
      await db.insert(schema.jadwalPelajaran).values(newEntries);
    }

    await logAudit(db, recordedBy, 'UPDATE_JADWAL_BATCH', 'jadwal_pelajaran', classId, null, newEntries);

    return c.json({ success: true, message: 'Jadwal berhasil diperbarui' });
  } catch (error) {
    console.error('Error saving schedule batch:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

// --- RAPOT ---

export const getRapotGrid = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const classId = c.req.param('classId')!;
    const semester = c.req.query('semester') || 'I';
    const year = c.req.query('year') || '2025-2026';

    // 1. Get all students in this class
    const students = await db.select()
      .from(schema.santriRefs)
      .where(
        and(
          eq(schema.santriRefs.classId, classId),
          eq(schema.santriRefs.status, 'ACTIVE')
        )
      );

    // 2. Get existing rapot headers and their values
    const rapotHeaders = await db.select()
      .from(schema.rapotSemester)
      .where(
        and(
          eq(schema.rapotSemester.classId, classId),
          eq(schema.rapotSemester.semester, semester),
          eq(schema.rapotSemester.academicYear, year)
        )
      );

    const rapotIds = rapotHeaders.map(h => h.id);
    let allScores: any[] = [];
    if (rapotIds.length > 0) {
      allScores = await db.select()
        .from(schema.rapotNilai)
        .where(
          sql`${schema.rapotNilai.rapotId} IN (${sql.raw(rapotIds.map(id => `'${id}'`).join(','))})`
        );
    }

    // Get class finalization status
    const finalization = await db.select().from(schema.kelasFinalization)
      .where(
        and(
          eq(schema.kelasFinalization.classId, classId),
          eq(schema.kelasFinalization.semester, semester),
          eq(schema.kelasFinalization.academicYear, year)
        )
      ).get();

    const classStatus = finalization?.status || 'DRAFT';

    // 3. Map students to their scores
    const gridData = students.map(student => {
      const header = rapotHeaders.find(h => h.santriId === student.id);
      const scores = header ? allScores.filter(s => s.rapotId === header.id) : [];
      return {
        student: {
          id: student.id,
          name: student.name,
          noStambuk: student.noStambuk || student.nis
        },
        rapotId: header?.id || null,
        izinCount: header?.izinCount ?? 0,
        tanpaIzinCount: header?.tanpaIzinCount ?? 0,
        nilaiAkhlaq: header?.nilaiAkhlaq ?? 8,
        catatan: header?.catatan || '',
        predikatOverride: header?.predikatOverride || null,
        scores: scores.map(s => ({
          kitabName: s.kitabName,
          tamrinScore: s.tamrinScore,
          ujianScore: s.ujianScore,
          khoshScore: s.khoshScore,
          isFixedColumn: s.isFixedColumn
        }))
      };
    });

    return c.json({ success: true, data: gridData, classStatus });
  } catch (error) {
    console.error('Error fetching rapot grid:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const inputRapotBatch = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { classId, semester, academicYear, rows, recordedBy = 'admin-system' } = body;

    // Check finalization status first
    const finalization = await db.select().from(schema.kelasFinalization)
      .where(
        and(
          eq(schema.kelasFinalization.classId, classId),
          eq(schema.kelasFinalization.semester, semester),
          eq(schema.kelasFinalization.academicYear, academicYear)
        )
      ).get();

    if (finalization && finalization.status === 'FINAL') {
      return c.json({ success: false, message: 'Nilai kelas ini sudah difinalisasi dan tidak dapat diubah.' }, 400);
    }

    for (const row of rows) {
      const { studentId, rapotId: existingRapotId, izinCount, tanpaIzinCount, nilaiAkhlaq, catatan, predikatOverride, scores } = row;

      let rapotId = existingRapotId;
      const akhlaqScore = (nilaiAkhlaq !== undefined && nilaiAkhlaq !== null) ? Math.max(4, Math.min(8, Number(nilaiAkhlaq))) : 8;

      if (!rapotId) {
        // Check if header already exists to prevent duplicate key
        const header = await db.select().from(schema.rapotSemester)
          .where(
            and(
              eq(schema.rapotSemester.santriId, studentId),
              eq(schema.rapotSemester.semester, semester),
              eq(schema.rapotSemester.academicYear, academicYear)
            )
          ).get();

        if (header) {
          rapotId = header.id;
        } else {
          // Create new header
          rapotId = `rpt_${crypto.randomUUID()}`;
          await db.insert(schema.rapotSemester).values({
            id: rapotId,
            santriId: studentId,
            classId,
            semester,
            academicYear,
            izinCount,
            tanpaIzinCount,
            nilaiAkhlaq: akhlaqScore,
            catatan,
            predikatOverride,
            recordedBy
          });
        }
      } else {
        // Update header
        await db.update(schema.rapotSemester)
          .set({
            izinCount,
            tanpaIzinCount,
            nilaiAkhlaq: akhlaqScore,
            catatan,
            predikatOverride,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(schema.rapotSemester.id, rapotId));
      }

      // Delete existing scores for this rapotId to overwrite
      await db.delete(schema.rapotNilai).where(eq(schema.rapotNilai.rapotId, rapotId));

      // Insert new scores
      const scoreEntries = scores.map((s: any) => {
        // Calculate Khosh Score with Lirboyo standard rounding (>=0.5 up, <0.5 down)
        const rawAvg = (Number(s.tamrinScore) + Number(s.ujianScore)) / 2;
        let khoshScore = Math.round(rawAvg); // Math.round standard: >= 0.5 rounds up, < 0.5 rounds down.
        // Clamping to [4, 9] according to pedoman
        khoshScore = Math.max(4, Math.min(9, khoshScore));

        return {
          id: `scr_${crypto.randomUUID()}`,
          rapotId,
          kitabName: s.kitabName,
          tamrinScore: Number(s.tamrinScore),
          ujianScore: Number(s.ujianScore),
          khoshScore,
          isFixedColumn: s.isFixedColumn ? 1 : 0
        };
      });

      if (scoreEntries.length > 0) {
        await db.insert(schema.rapotNilai).values(scoreEntries);
      }
    }

    await logAudit(db, recordedBy, 'INPUT_RAPOT_BATCH', 'rapot_semester', classId, null, { count: rows.length });

    return c.json({ success: true, message: 'Nilai rapot berhasil disimpan' });
  } catch (error) {
    console.error('Error saving rapot batch:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const finalizeKelas = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { classId, semester, academicYear, status, recordedBy = 'admin-system' } = body;

    if (!['DRAFT', 'SIAP_FINALISASI', 'FINAL'].includes(status)) {
      return c.json({ success: false, message: 'Status finalisasi tidak valid' }, 400);
    }

    // Check if entry already exists
    const existing = await db.select().from(schema.kelasFinalization)
      .where(
        and(
          eq(schema.kelasFinalization.classId, classId),
          eq(schema.kelasFinalization.semester, semester),
          eq(schema.kelasFinalization.academicYear, academicYear)
        )
      ).get();

    if (existing) {
      await db.update(schema.kelasFinalization)
        .set({
          status,
          finalizedBy: status === 'FINAL' ? recordedBy : null,
          finalizedAt: status === 'FINAL' ? new Date().toISOString() : null,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(schema.kelasFinalization.id, existing.id));
    } else {
      await db.insert(schema.kelasFinalization).values({
        id: `fin_${crypto.randomUUID()}`,
        classId,
        semester,
        academicYear,
        status,
        finalizedBy: status === 'FINAL' ? recordedBy : null,
        finalizedAt: status === 'FINAL' ? new Date().toISOString() : null
      });
    }

    await logAudit(db, recordedBy, 'FINALIZE_KELAS', 'kelas_finalization', classId, null, { status });

    return c.json({ success: true, message: `Status finalisasi kelas berhasil diubah menjadi ${status}` });
  } catch (error) {
    console.error('Error finalizing kelas:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const getNilaiAm = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const classId = c.req.param('classId')!;
    const semester = c.req.query('semester') || 'I';
    const year = c.req.query('year') || '2025-2026';

    // 1. Get only ACTIVE students in this class
    const activeStudents = await db.select()
      .from(schema.santriRefs)
      .where(
        and(
          eq(schema.santriRefs.classId, classId),
          eq(schema.santriRefs.status, 'ACTIVE')
        )
      );

    const totalActiveCount = activeStudents.length;
    if (totalActiveCount === 0) {
      return c.json({ success: true, data: [] });
    }

    const activeStudentIds = new Set(activeStudents.map(s => s.id));

    // 2. Get all rapot headers for this class/semester/year
    const headers = await db.select()
      .from(schema.rapotSemester)
      .where(
        and(
          eq(schema.rapotSemester.classId, classId),
          eq(schema.rapotSemester.semester, semester),
          eq(schema.rapotSemester.academicYear, year)
        )
      );

    // Filter headers to only contain active students
    const activeHeaders = headers.filter(h => activeStudentIds.has(h.santriId));
    const activeRapotIds = activeHeaders.map(h => h.id);

    let allScores: any[] = [];
    if (activeRapotIds.length > 0) {
      allScores = await db.select()
        .from(schema.rapotNilai)
        .where(
          sql`${schema.rapotNilai.rapotId} IN (${sql.raw(activeRapotIds.map(id => `'${id}'`).join(','))})`
        );
    }

    // Find all unique subjects recorded in this class
    const uniqueKitabs = Array.from(new Set(allScores.map(s => s.kitabName)));
    const subjectFixedMap: Record<string, number> = {};
    for (const s of allScores) {
      subjectFixedMap[s.kitabName] = s.isFixedColumn ?? 0;
    }

    // Map of rapotId -> kitabName -> khoshScore
    const studentScoresMap: Record<string, Record<string, number>> = {};
    for (const s of allScores) {
      if (!studentScoresMap[s.rapotId]) {
        studentScoresMap[s.rapotId] = {};
      }
      studentScoresMap[s.rapotId][s.kitabName] = s.khoshScore;
    }

    // 3. Compute average per subject (ROUND(SUM / total_active_students))
    // Active students with missing grades default to 4 in the sum
    const averages = uniqueKitabs.map(kitabName => {
      let sum = 0;
      for (const student of activeStudents) {
        const header = activeHeaders.find(h => h.santriId === student.id);
        const score = header ? studentScoresMap[header.id]?.[kitabName] : undefined;
        
        if (score !== undefined && score !== null) {
          sum += score;
        } else {
          sum += 4; // Default score for un-entered/empty exam
        }
      }
      
      const avg = Math.round(sum / totalActiveCount);
      return {
        kitabName,
        sumScore: sum,
        nilaiAm: avg,
        isFixedColumn: subjectFixedMap[kitabName] || 0
      };
    });

    return c.json({ success: true, data: averages });
  } catch (error) {
    console.error('Error fetching Nilai Am:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const getRekap = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const santriId = c.req.param('santriId')!;
    const year = c.req.query('year') || '2025-2026';

    const rapotList = await db.select()
      .from(schema.rapotSemester)
      .where(
        and(
          eq(schema.rapotSemester.santriId, santriId),
          eq(schema.rapotSemester.academicYear, year)
        )
      );

    const s1 = rapotList.find(r => r.semester === 'I');
    const s2 = rapotList.find(r => r.semester === 'II');

    let s1Scores: any[] = [];
    let s2Scores: any[] = [];

    if (s1) {
      s1Scores = await db.select().from(schema.rapotNilai).where(eq(schema.rapotNilai.rapotId, s1.id));
    }
    if (s2) {
      s2Scores = await db.select().from(schema.rapotNilai).where(eq(schema.rapotNilai.rapotId, s2.id));
    }

    // Combine distinct subject names
    const allKitabs = Array.from(new Set([
      ...s1Scores.map(s => s.kitabName),
      ...s2Scores.map(s => s.kitabName)
    ]));

    // Map each subject's scores
    const detailMapel = allKitabs.map(name => {
      const s1Score = s1Scores.find(s => s.kitabName === name);
      const s2Score = s2Scores.find(s => s.kitabName === name);
      return {
        kitabName: name,
        s1Khos: s1Score?.khoshScore ?? null,
        s2Khos: s2Score?.khoshScore ?? null
      };
    });

    // Sum S1, Sum S2
    const totalS1 = s1Scores.reduce((a, b) => a + b.khoshScore, 0);
    const totalS2 = s2Scores.reduce((a, b) => a + b.khoshScore, 0);
    const totalMapelS1 = s1Scores.length;
    const totalMapelS2 = s2Scores.length;

    const grandTotal = totalS1 + totalS2;
    const grandTotalMapel = totalMapelS1 + totalMapelS2;
    
    // Rata-rata & Al-Bayan (Predikat)
    let rataRata = 0;
    let nilaiPrestasi = 0;
    let predikat = 'الرديء'; // Default is Rodi'

    const izinTotal = (s1?.izinCount ?? 0) + (s2?.izinCount ?? 0);
    const tanpaIzinTotal = (s1?.tanpaIzinCount ?? 0) + (s2?.tanpaIzinCount ?? 0);

    const pengurangIzin = Math.floor(izinTotal / 15);
    const pengurangAlpa = Math.floor(tanpaIzinTotal / 5);

    if (grandTotalMapel > 0) {
      const rataRataRaw = grandTotal / grandTotalMapel;
      rataRata = Math.round(rataRataRaw); // MPHM standard rounding (round to nearest)
      
      nilaiPrestasi = rataRata - pengurangIzin - pengurangAlpa;
      if (nilaiPrestasi >= 9) predikat = 'الجيد الأول';
      else if (nilaiPrestasi === 8) predikat = 'الجيد الثاني';
      else if (nilaiPrestasi === 7) predikat = 'المتوسط الأول';
      else if (nilaiPrestasi === 6) predikat = 'المتوسط الثاني';
      else predikat = 'الرديء';
    }

    // Override from DB if present
    const s2Override = s2?.predikatOverride || s1?.predikatOverride;
    if (s2Override) {
      predikat = s2Override;
    }

    return c.json({
      success: true,
      data: {
        s1: s1 ? { totalScore: totalS1, izin: s1.izinCount, tanpaIzin: s1.tanpaIzinCount, nilaiAkhlaq: s1.nilaiAkhlaq ?? 8, catatan: s1.catatan } : null,
        s2: s2 ? { totalScore: totalS2, izin: s2.izinCount, tanpaIzin: s2.tanpaIzinCount, nilaiAkhlaq: s2.nilaiAkhlaq ?? 8, catatan: s2.catatan } : null,
        rekap: {
          grandTotal,
          grandTotalMapel,
          rataRata,
          nilaiPrestasi,
          predikat,
          izinTotal,
          tanpaIzinTotal
        },
        detailMapel
      }
    });
  } catch (error) {
    console.error('Error fetching rekap:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};
