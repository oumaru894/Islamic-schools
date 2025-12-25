import React from 'react';

interface CoreValuesProps {
  values: string[];
  accent?: string; // hex color
  title?: string;
}

const CoreValues: React.FC<CoreValuesProps> = ({ values, accent = '#059669', title = 'Our Core Values' }) => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div style={{ width: 48, height: 6, background: accent }} className="rounded" />
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {values.map((v, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div style={{ background: accent }} className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">{String(i+1)}</div>
              <div>
                <p className="text-slate-800 font-semibold">{v}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreValues;
