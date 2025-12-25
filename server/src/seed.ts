import db, { initializeDatabase } from './database';
import { schools as initialSchools, SchoolTypeMap, CountyMap } from './data';

export async function seedDatabase() {
  await initializeDatabase();

  // Clear existing data
  await db.exec(`DELETE FROM school_features; DELETE FROM school_contacts; DELETE FROM schools;`);

  // Insert schools using Postgres-compatible queries (adapter normalizes placeholders)
  for (const school of initialSchools) {
    const type = SchoolTypeMap[school.type] || school.type;
    const county = CountyMap[school.county] || school.county;
    const s: any = school;
    await db.prepare(`INSERT INTO schools (id, name, type, county, location, description, founded, students, rating, image, website, hero_image, logo, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(s.id, s.name, type, county, s.location, s.description, s.founded, s.students, s.rating, s.image, s.website || null, (s.heroImage as string) || null, (s.logo as string) || null, s.theme ? JSON.stringify(s.theme) : null);

    await db.prepare(`INSERT INTO school_contacts (school_id, email, phone, address) VALUES (?, ?, ?, ?)`)
      .run(school.id, school.contact.email, school.contact.phone, school.contact.address);

    for (const feature of s.features) {
      await db.prepare(`INSERT INTO school_features (school_id, feature) VALUES (?, ?)`).run(s.id, feature);
    }
  }

  // testimonials
  await db.prepare(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ? )`).run('1', 'Aisha Kamara', 'Parent', 'Wonderful environment and excellent teachers. My child improved significantly.');
  await db.prepare(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ? )`).run('1', 'Mohamed J.', 'Alumnus', 'The school prepared me well for university and instilled strong values.');
  await db.prepare(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ? )`).run('2', 'Fatmata S.', 'Parent', 'Competent staff and a strong academic program.');

  // gallery
  await db.prepare(`INSERT INTO school_gallery (school_id, url, caption) VALUES (?, ?, ?)`).run('1', 'https://picsum.photos/1200/800?random=101', 'Main campus building');
  await db.prepare(`INSERT INTO school_gallery (school_id, url, caption) VALUES (?, ?, ?)`).run('1', 'https://picsum.photos/1200/800?random=102', 'Students during assembly');
  await db.prepare(`INSERT INTO school_gallery (school_id, url, caption) VALUES (?, ?, ?)`).run('2', 'https://picsum.photos/1200/800?random=103', 'Library and study area');

  const cnt = await db.prepare('SELECT COUNT(*) as count FROM schools').get() as any;
  console.log(`Database seeded with ${cnt.count} schools`);
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

