import React, { useState } from 'react';
import { CONTRACT_TYPES, ContractType, Experience } from '../../types';
import { currentMonth, formatDuration, formatMonth, groupByCompany, monthsBetween } from '../../utils/duration';
import { FieldError, inputClass, isFullMonth, Label, MonthYearSelect } from './fields';

interface Draft {
  company: string;
  location: string;
  title: string;
  contractType: ContractType | '';
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

const emptyDraft: Draft = { company: '', location: '', title: '', contractType: '', startDate: '', endDate: '', isCurrent: false };

const validate = (d: Draft) => {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!d.company.trim()) errors.company = "Le nom de l'entreprise est requis";
  else if (d.company.length > 100) errors.company = '100 caractères maximum';
  if (d.location.length > 100) errors.location = '100 caractères maximum';
  if (!d.title.trim()) errors.title = "L'intitulé du poste est requis";
  else if (d.title.length > 100) errors.title = '100 caractères maximum';
  if (!d.contractType) errors.contractType = 'Choisissez un type de contrat';
  if (!isFullMonth(d.startDate)) errors.startDate = 'Mois et année de début requis';
  else if (d.startDate > currentMonth()) errors.startDate = 'La date de début ne peut pas être dans le futur';
  if (!d.isCurrent) {
    if (!isFullMonth(d.endDate)) errors.endDate = 'Mois et année de fin requis (ou cochez « poste actuel »)';
    else if (isFullMonth(d.startDate) && d.endDate < d.startDate) errors.endDate = 'La date de fin doit être après la date de début';
    else if (d.endDate > currentMonth()) errors.endDate = 'La date de fin ne peut pas être dans le futur';
  }
  return errors;
};

const ExperienceForm: React.FC<{
  initial: Draft;
  companies: string[];
  onSubmit: (d: Draft) => void;
  onCancel: () => void;
  submitLabel: string;
}> = ({ initial, companies, onSubmit, onCancel, submitLabel }) => {
  const [draft, setDraft] = useState<Draft>(initial);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validate(draft) : {};

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });

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
        <div>
          <Label required htmlFor="exp-company">Entreprise</Label>
          <input
            id="exp-company"
            list="exp-companies"
            value={draft.company}
            onChange={(e) => set('company', e.target.value)}
            placeholder="Ex : Capgemini"
            maxLength={100}
            className={inputClass(errors.company)}
          />
          <datalist id="exp-companies">
            {companies.map((c) => <option key={c} value={c} />)}
          </datalist>
          <FieldError message={errors.company} />
        </div>
        <div>
          <Label htmlFor="exp-location">Lieu</Label>
          <input
            id="exp-location"
            value={draft.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Ex : Paris, France"
            maxLength={100}
            className={inputClass(errors.location)}
          />
          <FieldError message={errors.location} />
        </div>
        <div>
          <Label required htmlFor="exp-title">Intitulé du poste</Label>
          <input
            id="exp-title"
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex : Chef de Projet Digital"
            maxLength={100}
            className={inputClass(errors.title)}
          />
          <FieldError message={errors.title} />
        </div>
        <div>
          <Label required htmlFor="exp-contract">Type de contrat</Label>
          <select
            id="exp-contract"
            value={draft.contractType}
            onChange={(e) => set('contractType', e.target.value as ContractType)}
            className={inputClass(errors.contractType)}
          >
            <option value="">Sélectionner</option>
            {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldError message={errors.contractType} />
        </div>
        <div>
          <Label required htmlFor="exp-start-month">Date de début</Label>
          <MonthYearSelect idPrefix="exp-start" value={draft.startDate} onChange={(v) => set('startDate', v)} error={errors.startDate} />
          <FieldError message={errors.startDate} />
        </div>
        <div>
          <Label required={!draft.isCurrent} htmlFor="exp-end-month">Date de fin</Label>
          <MonthYearSelect
            idPrefix="exp-end"
            value={draft.isCurrent ? '' : draft.endDate}
            onChange={(v) => set('endDate', v)}
            error={errors.endDate}
            disabled={draft.isCurrent}
          />
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={draft.isCurrent}
              onChange={(e) => set('isCurrent', e.target.checked)}
              className="accent-orange-500"
            />
            J'occupe actuellement ce poste
          </label>
          <FieldError message={errors.endDate} />
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

const toDraft = (e: Experience): Draft => ({
  company: e.company,
  location: e.location,
  title: e.title,
  contractType: e.contractType,
  startDate: e.startDate,
  endDate: e.endDate || '',
  isCurrent: e.endDate === null,
});

const fromDraft = (d: Draft, id: string): Experience => ({
  id,
  company: d.company.trim(),
  location: d.location.trim(),
  title: d.title.trim(),
  contractType: d.contractType as ContractType,
  startDate: d.startDate,
  endDate: d.isCurrent ? null : d.endDate,
});

const ExperienceSection: React.FC<{
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}> = ({ experiences, onChange }) => {
  // null = aucun formulaire ouvert ; 'new' = ajout ; sinon id de l'expérience modifiée
  const [editing, setEditing] = useState<string | null>(null);
  const [newInitial, setNewInitial] = useState<Draft>(emptyDraft);

  const groups = groupByCompany(experiences);
  const companies = groups.map((g) => g.company);

  const openNew = (prefill: Partial<Draft> = {}) => {
    setNewInitial({ ...emptyDraft, ...prefill });
    setEditing('new');
  };

  const handleAdd = (d: Draft) => {
    onChange([...experiences, fromDraft(d, `exp-${Date.now()}`)]);
    setEditing(null);
  };

  const handleUpdate = (id: string, d: Draft) => {
    onChange(experiences.map((e) => (e.id === id ? fromDraft(d, id) : e)));
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    onChange(experiences.filter((e) => e.id !== id));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-gray-900">Expériences professionnelles</h2>
        {editing !== 'new' && (
          <button type="button" onClick={() => openNew()} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            + Ajouter une expérience
          </button>
        )}
      </div>

      {editing === 'new' && (
        <div className="mb-4">
          <ExperienceForm
            initial={newInitial}
            companies={companies}
            onSubmit={handleAdd}
            onCancel={() => setEditing(null)}
            submitLabel="Ajouter"
          />
        </div>
      )}

      {groups.length === 0 && editing !== 'new' && (
        <p className="text-sm text-gray-500">Aucune expérience renseignée pour le moment.</p>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.key} className="rounded-xl border border-gray-100">
            {/* Entreprise */}
            <div className="flex items-start gap-3 p-4 border-b border-gray-100 bg-gray-50/60 rounded-t-xl">
              <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{group.company.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{group.company}</p>
                <p className="text-xs text-gray-500">
                  {group.location && <>{group.location} · </>}
                  {formatDuration(group.months)}
                  {group.roles.length > 1 && <> · {group.roles.length} postes</>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openNew({ company: group.company, location: group.location })}
                className="text-xs font-medium text-orange-600 hover:text-orange-700 whitespace-nowrap"
              >
                + Poste
              </button>
            </div>

            {/* Postes */}
            <ol className="p-4 space-y-4">
              {group.roles.map((role) =>
                editing === role.id ? (
                  <li key={role.id}>
                    <ExperienceForm
                      initial={toDraft(role)}
                      companies={companies}
                      onSubmit={(d) => handleUpdate(role.id, d)}
                      onCancel={() => setEditing(null)}
                      submitLabel="Enregistrer"
                    />
                  </li>
                ) : (
                  <li key={role.id} className={`flex items-start gap-3 ${group.roles.length > 1 ? 'pl-3 border-l-2 border-orange-200' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800">{role.title}</p>
                        <span className="text-xs bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full">
                          {role.contractType}
                        </span>
                        {role.endDate === null && (
                          <span className="text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full">En poste</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatMonth(role.startDate)} – {formatMonth(role.endDate)} · {formatDuration(monthsBetween(role.startDate, role.endDate))}
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <button type="button" onClick={() => setEditing(role.id)} className="text-gray-500 hover:text-gray-800">
                        Modifier
                      </button>
                      <button type="button" onClick={() => handleDelete(role.id)} className="text-red-500 hover:text-red-700">
                        Supprimer
                      </button>
                    </div>
                  </li>
                )
              )}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceSection;
