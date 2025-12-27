import React from 'react';
import { Link } from 'react-router-dom';
import { School } from '../types';
import { ArrowLeft, Moon } from 'lucide-react';

interface Props {
  school: School;
  currentTab?: 'home' | 'about' | 'admissions' | 'contact' | 'profile';
  rightContent?: React.ReactNode;
}

const SchoolHeader: React.FC<Props> = ({ school, currentTab = 'home', rightContent }) => {
  const themeVars: React.CSSProperties = {
    ['--school-primary' as any]: school.theme?.primary || '#065f46',
    ['--school-accent' as any]: school.theme?.accent || '#7c3aed',
  };

  const bgImage = (school as any).heroImage || school.image;

  const containerStyle: React.CSSProperties = {
    ...themeVars,
    backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  

  return (
    <div style={containerStyle} className="relative h-56 sm:h-64 md:h-80" aria-hidden>
      {/* overlay for contrast */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex items-center gap-1 sm:gap-2 flex-wrap">
        <Link to={`/school/${school.id}/home`} className={`inline-flex items-center text-white/80 hover:text-white bg-black/20 hover:bg-black/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm transition-colors ${currentTab === 'home' ? 'ring-2 ring-white/30' : ''}`}>Home</Link>
        
        <Link to={`/school/${school.id}/admissions`} className={`inline-flex items-center text-white/80 hover:text-white bg-black/20 hover:bg-black/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm transition-colors ${currentTab === 'admissions' ? 'ring-2 ring-white/30' : ''}`}>Admissions</Link>
        
        <Link to={`/school/${school.id}/contact`} className={`inline-flex items-center text-white/80 hover:text-white bg-black/20 hover:bg-black/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm transition-colors ${currentTab === 'contact' ? 'ring-2 ring-white/30' : ''}`}>Contact</Link>
      </div> */}

      <div className="absolute inset-0 flex items-end">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full pb-4 sm:pb-8">
          <div className="bg-white/10 backdrop-blur-md p-3 sm:p-6 rounded-xl border border-white/20 w-full" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {((school as any).logo || school.theme?.logo) && (
                  <img 
                    src={(school as any).logo || school.theme?.logo} 
                    alt={`${school.name} logo`} 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded bg-white/10 p-1 flex-shrink-0" 
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center gap-1">
                    <Moon className="h-3 w-3" /> {school.type}
                  </span>
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mt-1 sm:mt-2 mb-1 sm:mb-2 truncate">{school.name}</h1>
                  <div className="flex items-center text-white/90 text-xs sm:text-sm">
                    <span className="text-white/80 truncate">{school.location}, {school.county}</span>
                  </div>
                </div>
              </div>
              {rightContent && <div className="ml-auto flex-shrink-0">{rightContent}</div>}
            </div>

            <div className="mt-3 sm:mt-4">
              <nav className="flex gap-1 sm:gap-2 flex-wrap">
                <Link to={`/school/${school.id}/home`} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${currentTab === 'home' ? 'bg-white text-slate-900' : 'text-white/90 hover:bg-white/5'}`}>Home</Link>
                <Link to={`/school/${school.id}/about`} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${currentTab === 'about' ? 'bg-white text-slate-900' : 'text-white/90 hover:bg-white/5'}`}>About</Link>
                <Link to={`/school/${school.id}/admissions`} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${currentTab === 'admissions' ? 'bg-white text-slate-900' : 'text-white/90 hover:bg-white/5'}`}>Admissions</Link>
                <Link to={`/school/${school.id}/contact`} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${currentTab === 'contact' ? 'bg-white text-slate-900' : 'text-white/90 hover:bg-white/5'}`}>Contact</Link>
                <Link to={`/school/${school.id}/testimonials`} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${currentTab === 'testimonials' ? 'bg-white text-slate-900' : 'text-white/90 hover:bg-white/5'}`}>Testimonials</Link>
                <Link to={`/school/${school.id}/gallery`} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${currentTab === 'gallery' ? 'bg-white text-slate-900' : 'text-white/90 hover:bg-white/5'}`}>Gallery</Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolHeader;
