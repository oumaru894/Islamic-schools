// School footer component
// that displays the school name, address, contact info, and social media links.
// It should accept props for the school data.
import React from 'react';
import { School } from '../types';
import { Link } from 'react-router-dom';
import { Sun, Moon, MapPin, Users } from 'lucide-react';

interface SchoolFooterProps {
  school: School;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const SchoolFooter: React.FC<SchoolFooterProps> = ({ school, isDarkMode, toggleDarkMode }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-2">{school.name}</h4>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {school.contact.address}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {school.contact.phone}
                </p>
              </div>
    
              <div>
                <h4 className="text-white font-semibold mb-2">Quick Links</h4>
                <div className="flex flex-col gap-2">
                  <Link to={`/school/${school.id}/about`}>About</Link>
                  <Link to={`/school/${school.id}/academics`}>Academics</Link>
                  <Link to={`/school/${school.id}/admissions`}>Admissions</Link>
                  <Link to={`/school/${school.id}/contact`}>Contact</Link>
                </div>
              </div>
    
              <div>
                <h4 className="text-white font-semibold mb-2">Office Hours</h4>
                <p>Mon – Fri: 8:00 AM – 4:00 PM</p>
              </div>
            </div>
          </footer>
  );
};

export default SchoolFooter;
