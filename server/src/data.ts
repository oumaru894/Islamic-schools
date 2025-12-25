// Mapping from backend keys to frontend enum display values
export const SchoolTypeMap: Record<string, string> = {
  'ISLAMIC_HIGH_SCHOOL': 'Islamic High School',
  'ISLAMIC_INTEGRATED': 'Integrated (English/Arabic)',
  'ISLAMIC_UNIVERSITY': 'Islamic University',
  'TAHFEEZ': 'Tahfeez (Quranic Memorization)',
  'VOCATIONAL': 'Vocational (Islamic Arts & Trades)'
};

export const CountyMap: Record<string, string> = {
  'MONTSERRADO': 'Montserrado',
  'NIMBA': 'Nimba',
  'BONG': 'Bong',
  'GRAND_BASSA': 'Grand Bassa',
  'MARGIBI': 'Margibi',
  'LOFA': 'Lofa',
  'MARYLAND': 'Maryland',
  'OTHER': 'Other'
};

export const schools = [
  {
    id: '1',
    name: 'Muslim Congress High School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Mechlin Street, Monrovia',
    description: 'A premier institution providing quality education that blends the national curriculum with Islamic values. We produce disciplined, morally upright, and academically sound future leaders.',
    founded: 1960,
    students: 1500,
    rating: 4.8,
    image: 'https://picsum.photos/800/600?random=10',
    contact: {
      email: 'info@muslimcongress.edu.lr',
      phone: '+231 777 111 222',
      address: 'Mechlin Street, Monrovia'
    },
    features: ['Mosque on Campus', 'Arabic Classes', 'Science Labs', 'Debate Club']
  },
  
  {
    id: '2',
    name: 'Sekou I Sherf High School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Gardnersville, Monrovia',
    description: "Liberia's leading Islamic higher education institution. We offer degree programs in Theology, Arabic Language, Education, and Business Administration within a faith-based environment.",
    founded: 2005,
    students: 2200,
    rating: 4.6,
    image: 'https://picsum.photos/800/600?random=11',
    contact: {
      email: 'admissions@sis.edu.lr',
      phone: '+231 886 999 000',
      address: 'Gardnersville, Somalia Drive'
    },
    features: ['Sharia Law Faculty', 'Library', 'Student Housing', 'Scholarship Programs']
  },
  {
    id: '3',
    name: 'A.M. Fofana High School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Sinkor, Monrovia',
    description: 'An integrated school offering both secular and Islamic education. Our focus is on raising children who are competitive globally while remaining steadfast in their deen.',
    founded: 1985,
    students: 850,
    rating: 4.5,
    image: 'https://picsum.photos/800/600?random=12',
    contact: {
      email: 'amfofana@islamic.edu.lr',
      phone: '+231 770 555 444',
      address: 'Vai Town, Bushrod Island'
    },
    features: ['Dual Curriculum', 'Computer Lab', 'Islamic History', 'Sports']
  },
  {
    id: '4',
    name: 'Dawah Ummah High School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Monnrovia, Montserrado County',
    description: 'Dedicated specifically to the memorization of the Holy Quran. We provide boarding facilities for students from across the country to focus entirely on Hifz.',
    founded: 1998,
    students: 300,
    rating: 4.9,
    image: 'https://picsum.photos/800/600?random=13',
    contact: {
      email: 'info@darulquran.lr',
      phone: '+231 888 222 333',
      address: 'Gbarnga City, Bong'
    },
    features: ['Full Boarding', 'Tajweed Expert Tutors', 'Moral Etiquette', 'Halal Meals']
  },
  {
    id: '5',
    name: 'Jafariayah Islamic School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Lynch Street, Monrovia',
    description: 'Serving the community of Lofa with excellence. We provide K-12 education with a strong emphasis on discipline, Arabic literacy, and community service.',
    founded: 1975,
    students: 1100,
    rating: 4.4,
    image: 'https://picsum.photos/800/600?random=14',
    contact: {
      email: 'Jafariayah@edu.lr',
      phone: '+231 776 123 789',
      address: 'Monrovia, Liberia'
    },
    features: ['Agricultural Program', 'Arabic Fluency', 'Community Masjid']
  },
  {
    id: '6',
    name: 'Fanima High School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Clara Town, Monrovia',
    description: 'Empowering youth with technical skills in carpentry, masonry, and electronics, guided by Islamic principles of honest work and trade.',
    founded: 2010,
    students: 450,
    rating: 4.3,
    image: 'https://picsum.photos/800/600?random=15',
    contact: {
      email: 'fanima@nimba.lr',
      phone: '+231 555 666 777',
      address: 'Clara Town, Monrovia'
    },
    features: ['Technical Workshops', 'Entrepreneurship', 'Prayer Hall']
  },
  {
    id: '7',
    name: 'Salim Bakhit High School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Sinkor, Monrovia',
    description: 'An all-girls Islamic institution focused on empowering young Muslim women through rigorous academic and spiritual education.',
    founded: 1992,
    students: 600,
    rating: 4.7,
    image: 'https://picsum.photos/800/600?random=16',
    contact: {
      email: 'admissions@khadija.edu.lr',
      phone: '+231 777 999 888',
      address: '15th Street Sinkor, Beachside'
    },
    features: ['All-Girls Environment', 'Hijab Friendly', 'Science & Arts', 'Home Economics']
  },
  {
    id: '8',
    name: 'Salafia Grammar High School',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Front Street, Monrovia',
    description: 'A large network of schools providing affordable, high-quality Islamic and secular education to the residents of Margibi County.',
    founded: 1980,
    students: 1800,
    rating: 4.2,
    image: 'https://picsum.photos/800/600?random=17',
    contact: {
      email: 'admin@salafia.edu.lr',
      phone: '+231 886 111 000',
      address: 'Front Street, Monrovia'
    },
    features: ['Large Campus', 'Bus Service', 'Quranic Competition']
  },
  {
    id: '9',
    name: 'PSI',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Caldwell, Monrovia',
    description: 'Lighting the way for the next generation. We focus on STEM education integrated with Quranic studies.',
    founded: 2015,
    students: 400,
    rating: 4.5,
    image: 'https://picsum.photos/800/600?random=18',
    contact: {
      email: 'annoor@academy.lr',
      phone: '+231 775 555 123',
      address: 'Caldwell Road, Montserrado'
    },
    features: ['Robotics Club', 'Hifz Program', 'Modern Playground']
  },
  {
    id: '10',
    name: 'UISL',
    type: 'ISLAMIC_HIGH_SCHOOL',
    county: 'MONTSERRADO',
    location: 'Monrovia, Montserrado County',
    description: 'A sanctuary for learning and spiritual growth in the heart of Buchanan. We offer intensive Arabic and Islamic studies courses.',
    founded: 2000,
    students: 250,
    rating: 4.6,
    image: 'https://picsum.photos/800/600?random=19',
    contact: {
      email: 'contact@hidayah.lr',
      phone: '+231 880 123 456',
      address: 'Monrovia, Montserrado'
    },
    features: ['Adult Education', 'Weekend Madrasa', 'Community Outreach']
  }
];
