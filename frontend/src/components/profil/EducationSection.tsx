import React, { useState } from 'react';
import { Education } from '../../types';
import { DEGREES, FIELDS, SCHOOLS } from '../../data/referentiels';
import { FieldError, inputClass, Label } from './fields';

interface Draft {
  school: string;
  degree: string;
  field: string;
  rank: string;
  promoSize: string;
}

const emptyDraft: Draft = { school: '', degree: '', field: '', rank: '', promoSize: '' };

const isPositiveInt = (v: string) => /^\d+$/.test(v) && parseInt(v) >= 1;

const validate = (d: Draft) => {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!d.school.trim()) errors.school = "L'établissement est requis";
  else if (d.school.length > 120) errors.school = '120 caractères maximum';
  if (!d.degree.trim()) errors.degree = 'Le nom de la formation est requis';
  else if (d.degree.length > 120) errors.degree = '120 caractères maximum';
  if (!d.field.trim()) errors.field = "Le domaine d'études est requis";
  else if (d.field.length > 120) errors.field = '120 caractères maximum';
  if (d.rank && !isPositiveInt(d.rank)) errors.rank = 'Nombre entier supérieur ou égal à 1';
  if (d.promoSize && !isPositiveInt(d.promoSize)) errors.promoSize = 'Nombre entier supérieur ou égal à 1';
  else if (d.promoSize && parseInt(d.promoSize) > 5000) errors.promoSize = '5 000 élèves maximum';
  if (d.rank && !d.promoSize && !errors.rank) errors.promoSize = "Indiquez l'effectif de la promo";
  if (!errors.rank && !errors.promoSize && d.rank && d.promoSize && parseInt(d.rank) > parseInt(d.promoSize)) {
    errors.rank = "Le classement ne peut pas dépasser l'effectif";
  }
  return errors;
};

const EducationForm: React.FC<{
  initial: Draft;
  onSubmit: (d: Draft) => void;
  onCancel: () => void;
  submitLabel: string;
}> = ({ initial, onSubmit, onCancel, submitLabel }) => {
  const [draft, setDraft] = useState<Draft>(initial);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validate(draft) : {};

  const set = (key: keyof Draft, value: string) => setDraft({ ...draft, [key]: value });

  const handleSubmit = () => {
    setSubmitted(true);
    if (Object.keys(validate(draft)).length === 0) onSubmit(draft);
  };

  // Entrée valide ce sous-formulaire au lieu d'envoyer tout le profil
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label required htmlFor="edu-school">Établissement</Label>
          <input
            id="edu-school"
            list="edu-schools"
            value={draft.school}
            onChange={(e) => set('school', e.target.value)}
            placeholder="Commencez à taper… (ex : ESSEC)"
            maxLength={120}
            className={inputClass(errors.school)}
          />
          <datalist id="edu-schools">
            {SCHOOLS.map((s) => <option key={s} value={s} />)}
          </datalist>
          <FieldError message={errors.school} />
        </div>
        <div>
          <Label required htmlFor="edu-degree">Nom de la formation</Label>
          <input
            id="edu-degree"
            list="edu-degrees"
            value={draft.degree}
            onChange={(e) => set('degree', e.target.value)}
            placeholder="Ex : Master Finance"
            maxLength={120}
            className={inputClass(errors.degree)}
          />
          <datalist id="edu-degrees">
            {DEGREES.map((s) => <option key={s} value={s} />)}
          </datalist>
          <FieldError message={errors.degree} />
        </div>
        <div>
          <Label required htmlFor="edu-field">Domaine d'études</Label>
          <input
            id="edu-field"
            list="edu-fields"
            value={draft.field}
            onChange={(e) => set('field', e.target.value)}
            placeholder="Ex : Finance"
            maxLength={120}
            className={inputClass(errors.field)}
          />
          <datalist id="edu-fields">
            {FIELDS.map((s) => <option key={s} value={s} />)}
          </datalist>
          <FieldError message={errors.field} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="edu-rank">Classement dans la promo</Label>
          <div className="flex items-center gap-2">
            <input
              id="edu-rank"
              type="number"
              inputMode="numeric"
              min={1}
              value={draft.rank}
              onChange={(e) => set('rank', e.target.value)}
              placeholder="Rang"
              className={`${inputClass(errors.rank)} max-w-[8rem]`}
            />
            <span className="text-gray-500 text-sm">sur</span>
            <input
              type="number"
              inputMode="numeric"
              aria-label="Effectif de la promo"
              min={1}
              max={5000}
              value={draft.promoSize}
              onChange={(e) => set('promoSize', e.target.value)}
              placeholder="Effectif"
              className={`${inputClass(errors.promoSize)} max-w-[8rem]`}
            />
          </div>
          <FieldError message={errors.rank || errors.promoSize} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="text-sm text-gray-600 px-4 py-2 rounded-full hover:bg-gray-100">
          Annuler
        </button>
        <button type="button" onClick={handleSubmit} className="btn-orange text-sm">
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

const toDraft = (e: Education): Draft => ({
  school: e.school,
  degree: e.degree,
  field: e.field,
  rank: e.rank?.toString() || '',
  promoSize: e.promoSize?.toString() || '',
});

const fromDraft = (d: Draft, id: string): Education => ({
  id,
  school: d.school.trim(),
  degree: d.degree.trim(),
  field: d.field.trim(),
  rank: d.rank ? parseInt(d.rank) : null,
  promoSize: d.promoSize ? parseInt(d.promoSize) : null,
});

const EducationSection: React.FC<{
  educations: Education[];
  onChange: (educations: Education[]) => void;
}> = ({ educations, onChange }) => {
  const [editing, setEditing] = useState<string | null>(null);

  const handleAdd = (d: Draft) => {
    onChange([...educations, fromDraft(d, `edu-${Date.now()}`)]);
    setEditing(null);
  };

  const handleUpdate = (id: string, d: Draft) => {
    onChange(educations.map((e) => (e.id === id ? fromDraft(d, id) : e)));
    setEditing(null);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-gray-900">Formations</h2>
        {editing !== 'new' && (
          <button type="button" onClick={() => setEditing('new')} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            + Ajouter une formation
          </button>
        )}
      </div>

      {editing === 'new' && (
        <div className="mb-4">
          <EducationForm initial={emptyDraft} onSubmit={handleAdd} onCancel={() => setEditing(null)} submitLabel="Ajouter" />
        </div>
      )}

      {educations.length === 0 && editing !== 'new' && (
        <p className="text-sm text-gray-500">Aucune formation renseignée pour le moment.</p>
      )}

      <div className="space-y-3">
        {educations.map((edu) =>
          editing === edu.id ? (
            <EducationForm
              key={edu.id}
              initial={toDraft(edu)}
              onSubmit={(d) => handleUpdate(edu.id, d)}
              onCancel={() => setEditing(null)}
              submitLabel="Enregistrer"
            />
          ) : (
            <div key={edu.id} className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
              <div className="w-10 h-10 shrink-0 bg-teal-50 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎓</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{edu.degree}</p>
                <p className="text-sm text-gray-600">{edu.school}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{edu.field}</span>
                  {edu.rank && edu.promoSize && (
                    <span className="text-xs bg-teal-50 text-teal-700 font-medium px-2 py-0.5 rounded-full">
                      Classement : {edu.rank}ᵉ / {edu.promoSize}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <button type="button" onClick={() => setEditing(edu.id)} className="text-gray-500 hover:text-gray-800">
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => onChange(educations.filter((e) => e.id !== edu.id))}
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default EducationSection;
