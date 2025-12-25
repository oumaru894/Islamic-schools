export enum SchoolType {
  ISLAMIC_INTEGRATED = 'Integrated (English/Arabic)',
  ISLAMIC_HIGH_SCHOOL = 'Islamic High School',
  ISLAMIC_UNIVERSITY = 'Islamic University',
  TAHFEEZ = 'Tahfeez (Quranic Memorization)',
  VOCATIONAL = 'Vocational (Islamic Arts & Trades)'
}

export enum County {
  MONTSERRADO = 'Montserrado',
  NIMBA = 'Nimba',
  BONG = 'Bong',
  GRAND_BASSA = 'Grand Bassa',
  MARGIBI = 'Margibi',
  LOFA = 'Lofa',
  MARYLAND = 'Maryland',
  OTHER = 'Other'
}

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
  type: SchoolType;
  county: County;
  location: string;
  description: string;
  mission?: string;
  vision?: string;
  founded: number;
  students: number;
  rating: number; // 1-5
  image: string;
  website?: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  features: string[];
  leadership?: LeadershipMember[];
  coreValues?: string[];
  // Visual theme for the school's profile page
  theme?: {
    primary?: string; // primary color (hex)
    accent?: string; // accent color (hex)
    logo?: string; // optional small logo URL
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}