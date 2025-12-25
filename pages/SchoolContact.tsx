import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
import SchoolHeader from '../components/SchoolHeader';
import { School } from '../types';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';
import Contact from '../components/Contact';

const SchoolContact: React.FC = () => {
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
      <SchoolHeader school={school} currentTab={'contact'} />
      <div className="max-w-6xl mx-auto p-6">
        <Contact school={school} />
      </div>
    </div>
  );
};

export default SchoolContact;
