// An about page for a school that displays detailed information about the school,
// including its history, mission, vision, values, and administration team.
// It should accept props for the school data.
// should make use of the AboutUs component to display the about section fully.
// It should also include the SchoolHeader and SchoolFooter components.
// It should fetch the school data based on the school id passed in the URL params.
// It should use React Router for navigation.
// It should handle loading and error states appropriately. 
// It should be styled using Tailwind CSS.
// It should be a functional component using React hooks.
// It should be written in TypeScript.      
import React from 'react';
import { School } from '../types';
import { useParams, Link } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
import SchoolHeader from '../components/SchoolHeader';
import AboutUs from '../components/AboutUs';
import SchoolFooter from '../components/SchoolFooter';
import Rules from '../components/Rules';

const SchoolAbout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = React.useState<School | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
      setError('No school id provided');
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchSchoolById(id)
      .then(data => { if (mounted) setSchool(data); })
      .catch(() => { if (mounted) setError('Failed to load school'); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
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
      <SchoolHeader school={school} currentTab="about" />
      <AboutUs school={school} />
      <Rules rules={school.rules || [
        'New admissions procedure',
        'Procedure for withdrawal',
        'School fees structure',
        'Examinations and promotion criteria',
      ]} accentColor={school.accentColor} />
      
      <SchoolFooter school={school} isDarkMode={false} toggleDarkMode={() => {}} />
    </div>
  );
};

export default SchoolAbout; 