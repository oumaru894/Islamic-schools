import React, { useState, useMemo, useEffect } from 'react';
import { fetchAllSchools } from '../services/api';
import SchoolCard from '../components/SchoolCard';
import { Search, Filter } from 'lucide-react';
import { County, SchoolType, School } from '../types';

const Directory: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        const data = await fetchAllSchools();
        setSchools(data);
        setError(null);
      } catch (err) {
        setError('Failed to load schools. Please try again later.');
        console.error('Error loading schools:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            school.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCounty = selectedCounty === 'All' || school.county === selectedCounty;
      const matchesType = selectedType === 'All' || school.type === selectedType;
      return matchesSearch && matchesCounty && matchesType;
    });
  }, [schools, searchTerm, selectedCounty, selectedType]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">All Islamic Schools</h1>
          <p className="text-slate-600 text-sm sm:text-base">Browse through our comprehensive list of integrated and religious educational institutions across Liberia.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sm:mb-8 sticky top-16 sm:top-20 z-30">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
               <div className="relative flex-1 sm:flex-initial">
                  <select 
                    className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                  >
                    <option value="All">All Counties</option>
                    {Object.values(County).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Filter className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
               </div>

               <div className="relative flex-1 sm:flex-initial">
                  <select 
                    className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    {Object.values(SchoolType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Filter className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
               </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredSchools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredSchools.map(school => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 bg-white rounded-xl border border-dashed border-slate-300">
             <p className="text-slate-500 text-base sm:text-lg mb-4">No schools found matching your criteria.</p>
             <button 
                onClick={() => {setSearchTerm(''); setSelectedCounty('All'); setSelectedType('All');}}
                className="text-emerald-600 hover:underline text-sm sm:text-base font-medium"
             >
                Clear all filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;