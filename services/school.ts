import { School, SchoolType, County } from '../types';

export const sampleSchool: School = {
  id: '1',
  name: 'Bright Future Academy',
  type: SchoolType.ISLAMIC_HIGH_SCHOOL,
  county: County.MONTSERRADO,
  location: 'Tubman Boulevard, Monrovia',
  founded: 2001,
  students: 800,
  rating: 4.5,
  description: 'Bright Future Academy is a private primary and secondary school dedicated to academic excellence, discipline, and character development. We provide a safe and supportive learning environment where every child is empowered to succeed.',

  mission: 'To provide quality education that nurtures academic excellence, moral values, leadership skills, and lifelong learning.',

  vision: 'To be a leading institution producing confident, disciplined, and globally competitive students.',

  image: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238',

  features: [
    'Qualified and experienced teachers',
    'Modern science and ICT laboratories',
    'Well-stocked library',
    'Safe and secure campus',
    'Sports and extracurricular activities',
    'Moral and character education',
  ],

  leadership: [
    {
      name: 'Mrs. Sarah Johnson',
      title: 'Principal',
      photo:
        'https://randomuser.me/api/portraits/women/44.jpg',
      bio:
        'Mrs. Johnson has over 15 years of experience in school administration and is passionate about quality education and student development.',
    },
    {
      name: 'Mr. David Williams',
      title: 'Vice Principal (Academics)',
      photo:
        'https://randomuser.me/api/portraits/men/32.jpg',
      bio:
        'Mr. Williams oversees curriculum development and academic performance across all levels.',
    },
  ],


  contact: {
    address: 'Tubman Boulevard, Monrovia, Liberia',
    phone: '+231 77 123 4567',
    email: 'info@brightfutureacademy.edu.lr',
  },
  
};
