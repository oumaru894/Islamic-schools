// Rules and Regulations component
// that displays the rules and regulations of the school.
// It should accept props for the school data.
// It should be styled using Tailwind CSS.
// the rules and regulations listed should each be displayed in grid format with each rule in a card. example: "New admissions", procedure for withdrawal, school fees, examiations and promotion
// the top left corner and the bottom right corner of the card should be rounded and the border should be thick and colored of the accent color of the school passed as prop.
// the accent color should default to emerald if not passed.
import React from 'react';

interface RulesProps {
  rules: string[];
  accentColor?: string;
}


const Rules: React.FC<RulesProps> = ({ rules, accentColor = 'emerald' }) => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-2xl font-bold mb-8 text-slate-900 text-center">Rules and Regulations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule, index) => (
          <div
            key={index}
            // make border thicker
            className="border-8 border-emerald-500 rounded-tl-xl rounded-br-xl p-6 bg-white shadow-md"
          >
            <p className="text-slate-700">{rule}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Rules;
