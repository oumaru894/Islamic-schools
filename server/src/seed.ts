import db, { initializeDatabase } from './database';
import { schools as initialSchools, SchoolTypeMap, CountyMap } from './data';

export function seedDatabase() {
  initializeDatabase();

  // Clear existing data (optional - comment out if you want to keep existing data)
  db.exec(`
    DELETE FROM school_features;
    DELETE FROM school_contacts;
    DELETE FROM schools;
  `);

  // Prepare statements for better performance
  const insertSchool = db.prepare(`
  INSERT INTO schools (id, name, type, county, location, description, founded, students, rating, image, website, hero_image, logo, theme)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertContact = db.prepare(`
    INSERT INTO school_contacts (school_id, email, phone, address)
    VALUES (?, ?, ?, ?)
  `);

  const insertFeature = db.prepare(`
    INSERT INTO school_features (school_id, feature)
    VALUES (?, ?)
  `);

  // Use transaction for better performance
  const insertSchoolTransaction = db.transaction((school: any) => {
    // Convert backend keys to frontend enum display values
    const type = SchoolTypeMap[school.type] || school.type;
    const county = CountyMap[school.county] || school.county;
    
    insertSchool.run(
      school.id,
      school.name,
      type,
      county,
      school.location,
      school.description,
      school.founded,
      school.students,
      school.rating,
  school.image,
  school.website || null,
  (school.heroImage as string) || null,
  (school.logo as string) || null,
  school.theme ? JSON.stringify(school.theme) : null
    );

    insertContact.run(
      school.id,
      school.contact.email,
      school.contact.phone,
      school.contact.address
    );

    for (const feature of school.features) {
      insertFeature.run(school.id, feature);
    }
  });

  // Insert all schools
  for (const school of initialSchools) {
    insertSchoolTransaction(school);
  }

  // Insert example testimonials for first few schools
  const insertTestimonial = db.prepare(`
    INSERT INTO school_testimonials (school_id, author, title, text)
    VALUES (?, ?, ?, ?)
  `);

  const insertTestimonialsTransaction = db.transaction(() => {
    insertTestimonial.run('1', 'Aisha Kamara', 'Parent', 'Wonderful environment and excellent teachers. My child improved significantly.');
    insertTestimonial.run('1', 'Mohamed J.', 'Alumnus', 'The school prepared me well for university and instilled strong values.');
    insertTestimonial.run('2', 'Fatmata S.', 'Parent', 'Competent staff and a strong academic program.');
  });

  insertTestimonialsTransaction();

  // Sample gallery images
  const insertGallery = db.prepare(`
    INSERT INTO school_gallery (school_id, url, caption) VALUES (?, ?, ?)
  `);

  const insertGalleryTx = db.transaction(() => {
    insertGallery.run('1', 'https://picsum.photos/1200/800?random=101', 'Main campus building');
    insertGallery.run('1', 'https://picsum.photos/1200/800?random=102', 'Students during assembly');
    insertGallery.run('2', 'https://picsum.photos/1200/800?random=103', 'Library and study area');
  });

  insertGalleryTx();

  const count = db.prepare('SELECT COUNT(*) as count FROM schools').get() as { count: number };
  console.log(`Database seeded with ${count.count} schools`);
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

