import React from 'react';
import { School } from '../types';
import { MapPin, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SchoolCardProps {
  school: School;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  return (
    <Link 
      to={`/school/${school.id}`} 
      className="block h-full group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-40 sm:h-48 w-full bg-slate-200 overflow-hidden">
        <img 
          src={school.image} 
          alt={school.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-emerald-900 shadow-sm border border-emerald-100">
          {school.type}
        </div>
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-amber-500 text-sm font-medium">
            <Star className="h-4 w-4 fill-current mr-1" />
            {school.rating}
          </div>
          <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
            {school.county}
          </span>
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-800 transition-colors">
          {school.name}
        </h3>
        
        <div className="flex items-center text-slate-500 text-sm mb-3 sm:mb-4">
          <MapPin className="h-4 w-4 mr-1 shrink-0" />
          <span className="truncate">{school.location}</span>
        </div>

        <p className="text-slate-600 text-sm mb-3 sm:mb-4 line-clamp-2 flex-1">
          {school.description}
        </p>

        <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between group-hover:border-emerald-100 transition-colors">
          <div className="flex items-center text-slate-500 text-xs">
            <Users className="h-4 w-4 mr-1" />
            {school.students.toLocaleString()} Students
          </div>
          <span className="text-emerald-800 font-semibold text-xs sm:text-sm flex items-center group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight className="h-4 w-4 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SchoolCard;