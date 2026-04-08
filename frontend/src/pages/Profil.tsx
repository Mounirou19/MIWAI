import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const SECTORS = [
  'Tech', 'Finance', 'Conseil', 'Santé', 'E-commerce', 'Retail',
  'Industrie', 'Immobilier', 'Éducation', 'Médias', 'Telecom', 'Autre'
];

const Profil: React.FC = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    currentJob: '',
    currentSalary: '',
    yearsExperience: '',
    sector: '',
    formations: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/users/me');
        const user: User = res.data;
        setForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          currentJob: user.profile?.currentJob || '',
          currentSalary: user.profile?.currentSalary?.toString() || '',
          yearsExperience: user.profile?.yearsExperience?.toString() || '',
          sector: user.profile?.sector || '',
          formations: user.profile?.formations || '',
        });
      } catch (err) {
        console.error('Error fetching user', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', form);
      updateUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

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

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Infos personnelles */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Parcours académique */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Parcours académique</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Formation(s) suivie(s)
              </label>
              <textarea
                name="formations"
                value={form.formations}
                onChange={handleChange}
                placeholder="Ex: Master Informatique Paris 6, BTS SIO..."
                className="input-field resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-1">Listez vos formations séparées par des virgules</p>
            </div>
          </div>

          {/* Situation professionnelle */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Situation professionnelle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Poste actuel</label>
                <input
                  type="text"
                  name="currentJob"
                  value={form.currentJob}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Full Stack"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Salaire actuel (€/an)
                  </label>
                  <input
                    type="number"
                    name="currentSalary"
                    value={form.currentSalary}
                    onChange={handleChange}
                    placeholder="45000"
                    min="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Années d'expérience
                  </label>
                  <input
                    type="number"
                    name="yearsExperience"
                    value={form.yearsExperience}
                    onChange={handleChange}
                    placeholder="3"
                    min="0"
                    max="50"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur</label>
                <select
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  className="input-field"
                >
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
          <button
            type="submit"
            disabled={saving}
            className="btn-orange disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profil;
