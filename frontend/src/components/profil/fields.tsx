import React from 'react';

export const Label: React.FC<{ children: React.ReactNode; required?: boolean; htmlFor?: string }> = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}
    {required && <span className="text-orange-500"> *</span>}
  </label>
);

export const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="text-xs text-red-600 mt-1">{message}</p> : null;

export const inputClass = (error?: string) =>
  `input-field${error ? ' border-red-300 focus:ring-red-300' : ''}`;

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

// Sélecteur mois + année (input type="month" n'est pas supporté par Safari)
export const MonthYearSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  idPrefix: string;
}> = ({ value, onChange, error, disabled, idPrefix }) => {
  const [year, month] = value ? value.split('-') : ['', ''];
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => String(thisYear - i));

  // Une valeur partielle (ex : "2020-") reste possible tant que les deux listes ne sont pas remplies
  const update = (y: string, m: string) => onChange(y || m ? `${y}-${m}` : '');

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        id={`${idPrefix}-month`}
        aria-label="Mois"
        value={month}
        disabled={disabled}
        onChange={(e) => update(year, e.target.value)}
        className={inputClass(error)}
      >
        <option value="">Mois</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, '0')}>{name}</option>
        ))}
      </select>
      <select
        aria-label="Année"
        value={year}
        disabled={disabled}
        onChange={(e) => update(e.target.value, month)}
        className={inputClass(error)}
      >
        <option value="">Année</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
};

// Une date YYYY-MM complète (mois et année renseignés)
export const isFullMonth = (v: string) => /^\d{4}-\d{2}$/.test(v);
