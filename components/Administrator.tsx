// Administrator component that has the principal in the middle, vice principals on the sides.
import { School } from '@/server/src/schoolService';
import React, { useEffect, useState } from 'react';
import { listPeople } from '../services/api';

const Administrator: React.FC<{ school: School }> = ({ school }) => {
  // Try to fetch people (administrators/staff) from backend people table for this school.
  const [people, setPeople] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!school?.id) return;
    setLoading(true);
    listPeople(school.id)
      .then(rows => setPeople(rows))
      .catch(() => setPeople(null))
      .finally(() => setLoading(false));
  }, [school?.id]);

  // Prefer people fetched from backend, otherwise use legacy leadership field from school
  const raw = people && people.length > 0 ? people : (school.leadership || []);

  // Normalize role/title matching (case-insensitive). We'll pick exactly three slots:
  // - principal => center
  // - vice principal (administration) => left
  // - vice principal (institution) => right
  const toLower = (s?: string) => (s || '').toLowerCase();
  let principal: any = null;
  let vpAdmin: any = null;
  let vpInstitution: any = null;

  for (const p of raw) {
    const role = toLower(p.role || p.title || '');
    // match principal
    if (!principal && (role.includes('principal') && !role.includes('vice'))) {
      principal = p;
      continue;
    }
    // match vice principal administration
    if (!vpAdmin && (role.includes('vice') && (role.includes('administr') || role.includes('admin')))) {
      vpAdmin = p;
      continue;
    }
    // match vice principal institution (institution, institutional)
    if (!vpInstitution && (role.includes('vice') && (role.includes('institution') || role.includes('institutional')))) {
      vpInstitution = p;
      continue;
    }
    // fallback: if title contains 'vice' and we still don't have left/right, assign heuristically
    if (!vpAdmin && !vpInstitution && role.includes('vice')) {
      if (!vpAdmin) vpAdmin = p; else if (!vpInstitution) vpInstitution = p;
    }
  }

  // If no explicit principal found, try to find any title containing 'principal' (including vice) and prefer non-vice
  if (!principal) {
    principal = raw.find((r: any) => toLower(r.title || r.role || '').includes('principal')) || null;
  }

  const left = vpAdmin || null;
  const center = principal || null;
  const right = vpInstitution || null;

  const placeholder = 'https://e7.pngegg.com/pngimages/84/165/png-clipart-united-states-avatar-organization-information-user-avatar-service-computer-wallpaper-thumbnail.png';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-4xl w-full p-6 bg-white rounded-xl shadow-md flex items-center space-x-8">
        {/* Vice Principal Left */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={left?.photo || left?.image || placeholder}
            alt={left?.name || 'Vice Principal'}
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
          <h3 className="text-lg font-semibold">{left?.title || 'Vice Principal'}</h3>
          <p className="text-slate-600 text-sm">{left?.name || '—'}</p>
        </div>

        {/* Principal */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={center?.photo || center?.image || placeholder}
            alt={center?.name || 'Principal'}
            className="w-40 h-40 rounded-full mb-4 border-4 border-emerald-500 object-cover"
            style={{ borderColor: (school.theme && (school.theme as any).accent) || undefined }}
          />
          <h3 className="text-lg font-semibold">{center?.title || 'Principal'}</h3>
          <p className="text-slate-600 text-sm">{center?.name || '—'}</p>
        </div>

        {/* Vice Principal Right */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={right?.photo || right?.image || placeholder}
            alt={right?.name || 'Vice Principal'}
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
          <h3 className="text-lg font-semibold">{right?.title || 'Vice Principal'}</h3>
          <p className="text-slate-600 text-sm">{right?.name || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default Administrator;
