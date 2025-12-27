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
    <div className="flex items-center justify-center bg-slate-50 py-6 sm:py-8">
      <div className="max-w-4xl w-full px-4 sm:px-6 bg-white rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row items-center md:space-x-6 lg:space-x-8 space-y-6 md:space-y-0 py-6">
          {/* Vice Principal Left */}
          <div className="flex-1 flex flex-col items-center w-full">
            <img
              src={left?.photo || left?.image || placeholder}
              alt={left?.name || 'Vice Principal'}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full mb-3 sm:mb-4 object-cover shadow-md"
            />
            <h3 className="text-base sm:text-lg font-semibold text-center">{left?.title || 'Vice Principal'}</h3>
            <p className="text-slate-600 text-xs sm:text-sm text-center">{left?.name || '—'}</p>
          </div>

          {/* Principal */}
          <div className="flex-1 flex flex-col items-center w-full">
            <img
              src={center?.photo || center?.image || placeholder}
              alt={center?.name || 'Principal'}
              className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full mb-3 sm:mb-4 border-4 border-emerald-500 object-cover shadow-lg"
              style={{ borderColor: (school.theme && (school.theme as any).accent) || undefined }}
            />
            <h3 className="text-base sm:text-lg font-semibold text-center">{center?.title || 'Principal'}</h3>
            <p className="text-slate-600 text-xs sm:text-sm text-center">{center?.name || '—'}</p>
          </div>

          {/* Vice Principal Right */}
          <div className="flex-1 flex flex-col items-center w-full">
            <img
              src={right?.photo || right?.image || placeholder}
              alt={right?.name || 'Vice Principal'}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full mb-3 sm:mb-4 object-cover shadow-md"
            />
            <h3 className="text-base sm:text-lg font-semibold text-center">{right?.title || 'Vice Principal'}</h3>
            <p className="text-slate-600 text-xs sm:text-sm text-center">{right?.name || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Administrator;
