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

export interface ForumTopic {
  id: string;
  title: string;
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
