import React from 'react';

interface VisionProps {
  text?: string | null;
  accent?: string;
  title?: string;
}

const Vision: React.FC<VisionProps> = ({ text, accent = '#0ea5a4', title = 'Our Vision' }) => {
  if (!text) return null;
  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div style={{ width: 48, height: 6, background: accent }} className="rounded" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-slate-700">{text}</p>
      </div>
    </section>
  );
};

export default Vision;
