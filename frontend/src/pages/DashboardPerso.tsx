import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPerso: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fullUser, setFullUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/users/me');
        setFullUser(res.data);
        updateUser(res.data);
      } catch (err) {
        console.error('Error fetching user', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <LoadingSpinner />;

  const profile = fullUser?.profile;
  const isProfileComplete = profile?.currentJob && profile?.currentSalary && profile?.yearsExperience && profile?.sector;

  const displayName = fullUser?.firstName
    ? `${fullUser.firstName}${fullUser.lastName ? ' ' + fullUser.lastName : ''}`
    : fullUser?.email || 'Utilisateur';

  // Mock salary data for chart
  const salaryData = [
    { label: 'Junior (0-2 ans)', value: 35000 },
    { label: 'Intermédiaire (2-5 ans)', value: 48000 },
    { label: 'Senior (5-10 ans)', value: 62000 },
    { label: 'Expert (10+ ans)', value: 78000 },
  ];

  const userSalaryValue = profile?.currentSalary || 0;
  const maxSalary = 90000;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mon dashboard perso !</h1>
        </div>
        <p className="text-gray-500">Analysez votre positionnement et vos opportunités de carrière</p>
      </div>

      {/* Welcome Card */}
      <div className="card mb-6 border-l-4 border-orange-400">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Bonjour {displayName},
            </h2>
            {!isProfileComplete ? (
              <>
                <p className="text-orange-600 font-medium text-sm mb-2">
                  Votre profil semble incomplet.
                </p>
                <p className="text-gray-600 text-sm max-w-lg">
                  Pour vous proposer des analyses et recommandations réellement personnalisées,
                  nous vous invitons à compléter davantage votre parcours académique et professionnel.
                </p>
                <div className="mt-4">
                  <Link to="/profil" className="btn-orange text-sm">
                    Compléter mon profil
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-green-600 font-medium text-sm">
                Votre profil est complet ! Voici vos analyses personnalisées.
              </p>
            )}
          </div>
          <div className="hidden sm:flex w-16 h-16 bg-orange-50 rounded-2xl items-center justify-center">
            <span className="text-3xl">{isProfileComplete ? '🚀' : '👤'}</span>
          </div>
        </div>
      </div>

      {isProfileComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Salary Positioning */}
          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Positionnement salarial — {profile?.currentJob}
            </h3>
            <div className="space-y-3">
              {salaryData.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-800">{item.value.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / maxSalary) * 100}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* User salary marker */}
              <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-sm font-semibold text-orange-700">
                  Votre salaire actuel : {userSalaryValue.toLocaleString('fr-FR')} €
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  {userSalaryValue < 35000
                    ? 'En dessous de la médiane junior'
                    : userSalaryValue < 48000
                    ? 'Dans la fourchette junior'
                    : userSalaryValue < 62000
                    ? 'Dans la fourchette intermédiaire'
                    : 'Niveau senior / expert'}
                </p>
              </div>
            </div>
          </div>

          {/* Right column stats */}
          <div className="space-y-4">
            {/* Seniority */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Niveau de séniorité
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">
                    {profile.yearsExperience! < 2 ? 'J' : profile.yearsExperience! < 5 ? 'M' : 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {profile.yearsExperience! < 2
                      ? 'Junior'
                      : profile.yearsExperience! < 5
                      ? 'Intermédiaire'
                      : profile.yearsExperience! < 10
                      ? 'Senior'
                      : 'Expert'}
                  </p>
                  <p className="text-xs text-gray-500">{profile.yearsExperience} ans d'expérience</p>
                </div>
              </div>
            </div>

            {/* Sector */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Secteur actuel
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <span className="font-semibold text-gray-900">{profile.sector}</span>
              </div>
            </div>

            {/* Evolution */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Opportunités
              </h3>
              <div className="space-y-2">
                {['Évolution interne', 'Reconversion tech', 'Secteur fintech'].map((opp) => (
                  <div key={opp} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                    <span className="text-sm text-gray-700">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Not complete: show feature preview cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '💰', title: 'Positionnement salarial', desc: 'Comparez votre salaire à votre secteur et niveau' },
            { icon: '📈', title: 'Évolution de carrière', desc: 'Découvrez les postes accessibles depuis le vôtre' },
            { icon: '🎯', title: 'Opportunités personnalisées', desc: 'Formations et postes recommandés pour vous' },
          ].map((feature) => (
            <div key={feature.title} className="card opacity-60 relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center">
                <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                  Complétez votre profil
                </span>
              </div>
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPerso;
