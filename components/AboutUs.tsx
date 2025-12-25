// About Us components with prop that can schoool data 
import React from 'react';
import { School } from '../types';
import { Link } from 'react-router-dom';
import CoreValues from './CoreValues';
import Mission from './Mission';
import Vision from './Vision';

interface AboutUsProps {
  school: School;
}

const AboutUs: React.FC<AboutUsProps> = ({ school }) => {
  return (
    <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 py-20">
        <div>
          <h2 className="text-2xl font-bold mb-4">About {school.name}</h2>
          <p className="text-slate-700 mb-4">{school.description}</p>

          {school.mission && (
            <div className="mb-4">
              <Mission text={school.mission} accent={school.theme?.accent} />
            </div>
          )}

          {school.vision && (
            <div className="mb-4">
              <Vision text={school.vision} accent={school.theme?.accent} />
            </div>
          )}

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

      { (school.coreValues && school.coreValues.length > 0) && (
        <div className="md:col-span-2 mt-6">
          <CoreValues values={school.coreValues} accent={school.theme?.accent} />
        </div>
      )}
      </section>
  );
};

export default AboutUs;
