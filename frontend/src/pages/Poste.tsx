import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Poste as PosteType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Poste: React.FC = () => {
  const [postes, setPostes] = useState<PosteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PosteType | null>(null);

  useEffect(() => {
    fetchPostes();
  }, []);

  const fetchPostes = async (q?: string) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/postes', { params: q ? { search: q } : {} });
      setPostes(res.data);
    } catch (err) {
      console.error('Error fetching postes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPostes(search);
    setSelected(null);
  };

  const formatSalary = (n: number) => n.toLocaleString('fr-FR') + ' €';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">💼</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Explorer un poste</h1>
        </div>
        <p className="text-gray-500">Découvrez les formations, salaires et opportunités pour chaque métier</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un métier..."
            className="search-input"
          />
        </div>
        <button type="submit" className="btn-orange px-6">
          Rechercher
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); fetchPostes(); setSelected(null); }}
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
          ) : postes.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">Aucun résultat pour "{search}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {postes.map((poste) => (
                <button
                  key={poste.id}
                  onClick={() => setSelected(poste)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === poste.id
                      ? 'bg-orange-50 border-orange-400 shadow-sm'
                      : 'bg-white border-gray-100 hover:bg-orange-50/50 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">{poste.title}</span>
                    {selected?.id === poste.id && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                  <span className="text-xs text-orange-500 font-medium">
                    ~{formatSalary(poste.averageSalary)}/an
                  </span>
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
                <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
                <p className="text-orange-100 text-sm">{selected.description}</p>
              </div>

              {/* Salary */}
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">💰 Salaires</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Minimum</p>
                    <p className="font-bold text-gray-900">{formatSalary(selected.minSalary)}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-600 mb-1">Moyenne</p>
                    <p className="font-bold text-orange-700">{formatSalary(selected.averageSalary)}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Maximum</p>
                    <p className="font-bold text-gray-900">{formatSalary(selected.maxSalary)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formations */}
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-3">🎓 Formations recommandées</h3>
                  <div className="space-y-2">
                    {selected.formations.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-3">🏢 Entreprises qui recrutent</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.companies.map((c) => (
                      <span key={c} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sectors */}
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-3">🏭 Secteurs</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.sectors.map((s) => (
                      <span key={s} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full border border-orange-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-3">⚡ Compétences clés</h3>
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
              <span className="text-5xl mb-4 block">💼</span>
              <p className="text-gray-600 font-medium">Sélectionnez un poste</p>
              <p className="text-gray-400 text-sm mt-1">pour voir ses détails, formations et salaires</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Poste;
