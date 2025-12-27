// Testimonial component that shows two Testimonials side by side in card with a divider in between when summary is true. and should contain view more that links to the full testimonials page. 
// it should accept props for two testimonial texts, two author names, and two author titles.
// another prop should be the accent color to style the divider.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSchoolById } from '../services/api';
import { sampleTestimonials } from '../sampledatas';

type TestimonialEntry = { text: string; author?: string; title?: string };

interface TestimonialProps {
  testimonials?: TestimonialEntry[]; // prefer this
  testimonial?: TestimonialEntry[]; // alternate prop used in some pages
  accentColor?: string;
  summary?: boolean;
  schoolId?: string;
}

const Testimonial: React.FC<TestimonialProps> = ({
  testimonials: testimonialsProp,
  testimonial: testimonialAlt,
  accentColor = 'bg-emerald-500',
  summary = false,
  schoolId,
}) => {
  const [items, setItems] = useState<TestimonialEntry[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      // Priority: explicit prop `testimonials` -> `testimonial` -> fetch by schoolId -> sample fallback
      if (testimonialsProp && testimonialsProp.length > 0) {
        setItems(testimonialsProp);
        return;
      }

      if (testimonialAlt && testimonialAlt.length > 0) {
        setItems(testimonialAlt);
        return;
      }

      if (schoolId) {
        try {
          const school = await fetchSchoolById(schoolId);
          // some backends may include testimonials key
          // @ts-ignore
          const s = school.testimonials || school.testimonial || null;
          if (s && isMounted) {
            setItems(s as TestimonialEntry[]);
            return;
          }
        } catch (err) {
          // ignore and fallback
        }
      }

      // fallback to sample data
      if (isMounted) setItems(sampleTestimonials[0]?.testimonial || []);
    }

    load();
    return () => { isMounted = false; };
  }, [testimonialsProp, testimonialAlt, schoolId]);

  if (!items) return <div className="p-6 text-center">Loading testimonials...</div>;
  if (items.length === 0) return <div className="p-6 text-center">No testimonials available.</div>;

  return (
    <div className="w-full px-4 sm:px-6 py-8 sm:py-12">
      <div className={`grid ${summary ? 'grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8' : 'grid-cols-1 gap-6 sm:gap-8'}`}>
        {items.slice(0, summary ? 2 : items.length).map((data, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <p className="text-slate-700 mb-4 text-sm sm:text-base leading-relaxed italic">"{data.text}"</p>
            <div className="mt-4 border-t border-slate-100 pt-3">
              {data.author && <p className="font-semibold text-slate-900 text-sm sm:text-base">{data.author}</p>}
              {data.title && <p className="text-xs sm:text-sm text-slate-600">{data.title}</p>}
            </div>
          </div>
        ))}
      </div>
      {summary && items.length > 2 && schoolId && (
        <div className="mt-4 sm:mt-6 text-center">
          <Link to={`/school/${schoolId}/testimonials`} className="text-emerald-700 font-medium hover:underline text-sm sm:text-base">
            View More →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Testimonial;