import { User, Poste, Formation, ForumTopic, ForumReply, Experience, Education } from '../types';
import { totalMonths } from '../utils/duration';

// Données de démonstration — reprises de backend/src/seed.ts

type Author = ForumTopic['author'];

const DEMO_EXPERIENCES: Experience[] = [
  { id: 'exp-1', company: 'Capgemini Invent', location: 'Paris, France', title: 'Chef de Projet Digital', contractType: 'CDI', startDate: '2022-03', endDate: null, salary: 52000, sector: 'Conseil' },
  { id: 'exp-2', company: 'Capgemini Invent', location: 'Paris, France', title: 'Consultante Transformation Digitale', contractType: 'CDI', startDate: '2020-01', endDate: '2022-02', salary: 41000, sector: 'Conseil' },
  { id: 'exp-3', company: 'Capgemini Invent', location: 'Paris, France', title: 'Stagiaire Consultante', contractType: 'Stage', startDate: '2019-07', endDate: '2019-12', salary: 14400, sector: 'Conseil' },
  { id: 'exp-4', company: 'Orange', location: 'Issy-les-Moulineaux, France', title: 'Chargée de projet web', contractType: 'Alternance', startDate: '2017-09', endDate: '2019-06', salary: 15600, sector: 'Telecom' },
];

const DEMO_EDUCATIONS: Education[] = [
  { id: 'edu-1', school: 'ESSEC Business School', degree: 'Master Management Stratégique', field: 'Stratégie', rank: 12, promoSize: 180 },
  { id: 'edu-2', school: 'Université Paris Dauphine-PSL', degree: 'Licence Économie-Gestion', field: 'Économie-Gestion', rank: 25, promoSize: 320 },
];

export const DEMO_USER: User = {
  id: 'demo-user',
  email: 'sarah.martin@miwai.io',
  firstName: 'Sarah',
  lastName: 'Martin',
  profile: {
    id: 'demo-profile',
    userId: 'demo-user',
    currentJob: 'Chef de Projet Digital',
    currentSalary: 52000,
    yearsExperience: Math.floor(totalMonths(DEMO_EXPERIENCES) / 12),
    sector: 'Conseil',
    formations: DEMO_EDUCATIONS.map((e) => `${e.degree} — ${e.school}`).join(', '),
    phone: '06 12 34 56 78',
    age: 29,
    city: 'Paris',
    country: 'France',
    experiences: DEMO_EXPERIENCES,
    educations: DEMO_EDUCATIONS,
  },
};

const demoAuthor: Author = {
  id: DEMO_USER.id,
  firstName: DEMO_USER.firstName,
  lastName: DEMO_USER.lastName,
  email: DEMO_USER.email,
};

const karim: Author = { id: 'user-karim', firstName: 'Karim', lastName: 'Benali', email: 'karim.benali@miwai.io' };
const julie: Author = { id: 'user-julie', firstName: 'Julie', lastName: 'Moreau', email: 'julie.moreau@miwai.io' };
const thomas: Author = { id: 'user-thomas', firstName: 'Thomas', lastName: 'Nguyen', email: 'thomas.nguyen@miwai.io' };
const lea: Author = { id: 'user-lea', firstName: 'Léa', lastName: null, email: 'lea.dupont@miwai.io' };

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const POSTES: Poste[] = [
  {
    title: 'Développeur Full Stack',
    description: 'Développe des applications web end-to-end, maîtrise frontend et backend. Travaille avec React, Node.js, bases de données.',
    averageSalary: 52000, minSalary: 38000, maxSalary: 75000,
    sectors: ['Tech', 'Finance', 'E-commerce', 'Startups'],
    companies: ['BNP Paribas', 'Capgemini', 'SNCF Digital', 'Doctolib', 'Leboncoin'],
    formations: ['Master Informatique', 'Licence Pro Informatique', 'BTS SIO', 'DUT Informatique', 'Bootcamp Dev Web'],
    skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'Docker'],
  },
  {
    title: 'Data Analyst',
    description: 'Analyse des données pour aider à la prise de décision. Crée des dashboards, rapports et visualisations.',
    averageSalary: 46000, minSalary: 35000, maxSalary: 65000,
    sectors: ['Finance', 'Retail', 'Santé', 'Consulting', 'Tech'],
    companies: ['LVMH', 'Société Générale', 'Carrefour', 'Accenture', 'Criteo'],
    formations: ['Master Data Science', 'Master Statistiques', 'Master 243 Dauphine', 'Licence Pro Statistiques'],
    skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics'],
  },
  {
    title: 'Chef de Projet Digital',
    description: 'Pilote des projets de transformation digitale. Gère les équipes, budgets, délais et livraisons.',
    averageSalary: 55000, minSalary: 42000, maxSalary: 75000,
    sectors: ['Conseil', 'Banque', 'Assurance', 'Retail', 'Industrie'],
    companies: ['Deloitte', 'PwC', 'Orange', 'Total', 'Renault'],
    formations: ['MBA HEC', 'Master Management', 'Master Informatique', "École d'Ingénieur"],
    skills: ['Gestion de projet', 'Agile/Scrum', 'Budget management', 'Communication', 'Leadership'],
  },
  {
    title: 'Consultant en Management',
    description: 'Conseille les entreprises sur leur organisation, stratégie et performance. Résout des problèmes complexes.',
    averageSalary: 58000, minSalary: 45000, maxSalary: 90000,
    sectors: ['Conseil', 'Finance', 'Industrie', 'Santé', 'Public'],
    companies: ['McKinsey', 'BCG', 'Bain', 'Roland Berger', 'Kearney'],
    formations: ['MBA HEC', 'Master Management Stratégique', 'Grande École de Commerce', "École d'Ingénieur"],
    skills: ['Analyse stratégique', 'Excel', 'PowerPoint', 'Communication', 'Problem solving'],
  },
  {
    title: 'Product Manager',
    description: 'Définit la vision et la roadmap produit. Collabore avec tech, design et business pour livrer de la valeur.',
    averageSalary: 58000, minSalary: 42000, maxSalary: 85000,
    sectors: ['Tech', 'Startups', 'Fintech', 'E-commerce', 'SaaS'],
    companies: ['Spotify', 'Blablacar', 'Qonto', 'Alan', 'Dataiku'],
    formations: ['MBA', 'Master Marketing Digital', "École d'Ingénieur", 'Master Informatique'],
    skills: ['Product strategy', 'User research', 'Agile', 'Data analysis', 'Roadmapping'],
  },
  {
    title: 'UX Designer',
    description: 'Conçoit des interfaces utilisateur intuitives et agréables. Mène des recherches utilisateur et prototypage.',
    averageSalary: 46000, minSalary: 35000, maxSalary: 65000,
    sectors: ['Tech', 'Agences', 'E-commerce', 'Fintech', 'Medtech'],
    companies: ['IDEO', 'Publicis', 'Ubisoft', 'BlaBlaCar', 'Deezer'],
    formations: ['Master Design', 'Bachelor Design UX', 'Master Communication Visuelle', 'Bootcamp UX'],
    skills: ['Figma', 'User research', 'Prototyping', 'Usability testing', 'Design thinking'],
  },
  {
    title: 'Ingénieur DevOps',
    description: "Automatise et optimise les pipelines CI/CD. Gère l'infrastructure cloud et assure la disponibilité des services.",
    averageSalary: 58000, minSalary: 45000, maxSalary: 80000,
    sectors: ['Tech', 'Finance', 'Telecom', 'E-commerce', 'Cloud'],
    companies: ['OVHcloud', 'Criteo', 'Dailymotion', 'Deezer', 'Contentsquare'],
    formations: ['Master Informatique', "École d'Ingénieur", 'Licence Pro Informatique', 'DUT Informatique'],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS/GCP/Azure', 'Linux', 'Terraform'],
  },
  {
    title: 'Responsable Marketing Digital',
    description: 'Pilote la stratégie marketing en ligne. Gère SEO, SEA, social media, emailing et analytics.',
    averageSalary: 50000, minSalary: 38000, maxSalary: 70000,
    sectors: ['E-commerce', 'Retail', 'Services', 'Tech', 'Médias'],
    companies: ["L'Oréal", 'Amazon', 'FNAC Darty', 'Cdiscount', 'ManoMano'],
    formations: ['Master Marketing Digital', 'MBA Marketing', 'BTS Communication', 'Licence Pro Marketing'],
    skills: ['Google Analytics', 'SEO/SEA', 'Social Media', 'Email marketing', 'CRM', 'Excel'],
  },
]
  .map((p) => ({ id: slugify(p.title), ...p }))
  .sort((a, b) => a.title.localeCompare(b.title));

export const FORMATIONS: Formation[] = [
  {
    title: 'Master 243 Dauphine',
    school: 'Université Paris Dauphine-PSL',
    description: "Formation d'excellence en finance, comptabilité et contrôle de gestion. Très reconnue dans les milieux financiers parisiens.",
    duration: '2 ans (M1 + M2)', insertionRate: 94, averageSalary: 48000,
    accessibleJobs: ['Consultant en Management', 'Data Analyst', 'Chef de Projet Digital', 'Responsable Marketing Digital'],
    skills: ['Finance', 'Comptabilité', 'Audit', 'Excel avancé', 'VBA', 'Analyse financière'],
  },
  {
    title: 'Master Data Science',
    school: 'Université Paris-Saclay',
    description: "Formation complète en science des données, machine learning et intelligence artificielle. Accès aux meilleurs labs de recherche.",
    duration: '2 ans (M1 + M2)', insertionRate: 97, averageSalary: 52000,
    accessibleJobs: ['Data Analyst', 'Développeur Full Stack', 'Product Manager', 'Ingénieur DevOps'],
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics', 'Big Data', 'SQL'],
  },
  {
    title: 'MBA HEC Paris',
    school: 'HEC Paris',
    description: 'Le MBA le plus prestigieux de France. Formation internationale en management, stratégie et leadership.',
    duration: '16 mois', insertionRate: 99, averageSalary: 85000,
    accessibleJobs: ['Consultant en Management', 'Product Manager', 'Chef de Projet Digital', 'Responsable Marketing Digital'],
    skills: ['Strategic thinking', 'Leadership', 'Finance', 'Marketing', 'Négociation', 'Entrepreneurship'],
  },
  {
    title: 'Master Management Stratégique',
    school: 'ESSEC Business School',
    description: "Formation en management général avec spécialisation en stratégie d'entreprise et transformation organisationnelle.",
    duration: '2 ans', insertionRate: 93, averageSalary: 55000,
    accessibleJobs: ['Consultant en Management', 'Chef de Projet Digital', 'Product Manager', 'Responsable Marketing Digital'],
    skills: ['Stratégie', 'Management', 'Finance', 'Marketing', 'Droit des affaires', 'International'],
  },
  {
    title: 'Licence Pro Informatique',
    school: 'IUT Paris Rives de Seine',
    description: "Licence professionnelle orientée développement web et mobile. Très professionnalisante avec 6 mois d'alternance.",
    duration: '1 an (après BTS/DUT)', insertionRate: 88, averageSalary: 32000,
    accessibleJobs: ['Développeur Full Stack', 'Ingénieur DevOps', 'UX Designer'],
    skills: ['Java', 'PHP', 'JavaScript', 'SQL', 'Gestion de projet', 'Linux'],
  },
  {
    title: 'BTS SIO',
    school: 'Lycée Louis Armand Paris',
    description: "BTS Services Informatiques aux Organisations. Formation en 2 ans aux métiers de l'informatique et des réseaux.",
    duration: '2 ans', insertionRate: 82, averageSalary: 28000,
    accessibleJobs: ['Développeur Full Stack', 'Ingénieur DevOps'],
    skills: ['Développement web', 'Réseaux', 'Sécurité informatique', 'SQL', 'Support IT'],
  },
  {
    title: 'Master Finance',
    school: 'Paris 1 Panthéon-Sorbonne',
    description: "Master spécialisé en finance d'entreprise, marchés financiers et gestion des risques.",
    duration: '2 ans', insertionRate: 91, averageSalary: 52000,
    accessibleJobs: ['Data Analyst', 'Consultant en Management', 'Responsable Marketing Digital'],
    skills: ['Finance de marché', 'Gestion de portefeuille', 'Risk management', 'Excel', 'Bloomberg', 'VBA'],
  },
  {
    title: 'DUT Informatique',
    school: 'IUT de Créteil-Vitry',
    description: 'Diplôme universitaire de technologie en informatique. Solide base en programmation et systèmes.',
    duration: '2 ans', insertionRate: 85, averageSalary: 29000,
    accessibleJobs: ['Développeur Full Stack', 'Ingénieur DevOps', 'Data Analyst'],
    skills: ['C/C++', 'Java', 'Web', 'Réseaux', 'Bases de données', 'Algorithmique'],
  },
]
  .map((f) => ({ id: f.title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, ''), ...f }))
  .sort((a, b) => a.title.localeCompare(b.title));

const daysAgo = (d: number, h = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, 15, 0, 0);
  return date.toISOString();
};

const reply = (id: string, topicId: string, author: Author, body: string, createdAt: string): ForumReply => ({
  id, topicId, body, authorId: author.id, createdAt, author,
});

type SeedTopic = Omit<ForumTopic, '_count' | 'updatedAt' | 'authorId'> & { replies: ForumReply[] };

const seedTopics: SeedTopic[] = [
  {
    id: 'topic-reconversion-tech',
    category: 'Reconversion',
    title: 'Reconversion vers la tech après 5 ans en finance - vos retours ?',
    body: `Bonjour à tous,

Je travaille depuis 5 ans en contrôle de gestion dans une banque parisienne (salaire ~52k€). J'ai envie de me reconvertir vers le développement web / data science mais j'hésite vraiment.

Quelques questions :
- Est-ce que ça vaut le coup financièrement ? (baisse de salaire à court terme ?)
- Quel cursus recommandez-vous ? Bootcamp ? Master ? Formation en ligne ?
- Est-ce que mon expérience en finance est un atout ou un handicap ?

Merci pour vos retours d'expérience !`,
    author: karim, views: 342, createdAt: daysAgo(12),
    replies: [
      reply('reply-1-1', 'topic-reconversion-tech', thomas, `Bonjour ! Je suis passé par là il y a 3 ans. J'étais auditeur chez un Big4 et j'ai fait un bootcamp de dev web (9 mois). Aujourd'hui je suis développeur full stack à 56k€ après 3 ans d'expérience.

La reconversion vaut vraiment le coup, surtout avec un background finance qui est très apprécié dans la fintech.`, daysAgo(11)),
      reply('reply-1-2', 'topic-reconversion-tech', demoAuthor, `Votre expérience en finance est clairement un ATOUT. Les entreprises fintech, les banques digitales et même les cabinets de conseil cherchent des profils hybrides finance + tech.

Pour la formation, je recommande plutôt un Master Data Science ou une certification type Google Data Analytics si vous voulez rester dans l'analyse de données.`, daysAgo(10)),
    ],
  },
  {
    id: 'topic-master-dauphine',
    category: 'Formation',
    title: 'Master 243 Dauphine : débouchés réels en 2025 ?',
    body: `Salut la communauté,

Je suis en train de choisir entre le Master 243 de Dauphine et un Master Finance à Paris 1.

Pour ceux qui ont fait le 243 : quels sont vos débouchés réels ? Les stats officielles montrent 94% d'insertion mais dans quels types de postes ? Consulting ? Finance d'entreprise ? Audit ?

Merci !`,
    author: lea, views: 487, createdAt: daysAgo(8),
    replies: [
      reply('reply-2-1', 'topic-master-dauphine', julie, `Promo 2022 ici ! J'ai été embauchée en CDI dans un cabinet de conseil stratégique (tier 2) à 46k€ + variable. Le réseau Dauphine est vraiment puissant à Paris.

Sur la promo : environ 40% conseil, 30% finance d'entreprise, 20% M&A/banque d'affaires, 10% autre.`, daysAgo(7)),
      reply('reply-2-2', 'topic-master-dauphine', karim, `Les salaires varient selon le secteur : audit 38-40k, conseil 44-48k, banque/M&A jusqu'à 55-60k avec les bonus.

Paris 1 est meilleur si vous visez la recherche ou les marchés financiers purs.`, daysAgo(6)),
    ],
  },
  {
    id: 'topic-chef-projet-vers-pm',
    category: 'Poste',
    title: 'Passer de Chef de Projet Digital à Product Manager : retours ?',
    body: `Bonjour à tous,

Je suis Chef de Projet Digital en cabinet de conseil depuis 6 ans (52k€). J'aimerais évoluer vers un poste de Product Manager dans une scale-up.

- Est-ce que l'expérience en conseil est valorisée côté produit ?
- Faut-il passer par une formation spécifique (certification PM, MBA) ?
- Quel salaire viser pour une première expérience PM avec mon profil ?

Merci d'avance !`,
    author: demoAuthor, views: 156, createdAt: daysAgo(4),
    replies: [
      reply('reply-3-1', 'topic-chef-projet-vers-pm', thomas, `Très bonne transition ! Les profils conseil sont appréciés pour leur capacité à structurer et à parler au business. Mets en avant tes projets où tu as priorisé un backlog et mesuré l'impact.

Pour le salaire, avec 6 ans d'XP tu peux viser 58-65k€ en PM confirmé.`, daysAgo(3)),
      reply('reply-3-2', 'topic-chef-projet-vers-pm', julie, `Pas besoin de MBA. Une certification type PSPO + un side project produit suffisent souvent. Regarde Qonto, Alan ou Dataiku qui recrutent beaucoup de PM venant du conseil.`, daysAgo(2)),
    ],
  },
  {
    id: 'topic-salaire-consultant',
    category: 'Rémunération',
    title: 'Salaire premier poste consultant - vos expériences',
    body: `Bonjour,

Je viens de terminer mon MBA à HEC et je cherche un premier poste en conseil stratégique.

Pouvez-vous partager vos expériences sur :
- Le fixe de base pour un consultant junior (bac+5)
- Le variable / bonus
- Les différences entre les types de cabinets (MBB vs Big4 vs Boutiques)

Merci beaucoup pour votre transparence !`,
    author: julie, views: 621, createdAt: daysAgo(15),
    replies: [
      reply('reply-4-1', 'topic-salaire-consultant', karim, `Pour vous donner une idée :

**MBB :** 75-85k€ fixe + 10-20% de variable.
**Big4 Strategy :** 50-65k€ fixe, variable 5-15%.
**Boutiques tier 2 :** 55-70k€ fixe.

Attention : les heures en MBB sont très intenses.`, daysAgo(14)),
    ],
  },
  {
    id: 'topic-remote-work',
    category: 'Secteur',
    title: 'Télétravail en 2025 : quels secteurs offrent le plus de flexibilité ?',
    body: `Avec la normalisation du télétravail post-COVID, j'essaie de comparer les secteurs.

Quels sont vos retours sur la flexibilité télétravail dans vos secteurs ? Tech, conseil, finance... qui est vraiment le plus flexible ?`,
    author: demoAuthor, views: 198, createdAt: daysAgo(20),
    replies: [
      reply('reply-5-1', 'topic-remote-work', thomas, `Dans la tech (startups et scale-ups), c'est souvent full remote possible. Doctolib, Qonto ou Alan proposent 3-4j de télétravail par semaine.

Le conseil stratégique c'est le contraire : présence client obligatoire, souvent 4-5j sur site.`, daysAgo(19)),
    ],
  },
];

export const createTopics = (): ForumTopic[] =>
  seedTopics.map((t) => ({
    ...t,
    authorId: t.author.id,
    updatedAt: t.createdAt,
    _count: { replies: t.replies.length },
  }));

export const toAuthor = (u: User): Author => ({
  id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email,
});
