import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Map, Award, Book, Moon } from 'lucide-react';
import { fetchAllSchools } from '../services/api';
import SchoolCard from '../components/SchoolCard';
import Button from '../components/Button';
import Hero from '../components/Hero';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { County, School } from '../types';

const Home: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await fetchAllSchools();
        setSchools(data);
      } catch (err) {
        console.error('Error loading schools:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSchools();
  }, []);

  // Simple stats calculation for visualization
  const countyStats = Object.values(County).map(county => ({
    name: county,
    count: schools.filter(s => s.county === county).length
  })).filter(c => c.count > 0);

  const featuredSchools = schools.slice(0, 3);

  return (
    <div className="flex flex-col">
      <Hero
        title={<><span>Excellence in</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100">Islamic Education</span></>}
        subtitle="Building character through knowledge and faith"
        description="Discover the finest Islamic schools, Tahfeez centers, and integrated institutions across Liberia."
        backgroundImage={undefined}
        logo={undefined}
        overlayColor="linear-gradient(rgba(2,6,23,0.6), rgba(2,6,23,0.35))"
        ctas={[
          { label: 'Browse Schools', href: '/schools', variant: 'primary' },
          { label: 'Register Institution', href: '/admin-login', variant: 'outline' }
        ]}
      />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Empowering the Ummah</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Our directory tracks the growth of Islamic education across the nation, ensuring every child has access to both secular and religious knowledge. We connect families with institutions that align with their values.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow">
                            <Book className="h-8 w-8 text-emerald-600 mb-2" />
                            <div className="text-2xl font-bold text-slate-900">{loading ? '...' : schools.length}+</div>
                            <div className="text-sm text-slate-500">Registered Institutes</div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow">
                            <Map className="h-8 w-8 text-amber-600 mb-2" />
                            <div className="text-2xl font-bold text-slate-900">{countyStats.length}</div>
                            <div className="text-sm text-slate-500">Counties Active</div>
                        </div>
                    </div>
                </div>
                <div className="h-64 md:h-80 w-full bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-500 mb-6 text-center">Schools per Region</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countyStats}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                            <YAxis hide />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {countyStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#059669' : '#d97706'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </section>

          {/* Featured Schools */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h2 className="text-3xl font-bold text-slate-900">Featured Institutions</h2>
                <p className="text-slate-600 mt-2">Top-rated schools recognized for academic and moral excellence.</p>
             </div>
             <Link to="/schools" className="text-emerald-800 font-medium hover:underline hidden md:block">
                View all schools &rarr;
             </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading featured schools...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSchools.map(school => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          )}

           <div className="mt-8 text-center md:hidden">
             <Link to="/schools" className="text-emerald-800 font-medium hover:underline">
                View all schools &rarr;
             </Link>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-950 text-white text-center">
         <div className="max-w-4xl mx-auto px-4">
             <Award className="h-12 w-12 text-amber-400 mx-auto mb-4" />
             <h2 className="text-3xl font-bold mb-4">Are you a School Administrator?</h2>
             <p className="text-emerald-200 mb-8 text-lg">
                Join the largest Islamic schools directory in Liberia. Create your school's profile, attract new students, and showcase your facilities to the community.
             </p>
             <Link to="/admin-login">
                <Button variant="secondary" size="lg">Get Started Today</Button>
             </Link>
         </div>
      </section>
    </div>
  );
};

export default Home;