// this page will list testimonials for a school using the Testimonial component.
// it should fetch the testimonials data based on the school id passed in the URL params.
// it should use React Router for navigation.
// it should handle loading and error states appropriately.
// it should be styled using Tailwind CSS.
// it should be a functional component using React hooks.
// it should be written in TypeScript.
// it should also include the SchoolHeader and SchoolFooter components.
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
import SchoolHeader from '../components/SchoolHeader';
import SchoolFooter from '../components/SchoolFooter';
import Testimonial from '../components/Testimonial';
import { School } from '@/server/src/schoolService';

interface TestimonialData {
  testimonial: string;
};

const TestimonialPage: React.FC = () => {
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
      <SchoolHeader school={school} currentTab="testimonials" />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8">What Our Students Say</h2>
        <div className="grid gap-8">
          <Testimonial testimonials={school.testimonials || []} summary={false} schoolId={id} />
        </div>
      </div>
      <SchoolFooter school={school} isDarkMode={false} toggleDarkMode={() => {}} />
    </div>
  );
};

export default TestimonialPage;