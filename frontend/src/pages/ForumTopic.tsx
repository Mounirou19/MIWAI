import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ForumTopic as ForumTopicType } from '../types';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ForumTopic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<ForumTopicType | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/forum/topics/${id}`);
      setTopic(res.data);
    } catch (err) {
      console.error('Error fetching topic', err);
    } finally {
      // setLoading(false);
      setTopic(null);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError('');
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/forum/topics/${id}/replies`, { body: replyBody });
      if (topic) {
        setTopic({
          ...topic,
          replies: [...(topic.replies || []), res.data],
          _count: { replies: topic._count.replies + 1 },
        });
      }
      setReplyBody('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setReplyError(error.response?.data?.error || 'Erreur lors de la publication');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAuthorName = (author: { firstName: string | null; lastName: string | null; email: string }) => {
    if (author.firstName || author.lastName) {
      return `${author.firstName || ''} ${author.lastName || ''}`.trim();
    }
    return author.email.split('@')[0];
  };

  const getInitial = (author: { firstName: string | null; lastName: string | null; email: string }) => {
    return getAuthorName(author).charAt(0).toUpperCase();
  };

  if (loading) return (
    <div>
      <div className="mb-4">
        <Link to="/forum" className="text-sm text-teal-500 hover:text-teal-600 flex items-center gap-1">
          ← Retour au forum
        </Link>
      </div>
      <LoadingSpinner />
    </div>
  );

  if (!topic) return (
    <div>
      <div className="mb-4">
        <Link to="/forum" className="text-sm text-teal-500 hover:text-teal-600 flex items-center gap-1">
          ← Retour au forum
        </Link>
      </div>
      <div className="card text-center py-12">
        <p className="text-gray-600">Sujet introuvable</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/forum')}
          className="text-sm text-teal-500 hover:text-teal-600 flex items-center gap-1"
        >
          ← Retour au forum
        </button>
      </div>

      {/* Topic header */}
      <div className="card mb-6 border-l-4 border-teal-400">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-300 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">
              {getInitial(topic.author)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{topic.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              <span className="font-medium text-gray-600">{getAuthorName(topic.author)}</span>
              <span>·</span>
              <span>{formatDate(topic.createdAt)}</span>
              <span>·</span>
              <span>👁 {topic.views} vues</span>
              <span>·</span>
              <span className="text-teal-600">💬 {topic._count.replies} réponse{topic._count.replies !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {topic.body}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {topic.replies && topic.replies.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold text-gray-900">
            {topic.replies.length} réponse{topic.replies.length !== 1 ? 's' : ''}
          </h2>
          {topic.replies.map((reply, index) => (
            <div
              key={reply.id}
              className={`card ${reply.authorId === user?.id ? 'border-teal-100 bg-teal-50/30' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {getInitial(reply.author)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800 text-sm">
                      {getAuthorName(reply.author)}
                    </span>
                    {reply.authorId === user?.id && (
                      <span className="bg-teal-100 text-teal-600 text-xs px-2 py-0.5 rounded-full">Vous</span>
                    )}
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-gray-400 text-xs">{formatDate(reply.createdAt)}</span>
                    <span className="ml-auto text-xs text-gray-400">#{index + 1}</span>
                  </div>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {reply.body}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      <div className="card border-2 border-teal-100">
        <h3 className="font-bold text-gray-900 mb-4">Votre réponse</h3>
        {replyError && (
          <div className="bg-red-50 text-red-700 rounded-xl p-3 mb-4 text-sm border border-red-100">
            {replyError}
          </div>
        )}
        <form onSubmit={handleReply}>
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Partagez votre expérience ou répondez à la question..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none mb-4"
            rows={5}
            required
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Soyez constructif et bienveillant</p>
            <button
              type="submit"
              disabled={submitting || !replyBody.trim()}
              className="btn-teal disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Publication...' : 'Publier la réponse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForumTopic;
