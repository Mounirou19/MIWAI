import { PrismaClient } from './generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('miwai2025', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@miwai.io' },
    update: {},
    create: {
      email: 'test@miwai.io',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
    },
  });
  console.log('Test user created:', testUser.email);

  // Create postes
  const postesData = [
    {
      title: 'Développeur Full Stack',
      description: 'Développe des applications web end-to-end, maîtrise frontend et backend. Travaille avec React, Node.js, bases de données.',
      averageSalary: 52000,
      minSalary: 38000,
      maxSalary: 75000,
      sectors: ['Tech', 'Finance', 'E-commerce', 'Startups'],
      companies: ['BNP Paribas', 'Capgemini', 'SNCF Digital', 'Doctolib', 'Leboncoin'],
      formations: ['Master Informatique', 'Licence Pro Informatique', 'BTS SIO', 'DUT Informatique', 'Bootcamp Dev Web'],
      skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'Docker'],
    },
    {
      title: 'Data Analyst',
      description: 'Analyse des données pour aider à la prise de décision. Crée des dashboards, rapports et visualisations.',
      averageSalary: 46000,
      minSalary: 35000,
      maxSalary: 65000,
      sectors: ['Finance', 'Retail', 'Santé', 'Consulting', 'Tech'],
      companies: ['LVMH', 'Société Générale', 'Carrefour', 'Accenture', 'Criteo'],
      formations: ['Master Data Science', 'Master Statistiques', 'Master 243 Dauphine', 'Licence Pro Statistiques'],
      skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics'],
    },
    {
      title: 'Chef de Projet Digital',
      description: 'Pilote des projets de transformation digitale. Gère les équipes, budgets, délais et livraisons.',
      averageSalary: 55000,
      minSalary: 42000,
      maxSalary: 75000,
      sectors: ['Conseil', 'Banque', 'Assurance', 'Retail', 'Industrie'],
      companies: ['Deloitte', 'PwC', 'Orange', 'Total', 'Renault'],
      formations: ['MBA HEC', 'Master Management', 'Master Informatique', 'École d\'Ingénieur'],
      skills: ['Gestion de projet', 'Agile/Scrum', 'Budget management', 'Communication', 'Leadership'],
    },
    {
      title: 'Consultant en Management',
      description: 'Conseille les entreprises sur leur organisation, stratégie et performance. Résout des problèmes complexes.',
      averageSalary: 58000,
      minSalary: 45000,
      maxSalary: 90000,
      sectors: ['Conseil', 'Finance', 'Industrie', 'Santé', 'Public'],
      companies: ['McKinsey', 'BCG', 'Bain', 'Roland Berger', 'Kearney'],
      formations: ['MBA HEC', 'Master Management Stratégique', 'Grande École de Commerce', 'École d\'Ingénieur'],
      skills: ['Analyse stratégique', 'Excel', 'PowerPoint', 'Communication', 'Problem solving'],
    },
    {
      title: 'Product Manager',
      description: 'Définit la vision et la roadmap produit. Collabore avec tech, design et business pour livrer de la valeur.',
      averageSalary: 58000,
      minSalary: 42000,
      maxSalary: 85000,
      sectors: ['Tech', 'Startups', 'Fintech', 'E-commerce', 'SaaS'],
      companies: ['Spotify', 'Blablacar', 'Qonto', 'Alan', 'Dataiku'],
      formations: ['MBA', 'Master Marketing Digital', 'École d\'Ingénieur', 'Master Informatique'],
      skills: ['Product strategy', 'User research', 'Agile', 'Data analysis', 'Roadmapping'],
    },
    {
      title: 'UX Designer',
      description: 'Conçoit des interfaces utilisateur intuitives et agréables. Mène des recherches utilisateur et prototypage.',
      averageSalary: 46000,
      minSalary: 35000,
      maxSalary: 65000,
      sectors: ['Tech', 'Agences', 'E-commerce', 'Fintech', 'Medtech'],
      companies: ['IDEO', 'Publicis', 'Ubisoft', 'BlaBlaCar', 'Deezer'],
      formations: ['Master Design', 'Bachelor Design UX', 'Master Communication Visuelle', 'Bootcamp UX'],
      skills: ['Figma', 'User research', 'Prototyping', 'Usability testing', 'Design thinking'],
    },
    {
      title: 'Ingénieur DevOps',
      description: 'Automatise et optimise les pipelines CI/CD. Gère l\'infrastructure cloud et assure la disponibilité des services.',
      averageSalary: 58000,
      minSalary: 45000,
      maxSalary: 80000,
      sectors: ['Tech', 'Finance', 'Telecom', 'E-commerce', 'Cloud'],
      companies: ['OVHcloud', 'Criteo', 'Dailymotion', 'Deezer', 'Contentsquare'],
      formations: ['Master Informatique', 'École d\'Ingénieur', 'Licence Pro Informatique', 'DUT Informatique'],
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS/GCP/Azure', 'Linux', 'Terraform'],
    },
    {
      title: 'Responsable Marketing Digital',
      description: 'Pilote la stratégie marketing en ligne. Gère SEO, SEA, social media, emailing et analytics.',
      averageSalary: 50000,
      minSalary: 38000,
      maxSalary: 70000,
      sectors: ['E-commerce', 'Retail', 'Services', 'Tech', 'Médias'],
      companies: ['L\'Oréal', 'Amazon', 'FNAC Darty', 'Cdiscount', 'ManoMano'],
      formations: ['Master Marketing Digital', 'MBA Marketing', 'BTS Communication', 'Licence Pro Marketing'],
      skills: ['Google Analytics', 'SEO/SEA', 'Social Media', 'Email marketing', 'CRM', 'Excel'],
    },
  ];

  for (const posteData of postesData) {
    const id = posteData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    await prisma.poste.upsert({
      where: { id },
      update: posteData,
      create: { id, ...posteData },
    });
  }
  console.log(`${postesData.length} postes seeded`);

  // Create formations
  const formationsData = [
    {
      title: 'Master 243 Dauphine',
      school: 'Université Paris Dauphine-PSL',
      description: 'Formation d\'excellence en finance, comptabilité et contrôle de gestion. Très reconnue dans les milieux financiers parisiens.',
      duration: '2 ans (M1 + M2)',
      insertionRate: 94,
      averageSalary: 48000,
      accessibleJobs: ['Consultant en Management', 'Data Analyst', 'Chef de Projet Digital', 'Responsable Marketing Digital'],
      skills: ['Finance', 'Comptabilité', 'Audit', 'Excel avancé', 'VBA', 'Analyse financière'],
    },
    {
      title: 'Master Data Science',
      school: 'Université Paris-Saclay',
      description: 'Formation complète en science des données, machine learning et intelligence artificielle. Accès aux meilleurs labs de recherche.',
      duration: '2 ans (M1 + M2)',
      insertionRate: 97,
      averageSalary: 52000,
      accessibleJobs: ['Data Analyst', 'Développeur Full Stack', 'Product Manager', 'Ingénieur DevOps'],
      skills: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics', 'Big Data', 'SQL'],
    },
    {
      title: 'MBA HEC Paris',
      school: 'HEC Paris',
      description: 'Le MBA le plus prestigieux de France. Formation internationale en management, stratégie et leadership.',
      duration: '16 mois',
      insertionRate: 99,
      averageSalary: 85000,
      accessibleJobs: ['Consultant en Management', 'Product Manager', 'Chef de Projet Digital', 'Responsable Marketing Digital'],
      skills: ['Strategic thinking', 'Leadership', 'Finance', 'Marketing', 'Négociation', 'Entrepreneurship'],
    },
    {
      title: 'Master Management Stratégique',
      school: 'ESSEC Business School',
      description: 'Formation en management général avec spécialisation en stratégie d\'entreprise et transformation organisationnelle.',
      duration: '2 ans',
      insertionRate: 93,
      averageSalary: 55000,
      accessibleJobs: ['Consultant en Management', 'Chef de Projet Digital', 'Product Manager', 'Responsable Marketing Digital'],
      skills: ['Stratégie', 'Management', 'Finance', 'Marketing', 'Droit des affaires', 'International'],
    },
    {
      title: 'Licence Pro Informatique',
      school: 'IUT Paris Rives de Seine',
      description: 'Licence professionnelle orientée développement web et mobile. Très professionnalisante avec 6 mois d\'alternance.',
      duration: '1 an (après BTS/DUT)',
      insertionRate: 88,
      averageSalary: 32000,
      accessibleJobs: ['Développeur Full Stack', 'Ingénieur DevOps', 'UX Designer'],
      skills: ['Java', 'PHP', 'JavaScript', 'SQL', 'Gestion de projet', 'Linux'],
    },
    {
      title: 'BTS SIO',
      school: 'Lycée Louis Armand Paris',
      description: 'BTS Services Informatiques aux Organisations. Formation en 2 ans aux métiers de l\'informatique et des réseaux.',
      duration: '2 ans',
      insertionRate: 82,
      averageSalary: 28000,
      accessibleJobs: ['Développeur Full Stack', 'Ingénieur DevOps'],
      skills: ['Développement web', 'Réseaux', 'Sécurité informatique', 'SQL', 'Support IT'],
    },
    {
      title: 'Master Finance',
      school: 'Paris 1 Panthéon-Sorbonne',
      description: 'Master spécialisé en finance d\'entreprise, marchés financiers et gestion des risques.',
      duration: '2 ans',
      insertionRate: 91,
      averageSalary: 52000,
      accessibleJobs: ['Data Analyst', 'Consultant en Management', 'Responsable Marketing Digital'],
      skills: ['Finance de marché', 'Gestion de portefeuille', 'Risk management', 'Excel', 'Bloomberg', 'VBA'],
    },
    {
      title: 'DUT Informatique',
      school: 'IUT de Créteil-Vitry',
      description: 'Diplôme universitaire de technologie en informatique. Solide base en programmation et systèmes.',
      duration: '2 ans',
      insertionRate: 85,
      averageSalary: 29000,
      accessibleJobs: ['Développeur Full Stack', 'Ingénieur DevOps', 'Data Analyst'],
      skills: ['C/C++', 'Java', 'Web', 'Réseaux', 'Bases de données', 'Algorithmique'],
    },
  ];

  for (const formationData of formationsData) {
    const id = formationData.title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    await prisma.formation.upsert({
      where: { id },
      update: formationData,
      create: { id, ...formationData },
    });
  }
  console.log(`${formationsData.length} formations seeded`);

  // Create forum topics
  const topic1 = await prisma.forumTopic.upsert({
    where: { id: 'topic-reconversion-tech' },
    update: {},
    create: {
      id: 'topic-reconversion-tech',
      title: 'Reconversion vers la tech après 5 ans en finance - vos retours ?',
      body: `Bonjour à tous,

Je travaille depuis 5 ans en contrôle de gestion dans une banque parisienne (salaire ~52k€). J'ai envie de me reconvertir vers le développement web / data science mais j'hésite vraiment.

Quelques questions :
- Est-ce que ça vaut le coup financièrement ? (baisse de salaire à court terme ?)
- Quel cursus recommandez-vous ? Bootcamp ? Master ? Formation en ligne ?
- Est-ce que mon expérience en finance est un atout ou un handicap ?

Merci pour vos retours d'expérience !`,
      authorId: testUser.id,
      views: 342,
    },
  });

  await prisma.forumReply.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'reply-1-1',
        topicId: topic1.id,
        body: `Bonjour ! Je suis passé par là il y a 3 ans. J'étais auditeur chez un Big4 et j'ai fait un bootcamp de dev web (9 mois). Aujourd'hui je suis développeur full stack à 56k€ après 3 ans d'expérience.

La reconversion vaut vraiment le coup, surtout avec un background finance qui est très apprécié dans la fintech. Vous pouvez viser des postes data analyst ou même rejoindre des équipes qui font du dev pour des outils financiers.`,
        authorId: testUser.id,
      },
      {
        id: 'reply-1-2',
        topicId: topic1.id,
        body: `Votre expérience en finance est clairement un ATOUT. Les entreprises fintech, les banques digitales et même les cabinets de conseil cherchent des profils hybrides finance + tech.

Pour la formation, je recommande plutôt un Master Data Science ou une certification type Google Data Analytics si vous voulez rester dans l'analyse de données. Ça complète parfaitement votre profil plutôt que de tout effacer.`,
        authorId: testUser.id,
      },
    ],
  });

  const topic2 = await prisma.forumTopic.upsert({
    where: { id: 'topic-master-dauphine' },
    update: {},
    create: {
      id: 'topic-master-dauphine',
      title: 'Master 243 Dauphine : débouchés réels en 2025 ?',
      body: `Salut la communauté,

Je suis en train de choisir entre le Master 243 de Dauphine et un Master Finance à Paris 1.

Pour ceux qui ont fait le 243 : quels sont vos débouchés réels ? Les stats officielles montrent 94% d'insertion mais dans quels types de postes ? Consulting ? Finance d'entreprise ? Audit ?

Et le salaire à l'embauche, c'est vraiment dans les 45-50k comme annoncé ?

Merci !`,
      authorId: testUser.id,
      views: 487,
    },
  });

  await prisma.forumReply.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'reply-2-1',
        topicId: topic2.id,
        body: `Promo 2022 ici ! J'ai été embauché en CDI dans un cabinet de conseil stratégique (tier 2) à 46k€ + variable. Le réseau Dauphine est vraiment puissant à Paris, surtout dans la finance et le conseil.

Sur la promo, j'ai l'impression que c'est environ : 40% conseil (Big4 + tier 2), 30% finance d'entreprise/trésorerie, 20% M&A/banque d'affaires, 10% autre.`,
        authorId: testUser.id,
      },
      {
        id: 'reply-2-2',
        topicId: topic2.id,
        body: `Je suis en M2 243 en ce moment. Les salaires varient vraiment selon le secteur : comptabilité/audit ça commence à 38-40k, conseil 44-48k, et banque/M&A peut aller jusqu'à 55-60k avec les bonus.

Le 243 a clairement plus de prestige et de réseau que Paris 1 Finance, mais Paris 1 est meilleur si vous visez la recherche ou les marchés financiers purs.`,
        authorId: testUser.id,
      },
    ],
  });

  const topic3 = await prisma.forumTopic.upsert({
    where: { id: 'topic-salaire-consultant' },
    update: {},
    create: {
      id: 'topic-salaire-consultant',
      title: 'Salaire premier poste consultant - vos expériences',
      body: `Bonjour,

Je viens de terminer mon MBA à HEC et je cherche un premier poste en conseil stratégique. J'ai des offres de plusieurs cabinets mais je n'ai pas de visibilité sur les vraies rémunérations.

Pouvez-vous partager vos expériences sur :
- Le fixe de base pour un consultant junior (bac+5)
- Le variable / bonus
- Les avantages (voiture, tickets resto, etc.)
- Les différences entre les types de cabinets (MBB vs Big4 vs Boutiques)

Merci beaucoup pour votre transparence !`,
      authorId: testUser.id,
      views: 621,
    },
  });

  await prisma.forumReply.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'reply-3-1',
        topicId: topic3.id,
        body: `Consultant chez McKinsey depuis 2 ans. Pour vous donner une idée transparente :

**MBB (McKinsey, BCG, Bain) :** 75-85k€ fixe + 10-20% de variable. Avantages : remboursement transport, tickets restaurant, RTT généreux.

**Big4 Strategy (Deloitte Monitor, Strategy&) :** 50-65k€ fixe, variable 5-15%.

**Boutiques tier 2 (Roland Berger, Kearney, Oliver Wyman) :** 55-70k€ fixe.

Attention : le package MBB est attractif mais les heures sont très intenses (70-80h/semaine les premiers mois).`,
        authorId: testUser.id,
      },
      {
        id: 'reply-3-2',
        topicId: topic3.id,
        body: `J'ajouterais que pour un MBA HEC, vous êtes dans la meilleure position pour négocier. Les MBB recrutent activement les MBA HEC pour des postes de consultant expérimenté (EM en anglais), donc le package peut être encore plus élevé.

Regardez aussi les offres en interne (conseil interne dans les grands groupes) qui peuvent offrir un meilleur équilibre vie pro/perso avec des salaires de 58-72k€.`,
        authorId: testUser.id,
      },
    ],
  });

  const topic4 = await prisma.forumTopic.upsert({
    where: { id: 'topic-remote-work' },
    update: {},
    create: {
      id: 'topic-remote-work',
      title: 'Télétravail en 2025 : quels secteurs offrent le plus de flexibilité ?',
      body: `Avec la normalisation du télétravail post-COVID, j'essaie de comparer les secteurs.

Quels sont vos retours sur la flexibilité télétravail dans vos secteurs ? Tech, conseil, finance... qui est vraiment le plus flexible ?`,
      authorId: testUser.id,
      views: 198,
    },
  });

  await prisma.forumReply.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'reply-4-1',
        topicId: topic4.id,
        body: `Dans la tech (startups et scale-ups), c'est souvent full remote possible. Beaucoup d'entreprises françaises comme Doctolib, Qonto ou Alan proposent 3-4j de télétravail par semaine voire full remote.

Le conseil stratégique c'est le contraire : présence client obligatoire, souvent 4-5j sur site. Big différence.`,
        authorId: testUser.id,
      },
    ],
  });

  console.log('Forum topics and replies seeded');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
