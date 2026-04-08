import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formation as FormationType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Formation: React.FC = () => {
  const [formations, setFormations] = useState<FormationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FormationType | null>(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async (q?: string) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/formations', { params: q ? { search: q } : {} });
      setFormations(res.data);
    } catch (err) {
      console.error('Error fetching formations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFormations(search);
    setSelected(null);
  };

  const formatSalary = (n: number) => n.toLocaleString('fr-FR') + ' €';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Explorer une formation</h1>
        </div>
        <p className="text-gray-500">Analysez les débouchés réels, salaires et taux d'insertion par formation</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une formation..."
            className="search-input"
          />
        </div>
        <button type="submit" className="btn-orange px-6">
          Rechercher
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); fetchFormations(); setSelected(null); }}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Effacer
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          {loading ? (
            <LoadingSpinner />
          ) : formations.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">Aucun résultat pour "{search}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formations.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === f.id
                      ? 'bg-orange-50 border-orange-400 shadow-sm'
                      : 'bg-white border-gray-100 hover:bg-orange-50/50 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{f.school}</p>
                    </div>
                    {selected?.id === f.id && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-1 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-green-600 font-medium">{f.insertionRate}% insertion</span>
                    <span className="text-xs text-orange-500 font-medium">~{formatSalary(f.averageSalary)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Title card */}
              <div className="card bg-gradient-to-br from-orange-500 to-orange-400 text-white">
                <h2 className="text-2xl font-bold mb-1">{selected.title}</h2>
                <p className="text-orange-100 text-sm mb-3">{selected.school}</p>
                <p className="text-white/90 text-sm">{selected.description}</p>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card text-center">
                  <p className="text-xs text-gray-500 mb-1">Durée</p>
                  <p className="font-bold text-gray-900 text-sm">{selected.duration}</p>
                </div>
                <div className="card text-center border-green-100 bg-green-50">
                  <p className="text-xs text-green-600 mb-1">Taux d'insertion</p>
                  <p className="font-bold text-green-700 text-xl">{selected.insertionRate}%</p>
                </div>
                <div className="card text-center border-orange-100 bg-orange-50">
                  <p className="text-xs text-orange-600 mb-1">Salaire à l'embauche</p>
                  <p className="font-bold text-orange-700 text-sm">{formatSalary(selected.averageSalary)}</p>
                </div>
              </div>

              {/* Insertion rate visual */}
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-3">📊 Taux d'insertion en emploi</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-700"
                      style={{ width: `${selected.insertionRate}%` }}
                    />
                  </div>
                  <span className="font-bold text-green-700 text-lg">{selected.insertionRate}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selected.insertionRate >= 90
                    ? 'Excellent taux d\'insertion — formation très recherchée'
                    : selected.insertionRate >= 80
                    ? 'Bon taux d\'insertion'
                    : 'Taux d\'insertion moyen'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Jobs */}
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-3">💼 Métiers accessibles</h3>
                  <div className="space-y-2">
                    {selected.accessibleJobs.map((job) => (
                      <div key={job} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-700">{job}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-3">⚡ Compétences enseignées</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.skills.map((s) => (
                      <span key={s} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-16">
              <span className="text-5xl mb-4 block">🎓</span>
              <p className="text-gray-600 font-medium">Sélectionnez une formation</p>
              <p className="text-gray-400 text-sm mt-1">pour voir ses débouchés, taux d'insertion et salaires</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Formation;
