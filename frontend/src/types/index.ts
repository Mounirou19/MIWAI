export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profile?: UserProfile | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  currentJob: string | null;
  currentSalary: number | null;
  yearsExperience: number | null;
  sector: string | null;
  formations: string | null;
  phone?: string | null;
  age?: number | null;
  city?: string | null;
  country?: string | null;
  experiences?: Experience[];
  educations?: Education[];
}

export const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim', 'VIE', 'Autre'] as const;
export type ContractType = typeof CONTRACT_TYPES[number];

export interface Experience {
  id: string;
  company: string;
  location: string;
  title: string;
  contractType: ContractType;
  startDate: string; // YYYY-MM
  endDate: string | null; // YYYY-MM, null = poste actuel
  salary: number | null; // brut fixe annuel, en euros
  sector: string | null;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  rank: number | null;
  promoSize: number | null;
}

export interface Poste {
  id: string;
  title: string;
  description: string;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  sectors: string[];
  companies: string[];
  formations: string[];
  skills: string[];
}

export interface Formation {
  id: string;
  title: string;
  school: string;
  description: string;
  duration: string;
  insertionRate: number;
  averageSalary: number;
  accessibleJobs: string[];
  skills: string[];
}

export const FORUM_CATEGORIES = [
  'Rémunération', 'Poste', 'Orientation', 'Secteur', 'Spécialité',
  'Formation', 'Reconversion', 'Entreprise', 'Vie pro',
] as const;
export type ForumCategory = typeof FORUM_CATEGORIES[number];

export interface ForumTopic {
  id: string;
  title: string;
  category: ForumCategory;
  body: string;
  authorId: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  _count: {
    replies: number;
  };
  replies?: ForumReply[];
}

export interface ForumReply {
  id: string;
  topicId: string;
  body: string;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
