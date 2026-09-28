import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Education, Experience, User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ExperienceSection from '../components/profil/ExperienceSection';
import EducationSection from '../components/profil/EducationSection';
import { FieldError, inputClass, Label } from '../components/profil/fields';
import { COUNTRIES } from '../data/referentiels';
import { totalMonths } from '../utils/duration';

const SECTORS = [
  'Tech', 'Finance', 'Conseil', 'Santé', 'E-commerce', 'Retail',
  'Industrie', 'Immobilier', 'Éducation', 'Médias', 'Telecom', 'Autre'
];

interface PersonalForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  city: string;
  country: string;
  currentSalary: string;
  sector: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+\d{8,15}|0\d{9})$/;
const PLACE_RE = /^\p{L}[\p{L}\s'’.-]*$/u;
const NAME_RE = /^\p{L}[\p{L}\s'’-]*$/u;

const validatePersonal = (f: PersonalForm) => {
  const errors: Partial<Record<keyof PersonalForm, string>> = {};
  if (f.firstName && (!NAME_RE.test(f.firstName) || f.firstName.length > 50)) errors.firstName = 'Lettres uniquement, 50 caractères maximum';
  if (f.lastName && (!NAME_RE.test(f.lastName) || f.lastName.length > 50)) errors.lastName = 'Lettres uniquement, 50 caractères maximum';
  if (!f.email.trim()) errors.email = "L'email est requis";
  else if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Adresse email invalide (ex : nom@domaine.fr)';
  if (f.phone && !PHONE_RE.test(f.phone.replace(/[\s.-]/g, ''))) {
    errors.phone = 'Numéro invalide : 10 chiffres commençant par 0, ou format international (+33…)';
  }
  if (f.age) {
    const age = Number(f.age);
    if (!Number.isInteger(age) || age < 16 || age > 99) errors.age = 'Âge entre 16 et 99 ans';
  }
  if (f.city && (!PLACE_RE.test(f.city) || f.city.length > 60)) errors.city = 'Nom de ville invalide';
  if (f.country && (!PLACE_RE.test(f.country) || f.country.length > 60)) errors.country = 'Nom de pays invalide';
  if (f.currentSalary) {
    const s = Number(f.currentSalary);
    if (!Number.isInteger(s) || s < 0 || s > 1000000) errors.currentSalary = 'Montant entre 0 et 1 000 000 €';
  }
  return errors;
};

const Profil: React.FC = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [form, setForm] = useState<PersonalForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    city: '',
    country: '',
    currentSalary: '',
    sector: '',
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/users/me');
        const user: User = res.data;
        const p = user.profile;
        setForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: p?.phone || '',
          age: p?.age?.toString() || '',
          city: p?.city || '',
          country: p?.country || '',
          currentSalary: p?.currentSalary?.toString() || '',
          sector: p?.sector || '',
        });
        setExperiences(p?.experiences || []);
        setEducations(p?.educations || []);
      } catch (err) {
        console.error('Error fetching user', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const errors = submitted ? validatePersonal(form) : {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setDirty(true);
  };

  const handleExperiences = (list: Experience[]) => {
    setExperiences(list);
    setDirty(true);
  };

  const handleEducations = (list: Education[]) => {
    setEducations(list);
    setDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSubmitted(true);
    if (Object.keys(validatePersonal(form)).length > 0) {
      setError('Certains champs sont invalides, vérifiez le formulaire.');
      return;
    }

    // Poste actuel et années d'expérience déduits des expériences (utilisés par le dashboard)
    const current = [...experiences]
      .filter((x) => x.endDate === null)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

    setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', {
        ...form,
        email: form.email.trim(),
        phone: form.phone.trim(),
        currentJob: current?.title || '',
        yearsExperience: experiences.length ? String(Math.floor(totalMonths(experiences) / 12)) : '',
        formations: educations.map((x) => `${x.degree} — ${x.school}`).join(', '),
        experiences,
        educations,
      });
      updateUser(res.data);
      setSuccess(true);
      setDirty(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const displayName = `${form.firstName} ${form.lastName}`.trim() || form.email;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">👤</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
        </div>
        <p className="text-gray-500">Complétez vos informations pour obtenir des analyses personnalisées</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* En-tête : Prénom NOM */}
          <div className="card">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {form.firstName} <span className="uppercase">{form.lastName}</span>
                </p>
                {[form.city, form.country].filter(Boolean).length > 0 && (
                  <p className="text-sm text-gray-500">📍 {[form.city, form.country].filter(Boolean).join(', ')}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jean" maxLength={50} autoComplete="given-name" className={inputClass(errors.firstName)} />
                <FieldError message={errors.firstName} />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dupont" maxLength={50} autoComplete="family-name" className={inputClass(errors.lastName)} />
                <FieldError message={errors.lastName} />
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required htmlFor="email">Email</Label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jean.dupont@mail.fr" maxLength={254} autoComplete="email" className={inputClass(errors.email)} />
                <FieldError message={errors.email} />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="06 12 34 56 78" maxLength={20} autoComplete="tel" className={inputClass(errors.phone)} />
                <FieldError message={errors.phone} />
              </div>
              <div>
                <Label htmlFor="age">Âge</Label>
                <input id="age" name="age" type="number" inputMode="numeric" min={16} max={99} value={form.age} onChange={handleChange} placeholder="30" className={inputClass(errors.age)} />
                <FieldError message={errors.age} />
              </div>
              <div />
              <div>
                <Label htmlFor="city">Ville</Label>
                <input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Paris" maxLength={60} autoComplete="address-level2" className={inputClass(errors.city)} />
                <FieldError message={errors.city} />
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <input id="country" name="country" list="countries" value={form.country} onChange={handleChange} placeholder="France" maxLength={60} autoComplete="country-name" className={inputClass(errors.country)} />
                <datalist id="countries">
                  {COUNTRIES.map((c) => <option key={c} value={c} />)}
                </datalist>
                <FieldError message={errors.country} />
              </div>
            </div>
          </div>

          <ExperienceSection experiences={experiences} onChange={handleExperiences} />

          <EducationSection educations={educations} onChange={handleEducations} />

          {/* Rémunération : utilisée par le dashboard */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Rémunération et secteur</h2>
            <p className="text-xs text-gray-500 mb-4">Utilisés pour votre positionnement salarial dans le dashboard.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentSalary">Salaire actuel (€ brut/an)</Label>
                <input id="currentSalary" name="currentSalary" type="number" inputMode="numeric" min={0} value={form.currentSalary} onChange={handleChange} placeholder="45000" className={inputClass(errors.currentSalary)} />
                <FieldError message={errors.currentSalary} />
              </div>
              <div>
                <Label htmlFor="sector">Secteur</Label>
                <select id="sector" name="sector" value={form.sector} onChange={handleChange} className="input-field">
                  <option value="">Sélectionner un secteur</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm border border-green-100 flex items-center gap-2">
              <span>✓</span> Profil sauvegardé avec succès !
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              disabled={saving}
              className="btn-orange disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </button>
            {dirty && !saving && <span className="text-xs text-orange-600">Modifications non sauvegardées</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profil;
