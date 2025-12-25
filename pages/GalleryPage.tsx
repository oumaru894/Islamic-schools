// this is the page that displays the gallery of a school using  the Gallery component.
// It should fetch the school id from the URL params and pass it to the Gallery component.
// It should also include the SchoolHeader and SchoolFooter components.
// It should handle loading and error states appropriately.
// It should be styled using Tailwind CSS.
// It should be a functional component using React hooks.
// It should be written in TypeScript.
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
import SchoolHeader from '../components/SchoolHeader';
import SchoolFooter from '../components/SchoolFooter';
import Gallery from '../components/Gallery';
import { School } from '@/server/src/schoolService';

const GalleryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = React.useState<School | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    fetchSchoolById(id)
      .then(setSchool)
      .catch(() => setError('Failed to load school'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-12">Loading...</div>;
  if (error || !school)
    return (
      <div className="p-12 text-center">
        <p className="text-red-600 mb-4">{error || 'School not found'}</p>
        <Link to="/schools" className="text-emerald-600 hover:underline">
          Back to directory
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <SchoolHeader school={school} currentTab="gallery" />
      <Gallery schoolId={school.id} />
      <SchoolFooter school={school} isDarkMode={false} toggleDarkMode={() => {}} />
    </div>
  );
};

export default GalleryPage;