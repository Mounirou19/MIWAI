import { Experience } from '../types';

// Dates au format YYYY-MM. Un mois de début et de fin identiques = 1 mois.

export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const toIndex = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};

const interval = (e: Pick<Experience, 'startDate' | 'endDate'>): [number, number] => [
  toIndex(e.startDate),
  toIndex(e.endDate || currentMonth()),
];

export const monthsBetween = (start: string, end: string | null) => {
  const [a, b] = interval({ startDate: start, endDate: end });
  return Math.max(0, b - a + 1);
};

// Durée totale sans compter deux fois les périodes qui se chevauchent
export const totalMonths = (items: Pick<Experience, 'startDate' | 'endDate'>[]) => {
  const sorted = items.map(interval).sort((x, y) => x[0] - y[0]);
  let total = 0;
  let cur: [number, number] | null = null;
  for (const [s, e] of sorted) {
    if (!cur || s > cur[1] + 1) {
      if (cur) total += cur[1] - cur[0] + 1;
      cur = [s, e];
    } else {
      cur[1] = Math.max(cur[1], e);
    }
  }
  if (cur) total += cur[1] - cur[0] + 1;
  return total;
};

export const formatDuration = (months: number) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} an${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} mois`);
  return parts.join(' ') || 'moins d\'un mois';
};

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export const formatMonth = (ym: string | null) => {
  if (!ym) return 'aujourd\'hui';
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

export interface CompanyGroup {
  key: string;
  company: string;
  location: string;
  months: number;
  roles: Experience[];
}

// Regroupe les postes par entreprise (nom insensible à la casse), plus récente d'abord
export const groupByCompany = (experiences: Experience[]): CompanyGroup[] => {
  const map = new Map<string, Experience[]>();
  for (const e of experiences) {
    const key = e.company.trim().toLowerCase();
    map.set(key, [...(map.get(key) || []), e]);
  }
  const lastEnd = (roles: Experience[]) => Math.max(...roles.map((r) => interval(r)[1]));
  return [...map.entries()]
    .map(([key, roles]) => {
      const sorted = [...roles].sort((a, b) => b.startDate.localeCompare(a.startDate));
      return {
        key,
        company: sorted[0].company,
        location: sorted.find((r) => r.location)?.location || '',
        months: totalMonths(roles),
        roles: sorted,
      };
    })
    .sort((a, b) => lastEnd(b.roles) - lastEnd(a.roles));
};
