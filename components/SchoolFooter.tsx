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
    <footer className="bg-slate-900 text-slate-300 py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* School Info Section */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-base sm:text-lg">{school.name}</h4>
            <div className="space-y-2">
              <p className="flex items-start gap-2 text-sm sm:text-base">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" /> 
                <span className="leading-relaxed">{school.contact.address}</span>
              </p>
              <p className="flex items-center gap-2 text-sm sm:text-base">
                <Users className="h-4 w-4 flex-shrink-0" /> 
                <span className="break-all">{school.contact.phone}</span>
              </p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-base sm:text-lg">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm sm:text-base">
              <Link 
                to={`/school/${school.id}/about`} 
                className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
              >
                About
              </Link>
              <Link 
                to={`/school/${school.id}/academics`}
                className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
              >
                Academics
              </Link>
              <Link 
                to={`/school/${school.id}/admissions`}
                className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
              >
                Admissions
              </Link>
              <Link 
                to={`/school/${school.id}/contact`}
                className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Office Hours & Dark Mode Toggle */}
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-3 text-base sm:text-lg">Office Hours</h4>
            <p className="text-sm sm:text-base mb-4">Mon – Fri: 8:00 AM – 4:00 PM</p>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm sm:text-base"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Bottom - Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs sm:text-sm text-slate-400">
            &copy; {new Date().getFullYear()} {school.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SchoolFooter;
