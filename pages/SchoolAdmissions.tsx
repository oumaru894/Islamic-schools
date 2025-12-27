import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
import SchoolHeader from '../components/SchoolHeader';
import { School } from '../types';
import Button from '../components/Button';

const SchoolAdmissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await fetchSchoolById(id);
        setSchool(data);
        setError(null);
      } catch (err) {
        setError('Failed to load school');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-12">Loading...</div>;
  if (error || !school) return <div className="p-12 text-center text-red-600">{error || 'School not found'}</div>;

  return (
    <div>
      <SchoolHeader school={school} currentTab={'admissions'} />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-white p-4 sm:p-6 rounded shadow-sm border">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Admissions at {school.name}</h2>
          <p className="text-slate-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">Applications open for the upcoming academic year. Please contact the school for the admissions form or request a packet below.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-base sm:text-lg">Requirements</h3>
              <ul className="list-disc pl-5 text-slate-700 space-y-2 text-sm sm:text-base">
                <li>Completed application form</li>
                <li>Previous school transcripts</li>
                <li>Parent/guardian interview</li>
                <li>Basic Arabic/Quran assessment</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-base sm:text-lg">Tuition & Fees</h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">Scholarships are available for deserving students. Fee structure varies by program; contact the school for details.</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <Button className="w-full sm:w-auto">Request Application Packet</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAdmissions;
