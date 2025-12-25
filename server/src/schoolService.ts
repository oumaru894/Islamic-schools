import db from './database';

export interface LeadershipMember {
  id?: number;
  name: string;
  title: string;
  bio?: string;
  photo?: string;
  displayOrder?: number;
}

export interface School {
  id: string;
  name: string;
  type: string;
  county: string;
  location: string;
  description: string;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  founded: number;
  students: number;
  rating: number;
  image: string;
  heroImage?: string;
  logo?: string;
  theme?: Record<string, any> | string;
  testimonials?: Array<{ id?: number; author?: string; title?: string; text: string; createdAt?: string }>;
  gallery?: Array<{ id?: number; url: string; caption?: string; createdAt?: string }>;
  website?: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  features: string[];
  leadership?: LeadershipMember[];
}

export async function getAllSchools(): Promise<School[]> {
  if (db.isPostgres) {
    const schools = await db.prepare(`
      SELECT * FROM schools
      ORDER BY name
    `).all() as any[];

    const results: School[] = [];
    for (const school of schools) {
      const contact = await db.prepare(`SELECT email, phone, address FROM school_contacts WHERE school_id = ?`).get(school.id) as any;
      const features = await db.prepare(`SELECT feature FROM school_features WHERE school_id = ?`).all(school.id) as any[];
      const leadership = await db.prepare(`SELECT id, name, title, bio, photo, display_order as "displayOrder" FROM school_leadership WHERE school_id = ? ORDER BY display_order, name`).all(school.id) as any[];
      const testimonials = await db.prepare(`SELECT id, author, title, text, created_at as "createdAt" FROM school_testimonials WHERE school_id = ? ORDER BY created_at DESC`).all(school.id) as any[];
      const gallery = await db.prepare(`SELECT id, url, caption, created_at as "createdAt" FROM school_gallery WHERE school_id = ? ORDER BY created_at DESC`).all(school.id) as any[];

      results.push({
        ...school,
        heroImage: (school.hero_image as string) || undefined,
        logo: (school.logo as string) || undefined,
        theme: (() => {
          try { return school.theme ? JSON.parse(school.theme) : undefined; } catch { return school.theme || undefined; }
        })(),
        coreValues: (() => { try { return school.core_values ? JSON.parse(school.core_values) : undefined; } catch { return undefined; } })(),
        contact: { email: contact?.email || '', phone: contact?.phone || '', address: contact?.address || '' },
        features: features.map(f => f.feature),
        leadership: leadership.length > 0 ? leadership : undefined,
        testimonials: testimonials.length > 0 ? testimonials.map(t => ({ id: t.id, author: t.author, title: t.title, text: t.text, createdAt: t.createdAt })) : undefined,
        gallery: gallery.length > 0 ? gallery.map(g => ({ id: g.id, url: g.url, caption: g.caption, createdAt: g.createdAt })) : undefined
      });
    }
    return results;
  }

  // sqlite sync path
  const schools = db.prepare(`
    SELECT * FROM schools
    ORDER BY name
  `).all() as any[];

  return schools.map(school => {
    const contact = db.prepare(`SELECT email, phone, address FROM school_contacts WHERE school_id = ?`).get(school.id) as any;
    const features = db.prepare(`SELECT feature FROM school_features WHERE school_id = ?`).all(school.id) as any[];
    const leadership = db.prepare(`SELECT id, name, title, bio, photo, display_order as displayOrder FROM school_leadership WHERE school_id = ? ORDER BY display_order, name`).all(school.id) as any[];
    const testimonials = db.prepare(`SELECT id, author, title, text, created_at as createdAt FROM school_testimonials WHERE school_id = ? ORDER BY created_at DESC`).all(school.id) as any[];
    const gallery = db.prepare(`SELECT id, url, caption, created_at as createdAt FROM school_gallery WHERE school_id = ? ORDER BY created_at DESC`).all(school.id) as any[];

    return {
      ...school,
      heroImage: (school.hero_image as string) || undefined,
      logo: (school.logo as string) || undefined,
      theme: (() => { try { return school.theme ? JSON.parse(school.theme) : undefined; } catch { return school.theme || undefined; } })(),
      coreValues: (() => { try { return school.core_values ? JSON.parse(school.core_values) : undefined; } catch { return undefined; } })(),
      contact: { email: contact?.email || '', phone: contact?.phone || '', address: contact?.address || '' },
      features: features.map(f => f.feature),
      leadership: leadership.length > 0 ? leadership : undefined,
      testimonials: testimonials.length > 0 ? testimonials.map(t => ({ id: t.id, author: t.author, title: t.title, text: t.text, createdAt: t.createdAt })) : undefined,
      gallery: gallery.length > 0 ? gallery.map(g => ({ id: g.id, url: g.url, caption: g.caption, createdAt: g.createdAt })) : undefined
    };
  });
}

export async function getSchoolById(id: string): Promise<School | null> {
  if (db.isPostgres) {
    const school = await db.prepare(`SELECT * FROM schools WHERE id = ?`).get(id) as any;
    if (!school) return null;
    const contact = await db.prepare(`SELECT email, phone, address FROM school_contacts WHERE school_id = ?`).get(id) as any;
    const features = await db.prepare(`SELECT feature FROM school_features WHERE school_id = ?`).all(id) as any[];
    const leadership = await db.prepare(`SELECT id, name, title, bio, photo, display_order as "displayOrder" FROM school_leadership WHERE school_id = ? ORDER BY display_order, name`).all(id) as any[];
    const testimonials = await db.prepare(`SELECT id, author, title, text, created_at as "createdAt" FROM school_testimonials WHERE school_id = ? ORDER BY created_at DESC`).all(id) as any[];
    const gallery = await db.prepare(`SELECT id, url, caption, created_at as "createdAt" FROM school_gallery WHERE school_id = ? ORDER BY created_at DESC`).all(id) as any[];
    return {
      ...school,
      heroImage: (school.hero_image as string) || undefined,
      logo: (school.logo as string) || undefined,
      theme: (() => { try { return school.theme ? JSON.parse(school.theme) : undefined; } catch { return school.theme || undefined; } })(),
      coreValues: (() => { try { return school.core_values ? JSON.parse(school.core_values) : undefined; } catch { return undefined; } })(),
      contact: { email: contact?.email || '', phone: contact?.phone || '', address: contact?.address || '' },
      features: features.map(f => f.feature),
      leadership: leadership.length > 0 ? leadership : undefined,
      testimonials: testimonials.length > 0 ? testimonials.map(t => ({ id: t.id, author: t.author, title: t.title, text: t.text, createdAt: t.createdAt })) : undefined,
      gallery: gallery.length > 0 ? gallery.map(g => ({ id: g.id, url: g.url, caption: g.caption, createdAt: g.createdAt })) : undefined
    };
  }

  const school = db.prepare(`SELECT * FROM schools WHERE id = ?`).get(id) as any;
  if (!school) return null;
  const contact = db.prepare(`SELECT email, phone, address FROM school_contacts WHERE school_id = ?`).get(id) as any;
  const features = db.prepare(`SELECT feature FROM school_features WHERE school_id = ?`).all(id) as any[];
  const leadership = db.prepare(`SELECT id, name, title, bio, photo, display_order as displayOrder FROM school_leadership WHERE school_id = ? ORDER BY display_order, name`).all(id) as any[];
  const testimonials = db.prepare(`SELECT id, author, title, text, created_at as createdAt FROM school_testimonials WHERE school_id = ? ORDER BY created_at DESC`).all(id) as any[];
  const gallery = db.prepare(`SELECT id, url, caption, created_at as createdAt FROM school_gallery WHERE school_id = ? ORDER BY created_at DESC`).all(id) as any[];
  return {
    ...school,
    heroImage: (school.hero_image as string) || undefined,
    logo: (school.logo as string) || undefined,
    theme: (() => { try { return school.theme ? JSON.parse(school.theme) : undefined; } catch { return school.theme || undefined; } })(),
    coreValues: (() => { try { return school.core_values ? JSON.parse(school.core_values) : undefined; } catch { return undefined; } })(),
    contact: { email: contact?.email || '', phone: contact?.phone || '', address: contact?.address || '' },
    features: features.map(f => f.feature),
    leadership: leadership.length > 0 ? leadership : undefined,
    testimonials: testimonials.length > 0 ? testimonials.map(t => ({ id: t.id, author: t.author, title: t.title, text: t.text, createdAt: t.createdAt })) : undefined,
    gallery: gallery.length > 0 ? gallery.map(g => ({ id: g.id, url: g.url, caption: g.caption, createdAt: g.createdAt })) : undefined
  };
}

export async function searchSchools(query: string): Promise<School[]> {
  const q = `%${query.toLowerCase()}%`;
  if (db.isPostgres) {
    const schools = await db.prepare(`SELECT * FROM schools WHERE LOWER(name) LIKE ? OR LOWER(location) LIKE ? OR LOWER(type) LIKE ? ORDER BY name`).all(q, q, q) as any[];
    const results: School[] = [];
    for (const school of schools) {
      const contact = await db.prepare(`SELECT email, phone, address FROM school_contacts WHERE school_id = ?`).get(school.id) as any;
      const features = await db.prepare(`SELECT feature FROM school_features WHERE school_id = ?`).all(school.id) as any[];
      const leadership = await db.prepare(`SELECT id, name, title, bio, photo, display_order as "displayOrder" FROM school_leadership WHERE school_id = ? ORDER BY display_order, name`).all(school.id) as any[];
      results.push({ ...school, contact: { email: contact?.email || '', phone: contact?.phone || '', address: contact?.address || '' }, features: features.map(f => f.feature), leadership: leadership.length > 0 ? leadership : undefined });
    }
    return results;
  }

  const schools = db.prepare(`SELECT * FROM schools WHERE LOWER(name) LIKE ? OR LOWER(location) LIKE ? OR LOWER(type) LIKE ? ORDER BY name`).all(q, q, q) as any[];
  return schools.map(school => {
    const contact = db.prepare(`SELECT email, phone, address FROM school_contacts WHERE school_id = ?`).get(school.id) as any;
    const features = db.prepare(`SELECT feature FROM school_features WHERE school_id = ?`).all(school.id) as any[];
    const leadership = db.prepare(`SELECT id, name, title, bio, photo, display_order as displayOrder FROM school_leadership WHERE school_id = ? ORDER BY display_order, name`).all(school.id) as any[];
    return { ...school, contact: { email: contact?.email || '', phone: contact?.phone || '', address: contact?.address || '' }, features: features.map(f => f.feature), leadership: leadership.length > 0 ? leadership : undefined };
  });
}

export async function createSchool(schoolData: Omit<School, 'id'> & { id?: string }): Promise<School> {
  const id = schoolData.id || String(Date.now());
  if (db.isPostgres) {
    // Use a transaction client
    await db.transaction(async (client: any) => {
      // insert school
      await client.query(`INSERT INTO schools (id, name, type, county, location, description, mission, vision, core_values, founded, students, rating, image, website, hero_image, logo, theme) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`, [
        id, schoolData.name, schoolData.type, schoolData.county, schoolData.location, schoolData.description, schoolData.mission || null, schoolData.vision || null, schoolData.coreValues ? JSON.stringify(schoolData.coreValues) : null, schoolData.founded, schoolData.students, schoolData.rating, schoolData.image, schoolData.website || null, (schoolData.heroImage as string) || null, (schoolData.logo as string) || null, schoolData.theme ? JSON.stringify(schoolData.theme) : null
      ]);

      await client.query(`INSERT INTO school_contacts (school_id, email, phone, address) VALUES ($1,$2,$3,$4)`, [id, schoolData.contact.email, schoolData.contact.phone, schoolData.contact.address]);

      for (const feature of schoolData.features) {
        await client.query(`INSERT INTO school_features (school_id, feature) VALUES ($1,$2)`, [id, feature]);
      }

      if (schoolData.leadership && schoolData.leadership.length > 0) {
        for (const [index, member] of schoolData.leadership.entries()) {
          await client.query(`INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order) VALUES ($1,$2,$3,$4,$5,$6)`, [id, member.name, member.title, member.bio || null, member.photo || null, member.displayOrder ?? index]);
        }
      }

      if ((schoolData as any).testimonials && (schoolData as any).testimonials.length > 0) {
        for (const t of (schoolData as any).testimonials) {
          await client.query(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES ($1,$2,$3,$4)`, [id, t.author || null, t.title || null, t.text]);
        }
      }
    });
    return (await getSchoolById(id))!;
  }

  // sqlite path
  const insertSchool = db.prepare(`INSERT INTO schools (id, name, type, county, location, description, mission, vision, core_values, founded, students, rating, image, website, hero_image, logo, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertContact = db.prepare(`INSERT INTO school_contacts (school_id, email, phone, address) VALUES (?, ?, ?, ?)`);
  const insertFeature = db.prepare(`INSERT INTO school_features (school_id, feature) VALUES (?, ?)`);
  const insertLeadership = db.prepare(`INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order) VALUES (?, ?, ?, ?, ?, ?)`);
  const createSchoolTransaction = db.transaction(() => {
    insertSchool.run(id, schoolData.name, schoolData.type, schoolData.county, schoolData.location, schoolData.description, schoolData.mission || null, schoolData.vision || null, schoolData.coreValues ? JSON.stringify(schoolData.coreValues) : null, schoolData.founded, schoolData.students, schoolData.rating, schoolData.image, schoolData.website || null, (schoolData.heroImage as string) || null, (schoolData.logo as string) || null, schoolData.theme ? JSON.stringify(schoolData.theme) : null);
    insertContact.run(id, schoolData.contact.email, schoolData.contact.phone, schoolData.contact.address);
    for (const feature of schoolData.features) insertFeature.run(id, feature);
    if (schoolData.leadership && schoolData.leadership.length > 0) {
      schoolData.leadership.forEach((member, index) => insertLeadership.run(id, member.name, member.title, member.bio || null, member.photo || null, member.displayOrder ?? index));
    }
    if ((schoolData as any).testimonials && (schoolData as any).testimonials.length > 0) {
      const insertTestimonial = db.prepare(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ?)`);
      for (const t of (schoolData as any).testimonials) insertTestimonial.run(id, t.author || null, t.title || null, t.text);
    }
  });
  createSchoolTransaction();
  return (await getSchoolById(id))!;
}

export async function updateSchool(id: string, schoolData: Partial<School>): Promise<School | null> {
  const existing = await getSchoolById(id);
  if (!existing) return null;
  if (db.isPostgres) {
    await db.transaction(async (client: any) => {
      const updated = { ...existing, ...schoolData } as any;
      await client.query(`UPDATE schools SET name=$1, type=$2, county=$3, location=$4, description=$5, mission=$6, vision=$7, founded=$8, students=$9, rating=$10, image=$11, website=$12, updated_at = CURRENT_TIMESTAMP WHERE id=$13`, [updated.name, updated.type, updated.county, updated.location, updated.description, updated.mission || null, updated.vision || null, updated.founded, updated.students, updated.rating, updated.image, updated.website || null, id]);
      if (schoolData.heroImage !== undefined || schoolData.logo !== undefined || schoolData.theme !== undefined || schoolData.coreValues !== undefined) {
        const setTheme = schoolData.theme ? JSON.stringify(schoolData.theme) : null;
        const setCore = schoolData.coreValues ? JSON.stringify(schoolData.coreValues) : null;
        await client.query(`UPDATE schools SET hero_image=$1, logo=$2, theme=$3, core_values=$4 WHERE id=$5`, [schoolData.heroImage || null, schoolData.logo || null, setTheme, setCore, id]);
      }
      if (schoolData.contact) {
        await client.query(`UPDATE school_contacts SET email=$1, phone=$2, address=$3 WHERE school_id=$4`, [updated.contact.email, updated.contact.phone, updated.contact.address, id]);
      }
      if (schoolData.features) {
        await client.query(`DELETE FROM school_features WHERE school_id=$1`, [id]);
        for (const feature of updated.features) await client.query(`INSERT INTO school_features (school_id, feature) VALUES ($1,$2)`, [id, feature]);
      }
      if (schoolData.leadership !== undefined) {
        await client.query(`DELETE FROM school_leadership WHERE school_id=$1`, [id]);
        if (schoolData.leadership && schoolData.leadership.length > 0) {
          for (const [index, member] of schoolData.leadership.entries()) {
            await client.query(`INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order) VALUES ($1,$2,$3,$4,$5,$6)`, [id, member.name, member.title, member.bio || null, member.photo || null, member.displayOrder ?? index]);
          }
        }
      }
      if ((schoolData as any).testimonials !== undefined) {
        await client.query(`DELETE FROM school_testimonials WHERE school_id=$1`, [id]);
        if ((schoolData as any).testimonials && (schoolData as any).testimonials.length > 0) {
          for (const t of (schoolData as any).testimonials) await client.query(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES ($1,$2,$3,$4)`, [id, t.author || null, t.title || null, t.text]);
        }
      }
    });
    return await getSchoolById(id);
  }

  const updateSchool = db.prepare(`UPDATE schools SET name = ?, type = ?, county = ?, location = ?, description = ?, mission = ?, vision = ?, founded = ?, students = ?, rating = ?, image = ?, website = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
  const updateContact = db.prepare(`UPDATE school_contacts SET email = ?, phone = ?, address = ? WHERE school_id = ?`);
  const deleteFeatures = db.prepare(`DELETE FROM school_features WHERE school_id = ?`);
  const insertFeature = db.prepare(`INSERT INTO school_features (school_id, feature) VALUES (?, ?)`);
  const deleteLeadership = db.prepare(`DELETE FROM school_leadership WHERE school_id = ?`);
  const insertLeadership = db.prepare(`INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order) VALUES (?, ?, ?, ?, ?, ?)`);
  const updateSchoolTransaction = db.transaction(() => {
    const updated = { ...existing, ...schoolData } as any;
    updateSchool.run(updated.name, updated.type, updated.county, updated.location, updated.description, updated.mission || null, updated.vision || null, updated.founded, updated.students, updated.rating, updated.image, updated.website || null, id);
    if (schoolData.heroImage !== undefined || schoolData.logo !== undefined || schoolData.theme !== undefined || schoolData.coreValues !== undefined) {
      const setTheme = schoolData.theme ? JSON.stringify(schoolData.theme) : null;
      const setCore = schoolData.coreValues ? JSON.stringify(schoolData.coreValues) : null;
      db.prepare(`UPDATE schools SET hero_image = ?, logo = ?, theme = ?, core_values = ? WHERE id = ?`).run(schoolData.heroImage || null, schoolData.logo || null, setTheme, setCore, id);
    }
    if (schoolData.contact) updateContact.run(updated.contact.email, updated.contact.phone, updated.contact.address, id);
    if (schoolData.features) { deleteFeatures.run(id); for (const feature of updated.features) insertFeature.run(id, feature); }
    if (schoolData.leadership !== undefined) { deleteLeadership.run(id); if (schoolData.leadership && schoolData.leadership.length > 0) schoolData.leadership.forEach((member, index) => insertLeadership.run(id, member.name, member.title, member.bio || null, member.photo || null, member.displayOrder ?? index)); }
    if ((schoolData as any).testimonials !== undefined) { const deleteTestimonials = db.prepare(`DELETE FROM school_testimonials WHERE school_id = ?`); deleteTestimonials.run(id); if ((schoolData as any).testimonials && (schoolData as any).testimonials.length > 0) { const insertTestimonial = db.prepare(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ?)`); for (const t of (schoolData as any).testimonials) insertTestimonial.run(id, t.author || null, t.title || null, t.text); } }
  });
  updateSchoolTransaction();
  return await getSchoolById(id);
}

export async function deleteSchool(id: string): Promise<boolean> {
  const school = await getSchoolById(id);
  if (!school) return false;
  if (db.isPostgres) {
    await db.prepare(`DELETE FROM schools WHERE id = ?`).run(id);
    return true;
  }
  const deleteSchoolStmt = db.prepare(`DELETE FROM schools WHERE id = ?`);
  deleteSchoolStmt.run(id);
  return true;
}

// --- Gallery helpers ---
export async function addGalleryItem(schoolId: string, url: string, caption?: string) {
  if (db.isPostgres) {
    const info = await db.prepare(`INSERT INTO school_gallery (school_id, url, caption) VALUES (?, ?, ?)`).run(schoolId, url, caption || null);
    const row = await db.prepare(`SELECT id, url, caption, created_at as "createdAt" FROM school_gallery WHERE id = ?`).get(info.lastInsertRowid);
    return row;
  }
  const stmt = db.prepare(`INSERT INTO school_gallery (school_id, url, caption) VALUES (?, ?, ?)`);
  const info = stmt.run(schoolId, url, caption || null);
  const row = db.prepare(`SELECT id, url, caption, created_at as createdAt FROM school_gallery WHERE id = ?`).get(info.lastInsertRowid);
  return row;
}

export async function deleteGalleryItem(id: number) {
  if (db.isPostgres) {
    const info = await db.prepare(`DELETE FROM school_gallery WHERE id = ?`).run(id);
    return info.changes > 0;
  }
  const stmt = db.prepare(`DELETE FROM school_gallery WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}

// --- Leadership helpers ---
export async function addLeadershipMember(schoolId: string, name: string, title: string, bio?: string, photo?: string, displayOrder?: number) {
  if (db.isPostgres) {
    const info = await db.prepare(`INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order) VALUES (?, ?, ?, ?, ?, ?)`).run(schoolId, name, title, bio || null, photo || null, displayOrder || 0);
    const row = await db.prepare(`SELECT id, name, title, bio, photo, display_order as "displayOrder" FROM school_leadership WHERE id = ?`).get(info.lastInsertRowid);
    return row;
  }
  const stmt = db.prepare(`INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order) VALUES (?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(schoolId, name, title, bio || null, photo || null, displayOrder || 0);
  const row = db.prepare(`SELECT id, name, title, bio, photo, display_order as displayOrder FROM school_leadership WHERE id = ?`).get(info.lastInsertRowid);
  return row;
}

export async function updateLeadershipMember(id: number, updates: Partial<{ name: string; title: string; bio: string; photo: string; displayOrder: number }>) {
  if (db.isPostgres) {
    const existing = await db.prepare(`SELECT id FROM school_leadership WHERE id = ?`).get(id);
    if (!existing) return null;
    const fields: string[] = [];
    const vals: any[] = [];
    if (updates.name !== undefined) { fields.push('name = $' + (vals.length + 1)); vals.push(updates.name); }
    if (updates.title !== undefined) { fields.push('title = $' + (vals.length + 1)); vals.push(updates.title); }
    if (updates.bio !== undefined) { fields.push('bio = $' + (vals.length + 1)); vals.push(updates.bio); }
    if (updates.photo !== undefined) { fields.push('photo = $' + (vals.length + 1)); vals.push(updates.photo); }
    if (updates.displayOrder !== undefined) { fields.push('display_order = $' + (vals.length + 1)); vals.push(updates.displayOrder); }
    if (fields.length === 0) return await getLeadershipById(id);
    vals.push(id);
    // build param placeholders for WHERE
    const setSql = fields.join(', ');
    await db.prepare(`UPDATE school_leadership SET ${setSql} WHERE id = ?`).run(...vals);
    return await getLeadershipById(id);
  }
  const existing = db.prepare(`SELECT id FROM school_leadership WHERE id = ?`).get(id);
  if (!existing) return null;
  const fields: string[] = [];
  const vals: any[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); vals.push(updates.name); }
  if (updates.title !== undefined) { fields.push('title = ?'); vals.push(updates.title); }
  if (updates.bio !== undefined) { fields.push('bio = ?'); vals.push(updates.bio); }
  if (updates.photo !== undefined) { fields.push('photo = ?'); vals.push(updates.photo); }
  if (updates.displayOrder !== undefined) { fields.push('display_order = ?'); vals.push(updates.displayOrder); }
  if (fields.length === 0) return getLeadershipById(id);
  vals.push(id);
  db.prepare(`UPDATE school_leadership SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  return getLeadershipById(id);
}

export async function deleteLeadershipMember(id: number) {
  if (db.isPostgres) {
    const info = await db.prepare(`DELETE FROM school_leadership WHERE id = ?`).run(id);
    return info.changes > 0;
  }
  const stmt = db.prepare(`DELETE FROM school_leadership WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}

export async function getLeadershipById(id: number) {
  if (db.isPostgres) return await db.prepare(`SELECT id, name, title, bio, photo, display_order as "displayOrder" FROM school_leadership WHERE id = ?`).get(id);
  return db.prepare(`SELECT id, name, title, bio, photo, display_order as displayOrder FROM school_leadership WHERE id = ?`).get(id);
}

// --- People helpers (consolidated staff/administrators used by Administrator component) ---
export async function getPeopleBySchool(schoolId: string) {
  if (db.isPostgres) return await db.prepare(`SELECT id, name, role, bio, image, display_order as "displayOrder" FROM people WHERE school_id = ? ORDER BY display_order, name`).all(schoolId) as any[];
  return db.prepare(`SELECT id, name, role, bio, image, display_order as displayOrder FROM people WHERE school_id = ? ORDER BY display_order, name`).all(schoolId) as any[];
}

export async function getPersonById(id: number) {
  if (db.isPostgres) return await db.prepare(`SELECT id, school_id, name, role, bio, image, display_order as "displayOrder" FROM people WHERE id = ?`).get(id);
  return db.prepare(`SELECT id, school_id, name, role, bio, image, display_order as displayOrder FROM people WHERE id = ?`).get(id);
}

export async function addPerson(schoolId: string, name: string, role: string, bio?: string, image?: string, displayOrder?: number) {
  if (db.isPostgres) {
    const info = await db.prepare(`INSERT INTO people (school_id, name, role, bio, image, display_order) VALUES (?, ?, ?, ?, ?, ?)`).run(schoolId, name, role, bio || null, image || null, displayOrder || 0);
    return await getPersonById(info.lastInsertRowid as number);
  }
  const stmt = db.prepare(`INSERT INTO people (school_id, name, role, bio, image, display_order) VALUES (?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(schoolId, name, role, bio || null, image || null, displayOrder || 0);
  return getPersonById(info.lastInsertRowid as number);
}

export async function updatePerson(id: number, updates: Partial<{ name: string; role: string; bio: string; image: string; displayOrder: number }>) {
  if (db.isPostgres) {
    const existing = await getPersonById(id);
    if (!existing) return null;
    const fields: string[] = [];
    const vals: any[] = [];
    if (updates.name !== undefined) { fields.push('name = $' + (vals.length + 1)); vals.push(updates.name); }
    if (updates.role !== undefined) { fields.push('role = $' + (vals.length + 1)); vals.push(updates.role); }
    if (updates.bio !== undefined) { fields.push('bio = $' + (vals.length + 1)); vals.push(updates.bio); }
    if (updates.image !== undefined) { fields.push('image = $' + (vals.length + 1)); vals.push(updates.image); }
    if (updates.displayOrder !== undefined) { fields.push('display_order = $' + (vals.length + 1)); vals.push(updates.displayOrder); }
    if (fields.length === 0) return await getPersonById(id);
    vals.push(id);
    await db.prepare(`UPDATE people SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
    return await getPersonById(id);
  }
  const existing = getPersonById(id);
  if (!existing) return null;
  const fields: string[] = [];
  const vals: any[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); vals.push(updates.name); }
  if (updates.role !== undefined) { fields.push('role = ?'); vals.push(updates.role); }
  if (updates.bio !== undefined) { fields.push('bio = ?'); vals.push(updates.bio); }
  if (updates.image !== undefined) { fields.push('image = ?'); vals.push(updates.image); }
  if (updates.displayOrder !== undefined) { fields.push('display_order = ?'); vals.push(updates.displayOrder); }
  if (fields.length === 0) return getPersonById(id);
  vals.push(id);
  db.prepare(`UPDATE people SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  return getPersonById(id);
}

export async function deletePerson(id: number) {
  if (db.isPostgres) {
    const info = await db.prepare(`DELETE FROM people WHERE id = ?`).run(id);
    return info.changes > 0;
  }
  const stmt = db.prepare(`DELETE FROM people WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}


