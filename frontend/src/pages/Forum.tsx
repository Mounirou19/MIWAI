import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FORUM_CATEGORIES, ForumCategory, ForumTopic } from '../types';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Forum: React.FC = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ForumCategory | ''>('');
  const [sort, setSort] = useState<'recent' | 'top'>('recent');
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'drafts'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ForumCategory | ''>('');
  const [newBody, setNewBody] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, [appliedSearch, categoryFilter, sort]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort };
      if (appliedSearch) params.search = appliedSearch;
      if (categoryFilter) params.category = categoryFilter;
      const res = await axios.get('/api/forum/topics', { params });
      setTopics(res.data.data);
    } catch (err) {
      console.error('Error fetching topics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewTitle('');
    setNewCategory('');
    setNewBody('');
    setCreateError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newCategory) {
      setCreateError('Veuillez choisir une catégorie');
      return;
    }
    setCreating(true);
    try {
      await axios.post('/api/forum/topics', { title: newTitle, category: newCategory, body: newBody });
      closeCreateModal();
      // Recharge la liste pour respecter le filtre et le tri en cours
      fetchTopics();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setCreateError(error.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getAuthorName = (topic: ForumTopic) => {
    if (topic.author.firstName || topic.author.lastName) {
      return `${topic.author.firstName || ''} ${topic.author.lastName || ''}`.trim();
    }
    return topic.author.email.split('@')[0];
  };

  const filteredTopics = activeTab === 'mine'
    ? topics.filter((t) => t.authorId === user?.id)
    : topics;

  return (
    <div>
      {/* Header — teal theme */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-300 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-lg">💬</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MIWAI Community</h1>
            <p className="text-gray-500 text-sm">Le forum des questions que les données ne répondent pas (encore)</p>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Sub-tabs */}
        <div className="flex bg-white border border-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-teal-400 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tous les sujets
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'mine'
                ? 'bg-teal-400 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Mes publications
          </button>
        </div>

        <div className="flex-1" />

        {/* Create button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-teal flex items-center gap-2"
        >
          <span>+</span> Créer un sujet
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un sujet..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
        </div>
        <button type="submit" className="btn-teal px-6">
          Rechercher
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); setAppliedSearch(''); }}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Effacer
          </button>
        )}
      </form>

      {/* Filtre par catégorie et tri */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <select
            aria-label="Filtrer par catégorie"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ForumCategory | '')}
            className={`appearance-none border rounded-xl pl-4 pr-9 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              categoryFilter ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <option value="">Catégorie : toutes</option>
            {FORUM_CATEGORIES.map((c) => (
              <option key={c} value={c}>#{c}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">▼</span>
        </div>

        <div className="flex bg-white border border-gray-100 rounded-xl p-1 gap-1" role="group" aria-label="Trier les sujets">
          {([
            { key: 'top', label: '🔥 Top' },
            { key: 'recent', label: '🕒 Récent' },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              type="button"
              aria-pressed={sort === opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                sort === opt.key ? 'bg-teal-400 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {categoryFilter && (
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Retirer le filtre ✕
          </button>
        )}
      </div>

      {/* Topic list */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredTopics.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl mb-3 block">💬</span>
          <p className="text-gray-600 font-medium">
            {activeTab === 'mine'
              ? 'Vous n\'avez pas encore publié de sujet'
              : categoryFilter
              ? `Aucun sujet dans la catégorie #${categoryFilter}`
              : 'Aucun sujet trouvé'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-teal mt-4 inline-block"
          >
            Créer le premier sujet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              to={`/forum/${topic.id}`}
              className="card block hover:border-teal-200 hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-teal-300 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {getAuthorName(topic).charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full mb-1.5">
                    #{topic.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-1 hover:text-teal-600 transition-colors line-clamp-1">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {topic.body}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{getAuthorName(topic)}</span>
                    <span>·</span>
                    <span>{formatDate(topic.createdAt)}</span>
                    <span>·</span>
                    <span>👁 {topic.views} vues</span>
                    <span>·</span>
                    <span className="text-teal-600 font-medium">
                      💬 {topic._count.replies} réponse{topic._count.replies !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Créer un nouveau sujet</h2>
              <p className="text-sm text-gray-500 mt-1">Partagez votre expérience avec la communauté</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                {createError && (
                  <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm border border-red-100">
                    {createError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Mon expérience après le Master 243..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Catégorie">
                    {FORUM_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={newCategory === c}
                        onClick={() => setNewCategory(c)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                          newCategory === c
                            ? 'bg-teal-400 border-teal-400 text-white font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700'
                        }`}
                      >
                        #{c}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Choisissez le thème principal de votre sujet</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Corps du message</label>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Décrivez votre expérience, posez votre question..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                    rows={6}
                    required
                  />
                </div>
              </div>
              <div className="p-6 pt-0 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-teal disabled:opacity-60"
                >
                  {creating ? 'Publication...' : 'Publier le sujet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
