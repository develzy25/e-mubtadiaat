import { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq, desc } from 'drizzle-orm';

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

// --- BLOK ---
export const getBlokList = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.blok).orderBy(desc(schema.blok.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const createBlok = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { name, recordedBy = 'admin-system' } = body;
    
    const id = `blk_${crypto.randomUUID()}`;
    const newRecord = { id, name };
    
    await db.insert(schema.blok).values(newRecord);
    await logAudit(db, recordedBy, 'CREATE_BLOK', 'blok', id, null, newRecord);
    
    return c.json({ success: true, data: newRecord });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const updateBlok = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const body = await c.req.json();
    const { name, recordedBy = 'admin-system' } = body;
    
    const old = await db.select().from(schema.blok).where(eq(schema.blok.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.update(schema.blok).set({ name }).where(eq(schema.blok.id, id));
    await logAudit(db, recordedBy, 'UPDATE_BLOK', 'blok', id, old, { ...old, name });
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const deleteBlok = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const { recordedBy = 'admin-system' } = await c.req.json().catch(() => ({}));
    
    const old = await db.select().from(schema.blok).where(eq(schema.blok.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.delete(schema.blok).where(eq(schema.blok.id, id));
    await logAudit(db, recordedBy, 'DELETE_BLOK', 'blok', id, old, null);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

// --- KAMAR ---
export const getKamarList = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.kamar).orderBy(desc(schema.kamar.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const createKamar = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { name, blokId, penasihat, recordedBy = 'admin-system' } = body;
    
    const id = `kmr_${crypto.randomUUID()}`;
    const newRecord = { id, name, blokId, penasihat };
    
    await db.insert(schema.kamar).values(newRecord);
    await logAudit(db, recordedBy, 'CREATE_KAMAR', 'kamar', id, null, newRecord);
    
    return c.json({ success: true, data: newRecord });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const updateKamar = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const body = await c.req.json();
    const { name, blokId, penasihat, recordedBy = 'admin-system' } = body;
    
    const old = await db.select().from(schema.kamar).where(eq(schema.kamar.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.update(schema.kamar).set({ name, blokId, penasihat }).where(eq(schema.kamar.id, id));
    await logAudit(db, recordedBy, 'UPDATE_KAMAR', 'kamar', id, old, { ...old, name, blokId, penasihat });
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const deleteKamar = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const { recordedBy = 'admin-system' } = await c.req.json().catch(() => ({}));
    
    const old = await db.select().from(schema.kamar).where(eq(schema.kamar.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.delete(schema.kamar).where(eq(schema.kamar.id, id));
    await logAudit(db, recordedBy, 'DELETE_KAMAR', 'kamar', id, old, null);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

// --- JENJANG ---
export const getJenjangList = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.jenjang).orderBy(desc(schema.jenjang.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const createJenjang = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { name, mundzirName, recordedBy = 'admin-system' } = body;
    
    const id = `jen_${crypto.randomUUID()}`;
    const newRecord = { id, name, mundzirName };
    
    await db.insert(schema.jenjang).values(newRecord);
    await logAudit(db, recordedBy, 'CREATE_JENJANG', 'jenjang', id, null, newRecord);
    
    return c.json({ success: true, data: newRecord });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const updateJenjang = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const body = await c.req.json();
    const { name, mundzirName, recordedBy = 'admin-system' } = body;
    
    const old = await db.select().from(schema.jenjang).where(eq(schema.jenjang.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.update(schema.jenjang).set({ name, mundzirName }).where(eq(schema.jenjang.id, id));
    await logAudit(db, recordedBy, 'UPDATE_JENJANG', 'jenjang', id, old, { ...old, name, mundzirName });
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const deleteJenjang = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const { recordedBy = 'admin-system' } = await c.req.json().catch(() => ({}));
    
    const old = await db.select().from(schema.jenjang).where(eq(schema.jenjang.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.delete(schema.jenjang).where(eq(schema.jenjang.id, id));
    await logAudit(db, recordedBy, 'DELETE_JENJANG', 'jenjang', id, old, null);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

// --- TINGKAT ---
export const getTingkatList = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.tingkat).orderBy(desc(schema.tingkat.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const createTingkat = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { jenjangId, jenjangName, romanName, mufatishName, targetNadzom, targetBait, hasPraktek, praktekSubjects, recordedBy = 'admin-system' } = body;
    
    const id = `tkt_${crypto.randomUUID()}`;
    const newRecord = { id, jenjangId, jenjangName, romanName, mufatishName, targetNadzom, targetBait, hasPraktek, praktekSubjects: praktekSubjects ? JSON.stringify(praktekSubjects) : null };
    
    await db.insert(schema.tingkat).values(newRecord);
    await logAudit(db, recordedBy, 'CREATE_TINGKAT', 'tingkat', id, null, newRecord);
    
    return c.json({ success: true, data: newRecord });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const updateTingkat = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const body = await c.req.json();
    const { jenjangId, jenjangName, romanName, mufatishName, targetNadzom, targetBait, hasPraktek, praktekSubjects, recordedBy = 'admin-system' } = body;
    
    const old = await db.select().from(schema.tingkat).where(eq(schema.tingkat.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    const updateData = { jenjangId, jenjangName, romanName, mufatishName, targetNadzom, targetBait, hasPraktek, praktekSubjects: praktekSubjects ? JSON.stringify(praktekSubjects) : null };
    await db.update(schema.tingkat).set(updateData).where(eq(schema.tingkat.id, id));
    await logAudit(db, recordedBy, 'UPDATE_TINGKAT', 'tingkat', id, old, { ...old, ...updateData });
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const deleteTingkat = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const { recordedBy = 'admin-system' } = await c.req.json().catch(() => ({}));
    
    const old = await db.select().from(schema.tingkat).where(eq(schema.tingkat.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.delete(schema.tingkat).where(eq(schema.tingkat.id, id));
    await logAudit(db, recordedBy, 'DELETE_TINGKAT', 'tingkat', id, old, null);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

// --- KELAS (BAGIAN) ---
export const getKelasList = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.kelasRefs).orderBy(desc(schema.kelasRefs.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const createKelas = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { name, level, mustahiqId, jenjangName, tingkatName, bagian, lokal, munawwibNames, recordedBy = 'admin-system' } = body;
    
    const id = `kls_${crypto.randomUUID()}`;
    const newRecord = { 
      id, name, level, 
      mustahiqId: mustahiqId || 'unassigned',
      jenjangName, tingkatName, bagian, lokal, 
      munawwibNames: munawwibNames ? JSON.stringify(munawwibNames) : null
    };
    
    await db.insert(schema.kelasRefs).values(newRecord);
    await logAudit(db, recordedBy, 'CREATE_KELAS', 'kelas_refs', id, null, newRecord);
    
    return c.json({ success: true, data: newRecord });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const updateKelas = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const body = await c.req.json();
    const { name, level, mustahiqId, jenjangName, tingkatName, bagian, lokal, munawwibNames, recordedBy = 'admin-system' } = body;
    
    const old = await db.select().from(schema.kelasRefs).where(eq(schema.kelasRefs.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    const updateData = { 
      name, level, mustahiqId,
      jenjangName, tingkatName, bagian, lokal,
      munawwibNames: munawwibNames ? JSON.stringify(munawwibNames) : null
    };
    
    await db.update(schema.kelasRefs).set(updateData).where(eq(schema.kelasRefs.id, id));
    await logAudit(db, recordedBy, 'UPDATE_KELAS', 'kelas_refs', id, old, { ...old, ...updateData });
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const deleteKelas = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const { recordedBy = 'admin-system' } = await c.req.json().catch(() => ({}));
    
    const old = await db.select().from(schema.kelasRefs).where(eq(schema.kelasRefs.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.delete(schema.kelasRefs).where(eq(schema.kelasRefs.id, id));
    await logAudit(db, recordedBy, 'DELETE_KELAS', 'kelas_refs', id, old, null);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

// --- KITAB ---
export const getKitabList = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const list = await db.select().from(schema.kitabRefs).orderBy(desc(schema.kitabRefs.createdAt));
    return c.json({ success: true, data: list });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const createKitab = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const body = await c.req.json();
    const { name, description, jenjangName, tingkatName, fanIlmu, pengajar, waktu, recordedBy = 'admin-system' } = body;
    
    const id = `ktb_${crypto.randomUUID()}`;
    const newRecord = { id, name, description, jenjangName, tingkatName, fanIlmu, pengajar, waktu };
    
    await db.insert(schema.kitabRefs).values(newRecord);
    await logAudit(db, recordedBy, 'CREATE_KITAB', 'kitab_refs', id, null, newRecord);
    
    return c.json({ success: true, data: newRecord });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const updateKitab = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const body = await c.req.json();
    const { name, description, jenjangName, tingkatName, fanIlmu, pengajar, waktu, recordedBy = 'admin-system' } = body;
    
    const old = await db.select().from(schema.kitabRefs).where(eq(schema.kitabRefs.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    const updateData = { name, description, jenjangName, tingkatName, fanIlmu, pengajar, waktu };
    await db.update(schema.kitabRefs).set(updateData).where(eq(schema.kitabRefs.id, id));
    await logAudit(db, recordedBy, 'UPDATE_KITAB', 'kitab_refs', id, old, { ...old, ...updateData });
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const deleteKitab = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB, { schema });
    const id = c.req.param('id') as string;
    const { recordedBy = 'admin-system' } = await c.req.json().catch(() => ({}));
    
    const old = await db.select().from(schema.kitabRefs).where(eq(schema.kitabRefs.id, id)).get();
    if (!old) return c.json({ success: false, message: 'Not found' }, 404);

    await db.delete(schema.kitabRefs).where(eq(schema.kitabRefs.id, id));
    await logAudit(db, recordedBy, 'DELETE_KITAB', 'kitab_refs', id, old, null);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};
