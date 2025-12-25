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

export function getAllSchools(): School[] {
  const schools = db.prepare(`
    SELECT * FROM schools
    ORDER BY name
  `).all() as any[];

  return schools.map(school => {
    const contact = db.prepare(`
      SELECT email, phone, address FROM school_contacts WHERE school_id = ?
    `).get(school.id) as any;

    const features = db.prepare(`
      SELECT feature FROM school_features WHERE school_id = ?
    `).all(school.id) as any[];

    const leadership = db.prepare(`
      SELECT id, name, title, bio, photo, display_order as displayOrder
      FROM school_leadership 
      WHERE school_id = ?
      ORDER BY display_order, name
    `).all(school.id) as any[];

    const testimonials = db.prepare(`
      SELECT id, author, title, text, created_at as createdAt
      FROM school_testimonials
      WHERE school_id = ?
      ORDER BY created_at DESC
    `).all(school.id) as any[];

    const gallery = db.prepare(`
      SELECT id, url, caption, created_at as createdAt
      FROM school_gallery
      WHERE school_id = ?
      ORDER BY created_at DESC
    `).all(school.id) as any[];

    return {
      ...school,
      heroImage: (school.hero_image as string) || undefined,
      logo: (school.logo as string) || undefined,
      theme: (() => {
        try {
          return school.theme ? JSON.parse(school.theme) : undefined;
        } catch (e) {
          return school.theme || undefined;
        }
      })(),
      coreValues: (() => {
        try {
          return school.core_values ? JSON.parse(school.core_values) : undefined;
        } catch (e) {
          return undefined;
        }
      })(),
      contact: {
        email: contact?.email || '',
        phone: contact?.phone || '',
        address: contact?.address || ''
      },
      features: features.map(f => f.feature),
      leadership: leadership.length > 0 ? leadership : undefined,
      testimonials: testimonials.length > 0 ? testimonials.map(t => ({ id: t.id, author: t.author, title: t.title, text: t.text, createdAt: t.createdAt })) : undefined
  ,
  gallery: gallery.length > 0 ? gallery.map(g => ({ id: g.id, url: g.url, caption: g.caption, createdAt: g.createdAt })) : undefined
    };
  });
}

export function getSchoolById(id: string): School | null {
  const school = db.prepare(`
    SELECT * FROM schools WHERE id = ?
  `).get(id) as any;

  if (!school) return null;

  const contact = db.prepare(`
    SELECT email, phone, address FROM school_contacts WHERE school_id = ?
  `).get(id) as any;

  const features = db.prepare(`
    SELECT feature FROM school_features WHERE school_id = ?
  `).all(id) as any[];

  const leadership = db.prepare(`
    SELECT id, name, title, bio, photo, display_order as displayOrder
    FROM school_leadership 
    WHERE school_id = ?
    ORDER BY display_order, name
  `).all(id) as any[];

  const testimonials = db.prepare(`
    SELECT id, author, title, text, created_at as createdAt
    FROM school_testimonials
    WHERE school_id = ?
    ORDER BY created_at DESC
  `).all(id) as any[];

  const gallery = db.prepare(`
    SELECT id, url, caption, created_at as createdAt
    FROM school_gallery
    WHERE school_id = ?
    ORDER BY created_at DESC
  `).all(id) as any[];

  return {
    ...school,
    heroImage: (school.hero_image as string) || undefined,
    logo: (school.logo as string) || undefined,
    theme: (() => {
      try {
        return school.theme ? JSON.parse(school.theme) : undefined;
      } catch (e) {
        return school.theme || undefined;
      }
    })(),
    coreValues: (() => {
      try {
        return school.core_values ? JSON.parse(school.core_values) : undefined;
      } catch (e) {
        return undefined;
      }
    })(),
    contact: {
      email: contact?.email || '',
      phone: contact?.phone || '',
      address: contact?.address || ''
    },
    features: features.map(f => f.feature),
    leadership: leadership.length > 0 ? leadership : undefined,
    testimonials: testimonials.length > 0 ? testimonials.map(t => ({ id: t.id, author: t.author, title: t.title, text: t.text, createdAt: t.createdAt })) : undefined
  ,
  gallery: gallery.length > 0 ? gallery.map(g => ({ id: g.id, url: g.url, caption: g.caption, createdAt: g.createdAt })) : undefined
  };
}

export function searchSchools(query: string): School[] {
  const q = `%${query.toLowerCase()}%`;
  const schools = db.prepare(`
    SELECT * FROM schools 
    WHERE LOWER(name) LIKE ? 
       OR LOWER(location) LIKE ?
       OR LOWER(type) LIKE ?
    ORDER BY name
  `).all(q, q, q) as any[];

  return schools.map(school => {
    const contact = db.prepare(`
      SELECT email, phone, address FROM school_contacts WHERE school_id = ?
    `).get(school.id) as any;

    const features = db.prepare(`
      SELECT feature FROM school_features WHERE school_id = ?
    `).all(school.id) as any[];

    const leadership = db.prepare(`
      SELECT id, name, title, bio, photo, display_order as displayOrder
      FROM school_leadership 
      WHERE school_id = ?
      ORDER BY display_order, name
    `).all(school.id) as any[];

    return {
      ...school,
      contact: {
        email: contact?.email || '',
        phone: contact?.phone || '',
        address: contact?.address || ''
      },
      features: features.map(f => f.feature),
      leadership: leadership.length > 0 ? leadership : undefined
    };
  });
}

export function createSchool(schoolData: Omit<School, 'id'> & { id?: string }): School {
  const id = schoolData.id || String(Date.now());
  
  const insertSchool = db.prepare(`
  INSERT INTO schools (id, name, type, county, location, description, mission, vision, core_values, founded, students, rating, image, website, hero_image, logo, theme)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertContact = db.prepare(`
    INSERT INTO school_contacts (school_id, email, phone, address)
    VALUES (?, ?, ?, ?)
  `);

  const insertFeature = db.prepare(`
    INSERT INTO school_features (school_id, feature)
    VALUES (?, ?)
  `);

  const insertLeadership = db.prepare(`
    INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const createSchoolTransaction = db.transaction(() => {
    insertSchool.run(
      id,
      schoolData.name,
      schoolData.type,
      schoolData.county,
      schoolData.location,
      schoolData.description,
      schoolData.mission || null,
      schoolData.vision || null,
  schoolData.coreValues ? JSON.stringify(schoolData.coreValues) : null,
      schoolData.founded,
      schoolData.students,
      schoolData.rating,
  schoolData.image,
  schoolData.website || null,
  (schoolData.heroImage as string) || null,
  (schoolData.logo as string) || null,
  schoolData.theme ? JSON.stringify(schoolData.theme) : null
    );

    insertContact.run(
      id,
      schoolData.contact.email,
      schoolData.contact.phone,
      schoolData.contact.address
    );

    for (const feature of schoolData.features) {
      insertFeature.run(id, feature);
    }

    if (schoolData.leadership && schoolData.leadership.length > 0) {
      schoolData.leadership.forEach((member, index) => {
        insertLeadership.run(
          id,
          member.name,
          member.title,
          member.bio || null,
          member.photo || null,
          member.displayOrder ?? index
        );
      });
    }

    // Insert testimonials if provided
    if ((schoolData as any).testimonials && (schoolData as any).testimonials.length > 0) {
      const insertTestimonial = db.prepare(`
        INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ?)
      `);
      for (const t of (schoolData as any).testimonials) {
        insertTestimonial.run(id, t.author || null, t.title || null, t.text);
      }
    }
  });

  createSchoolTransaction();

  return getSchoolById(id)!;
}

export function updateSchool(id: string, schoolData: Partial<School>): School | null {
  const existing = getSchoolById(id);
  if (!existing) return null;

  const updateSchool = db.prepare(`
    UPDATE schools 
    SET name = ?, type = ?, county = ?, location = ?, description = ?, 
        mission = ?, vision = ?, founded = ?, students = ?, rating = ?, image = ?, website = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const updateContact = db.prepare(`
    UPDATE school_contacts
    SET email = ?, phone = ?, address = ?
    WHERE school_id = ?
  `);

  const deleteFeatures = db.prepare(`
    DELETE FROM school_features WHERE school_id = ?
  `);

  const insertFeature = db.prepare(`
    INSERT INTO school_features (school_id, feature)
    VALUES (?, ?)
  `);

  const deleteLeadership = db.prepare(`
    DELETE FROM school_leadership WHERE school_id = ?
  `);

  const insertLeadership = db.prepare(`
    INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const updateSchoolTransaction = db.transaction(() => {
    const updated = { ...existing, ...schoolData };
    
    updateSchool.run(
      updated.name,
      updated.type,
      updated.county,
      updated.location,
      updated.description,
      updated.mission || null,
      updated.vision || null,
      updated.founded,
      updated.students,
      updated.rating,
      updated.image,
      updated.website || null,
      id
    );

    // Update additional columns if present
    if (schoolData.heroImage !== undefined || schoolData.logo !== undefined || schoolData.theme !== undefined || schoolData.coreValues !== undefined) {
      const setTheme = schoolData.theme ? JSON.stringify(schoolData.theme) : null;
      const setCore = schoolData.coreValues ? JSON.stringify(schoolData.coreValues) : null;
      db.prepare(`UPDATE schools SET hero_image = ?, logo = ?, theme = ?, core_values = ? WHERE id = ?`).run(
        schoolData.heroImage || null,
        schoolData.logo || null,
        setTheme,
        setCore,
        id
      );
    }

    if (schoolData.contact) {
      updateContact.run(
        updated.contact.email,
        updated.contact.phone,
        updated.contact.address,
        id
      );
    }

    if (schoolData.features) {
      deleteFeatures.run(id);
      for (const feature of updated.features) {
        insertFeature.run(id, feature);
      }
    }

    if (schoolData.leadership !== undefined) {
      deleteLeadership.run(id);
      if (schoolData.leadership && schoolData.leadership.length > 0) {
        schoolData.leadership.forEach((member, index) => {
          insertLeadership.run(
            id,
            member.name,
            member.title,
            member.bio || null,
            member.photo || null,
            member.displayOrder ?? index
          );
        });
      }
    }

    // Replace testimonials if explicitly provided
    if ((schoolData as any).testimonials !== undefined) {
      const deleteTestimonials = db.prepare(`DELETE FROM school_testimonials WHERE school_id = ?`);
      deleteTestimonials.run(id);
      if ((schoolData as any).testimonials && (schoolData as any).testimonials.length > 0) {
        const insertTestimonial = db.prepare(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ?)`);
        for (const t of (schoolData as any).testimonials) {
          insertTestimonial.run(id, t.author || null, t.title || null, t.text);
        }
      }
    }
  });

  updateSchoolTransaction();

  return getSchoolById(id);
}

export function deleteSchool(id: string): boolean {
  const school = getSchoolById(id);
  if (!school) return false;

  const deleteSchool = db.prepare(`
    DELETE FROM schools WHERE id = ?
  `);

  deleteSchool.run(id);
  return true;
}

// --- Gallery helpers ---
export function addGalleryItem(schoolId: string, url: string, caption?: string) {
  const stmt = db.prepare(`INSERT INTO school_gallery (school_id, url, caption) VALUES (?, ?, ?)`);
  const info = stmt.run(schoolId, url, caption || null);
  const row = db.prepare(`SELECT id, url, caption, created_at as createdAt FROM school_gallery WHERE id = ?`).get(info.lastInsertRowid);
  return row;
}

export function deleteGalleryItem(id: number) {
  const stmt = db.prepare(`DELETE FROM school_gallery WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}

// --- Leadership helpers ---
export function addLeadershipMember(schoolId: string, name: string, title: string, bio?: string, photo?: string, displayOrder?: number) {
  const stmt = db.prepare(`INSERT INTO school_leadership (school_id, name, title, bio, photo, display_order) VALUES (?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(schoolId, name, title, bio || null, photo || null, displayOrder || 0);
  const row = db.prepare(`SELECT id, name, title, bio, photo, display_order as displayOrder FROM school_leadership WHERE id = ?`).get(info.lastInsertRowid);
  return row;
}

export function updateLeadershipMember(id: number, updates: Partial<{ name: string; title: string; bio: string; photo: string; displayOrder: number }>) {
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

export function deleteLeadershipMember(id: number) {
  const stmt = db.prepare(`DELETE FROM school_leadership WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}

export function getLeadershipById(id: number) {
  return db.prepare(`SELECT id, name, title, bio, photo, display_order as displayOrder FROM school_leadership WHERE id = ?`).get(id);
}

// --- People helpers (consolidated staff/administrators used by Administrator component) ---
export function getPeopleBySchool(schoolId: string) {
  return db.prepare(`SELECT id, name, role, bio, image, display_order as displayOrder FROM people WHERE school_id = ? ORDER BY display_order, name`).all(schoolId) as any[];
}

export function getPersonById(id: number) {
  return db.prepare(`SELECT id, school_id, name, role, bio, image, display_order as displayOrder FROM people WHERE id = ?`).get(id);
}

export function addPerson(schoolId: string, name: string, role: string, bio?: string, image?: string, displayOrder?: number) {
  const stmt = db.prepare(`INSERT INTO people (school_id, name, role, bio, image, display_order) VALUES (?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(schoolId, name, role, bio || null, image || null, displayOrder || 0);
  return getPersonById(info.lastInsertRowid as number);
}

export function updatePerson(id: number, updates: Partial<{ name: string; role: string; bio: string; image: string; displayOrder: number }>) {
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

export function deletePerson(id: number) {
  const stmt = db.prepare(`DELETE FROM people WHERE id = ?`);
  const info = stmt.run(id);
  return info.changes > 0;
}


