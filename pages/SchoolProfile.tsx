import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SchoolHeader from '../components/SchoolHeader';
import { fetchSchoolById } from '../services/api';
import { getCurrentUser } from '../services/authService';
import Testimonial from '../components/Testimonial';
import Button from '../components/Button';

const SchoolProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [school, setSchool] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const s = await fetchSchoolById(id);
        setSchool(s);
      } catch (err: any) {
        setError(err.message || 'Failed to load school');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const user = getCurrentUser();
  const isAdminOfSchool = user && user.role === 'administrator' && user.school_id === id;

  if (loading) return <div className="p-12">Loading...</div>;
  if (error) return <div className="p-12 text-red-600">{error}</div>;
  if (!school) return <div className="p-12">School not found</div>;

  return (
    <div>
      <SchoolHeader school={school} currentTab="profile" rightContent={isAdminOfSchool ? (<div className="flex gap-2"><Link to={`/admin/manage-school/${id}`}><Button size="sm">Edit Profile</Button></Link></div>) : null} />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-3">About</h2>
            <p className="text-slate-700">{school.description}</p>

            {school.mission && (
              <div className="mt-6">
                <h3 className="font-semibold">Mission</h3>
                <p className="text-slate-700">{school.mission}</p>
              </div>
            )}

            {school.vision && (
              <div className="mt-6">
                <h3 className="font-semibold">Vision</h3>
                <p className="text-slate-700">{school.vision}</p>
              </div>
            )}

            {school.leadership && school.leadership.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Leadership</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {school.leadership.map((m: any) => (
                    <div key={m.id} className="border rounded p-3">
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-sm text-slate-600">{m.title}</div>
                      {m.bio && <p className="mt-2 text-slate-700 text-sm">{m.bio}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-slate-500">Founded</h4>
                <div className="font-semibold">{school.founded}</div>
              </div>

              <div>
                <h4 className="text-sm text-slate-500">Students</h4>
                <div className="font-semibold">{school.students}</div>
              </div>

              <div>
                <h4 className="text-sm text-slate-500">Rating</h4>
                <div className="font-semibold">{school.rating}</div>
              </div>

              {school.contact && (
                <div className="mt-4">
                  <h4 className="text-sm text-slate-500">Contact</h4>
                  <div className="text-sm text-slate-700">{school.contact.email}</div>
                  <div className="text-sm text-slate-700">{school.contact.phone}</div>
                  <div className="text-sm text-slate-700">{school.contact.address}</div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {school.gallery && school.gallery.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {school.gallery.slice(0, 8).map((g: any) => (
                <img key={g.id} src={g.url} alt={g.caption || 'gallery image'} className="w-full h-36 object-cover rounded" />
              ))}
            </div>
            <div className="mt-4">
              <Link to={`/school/${id}/gallery`} className="text-emerald-700 hover:underline">View full gallery →</Link>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">What parents say</h3>
          <Testimonial testimonials={school.testimonials || []} summary={true} schoolId={id} accentColor={school.theme?.accent || undefined} />
        </div>
      </div>
    </div>
  );
};

export default SchoolProfile;
