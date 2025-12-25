// this staff page will list all staff members of a school with their names, titles, photos, and brief bios.
// it should accept props for the school id to fetch staff data.
// it should fetch the staff data based on the school id passed in the URL params.
// it should use React Router for navigation.
// it should handle loading and error states appropriately.
// it should be styled using Tailwind CSS.
// it should be a functional component using React hooks.
// it should be written in TypeScript.
// the staff members should be displayed in a grid format with each staff member in a card.
// each card should display the staff member's photo, name, title, and a brief bio.
// data for staff members if the api is not available should be mocked.

// sample staff data
const sampleStaff: StaffMember[] = [
  {
    id: '1',
    name: 'John Doe',
    title: 'Principal',
    photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'John has over 20 years of experience in education and is dedicated to fostering a positive learning environment.',
  },
  {
    id: '2',
    name: 'Jane Smith',
    title: 'Vice Principal',
    photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'Jane is passionate about student development and works closely with teachers to enhance curriculum delivery.',
  },
  {
    id: '3',
    name: 'Emily Johnson',
    title: 'Head of Science Department',
    photoUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Emily has a strong background in biology and chemistry and encourages hands-on learning in her classes.',
  },
  {
    id: '4',
    name: 'Michael Brown',
    title: 'Head of Mathematics Department',
    photoUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'Michael is committed to helping students develop critical thinking skills through innovative teaching methods.',
  },
];  




// make use  of sampleStaff if api is not available
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStaffBySchoolId } from '../services/api';
import { School } from '@/server/src/schoolService';
import SchoolHeader from '../components/SchoolHeader';
import SchoolFooter from '../components/SchoolFooter';

interface StaffMember {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  bio: string;
}

const Staff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = React.useState<School | null>(null);
  const [staff, setStaff] = React.useState<StaffMember[]>(sampleStaff);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;

    // Fetch staff data
    fetchStaffBySchoolId(id)
      .then(data => setStaff(data))
      .catch(() => setError('Failed to load staff'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-12">Loading...</div>;
  if (error)
    return (
      <div className="p-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/schools" className="text-emerald-600 hover:underline">
          Back to directory
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <SchoolHeader school={school!} currentTab="staff" />
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-8">Meet Our Staff</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {staff.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-xl shadow-md text-center">
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-slate-600 italic mb-2">{member.title}</p>
              <p className="text-slate-700 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
      <SchoolFooter school={school!} isDarkMode={false} />
    </div>
  );
};

export default Staff;