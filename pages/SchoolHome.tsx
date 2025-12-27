import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
import Button from '../components/Button';
import { School } from '../types';
import {
  MapPin,
  Users,
  CheckCircle,
  GraduationCap,
  ShieldCheck,
  School as SchoolIcon,
} from 'lucide-react';
import SchoolHeader from '../components/SchoolHeader';
import Administrator from '../components/Administrator';
import Gallery from '../components/Gallery';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import CoreValues from '../components/CoreValues';
import Mission from '../components/Mission';
import Vision from '../components/Vision';


import { sampleSchool } from '@/services/school';

const SchoolHome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      <SchoolHeader school={school} currentTab="home" />

  {/**
   * HERO (commented out)
   * <section
   *   className="relative h-[70vh] bg-cover bg-center flex items-center"
   *   style={{ backgroundImage: `url(https://images.unsplash.com/photo-1588072432836-e10032774350)` }}
   * >
   *   <div className="absolute inset-0 bg-black/50" />
   *   <div className="relative z-10 max-w-5xl mx-auto px-6 text-white">
   *     <h1 className="text-4xl md:text-5xl font-bold mb-4">{school.name}</h1>
   *     <p className="text-lg mb-6 max-w-2xl">{school.tagline || school.mission}</p>
   *     <div className="flex gap-4">
   *       <Link to={`/school/${school.id}/admissions`}><Button>Apply for Admission</Button></Link>
   *       <Link to={`/school/${school.id}/academics`}><Button variant="outline">View Academics</Button></Link>
   *     </div>
   *   </div>
   * </section>
   */}

      {/* TRUST INDICATORS */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6">
          {[
            { icon: Users, label: 'Qualified Teachers' },
            { icon: GraduationCap, label: 'Strong Academic Results' },
            { icon: ShieldCheck, label: 'Safe Environment' },
            { icon: SchoolIcon, label: 'Modern Facilities' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded shadow-sm border text-center"
            >
              <item.icon
                className="mx-auto mb-3"
                style={{ color: 'var(--school-accent)' }}
              />
              <div className="font-semibold">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 py-20">
        <div>
          <h2 className="text-2xl font-bold mb-4">About {school.name}</h2>
          <p className="text-slate-700 mb-4">{school.description}</p>
          <Link
            to={`/school/${school.id}/about`}
            className="text-emerald-700 font-medium"
          >
            Read More →
          </Link>
        </div>
        {school.image && (
          <img
            src={school.image}
            alt={school.name}
            className="rounded-xl shadow"
          />
        )}
      </section>

      {/* MISSION, VISION, CORE VALUES (styled components) */}
      <Mission text={school.mission} accent={school.theme?.accent} />
      <Vision text={school.vision} accent={school.theme?.accent} />

      {school.coreValues && school.coreValues.length > 0 && (
        <CoreValues values={school.coreValues} accent={school.theme?.accent} />
      )}

      {/* FEATURES */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-bold mb-6">Campus Features</h3>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {school.features.map((f, i) => (
              <li
                key={i}
                className="flex items-center text-slate-700"
              >
                <CheckCircle
                  className="h-4 w-4 mr-2"
                  style={{ color: 'var(--school-accent)' }}
                />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SUMMARY BLOCKS: Administrator, Gallery, Testimonials, Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div>
            <h3 className="text-xl font-bold mb-4">Administration</h3>
            <Administrator school={school as any} />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Gallery</h3>
            <Gallery schoolId={school.id} summary />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">What Parents Say</h3>
            <Testimonial schoolId={school.id} summary />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <Contact school={school} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-700 text-white py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Give Your Child a Strong Academic Foundation
        </h2>
        <Link to={`/school/${school.id}/admissions`}>
          <Button className="bg-white text-emerald-700">
            Enroll Now
          </Button>
        </Link>
      </section>

      {/* FOOTER QUICK INFO */}
      <footer className="bg-slate-900 text-slate-300 py-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white font-semibold mb-2">{school.name}</h4>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {school.contact.address}
            </p>
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4" /> {school.contact.phone}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to={`/school/${school.id}/about`}>About</Link>
              <Link to={`/school/${school.id}/academics`}>Academics</Link>
              <Link to={`/school/${school.id}/admissions`}>Admissions</Link>
              <Link to={`/school/${school.id}/contact`}>Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Office Hours</h4>
            <p>Mon – Fri: 8:00 AM – 4:00 PM</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SchoolHome;
