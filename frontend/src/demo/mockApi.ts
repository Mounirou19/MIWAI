import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { User, ForumTopic, ForumReply } from '../types';
import { DEMO_USER, POSTES, FORMATIONS, createTopics, toAuthor } from './mockData';

// Mode démo : remplace le backend par des données en mémoire.
// Activé par défaut ; désactiver avec VITE_DEMO_MODE=false au build.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

const LOGGED_OUT_KEY = 'miwai_demo_logged_out';

let user: User = structuredClone(DEMO_USER);
const topics: ForumTopic[] = createTopics();

const isLoggedIn = () => {
  try {
    return sessionStorage.getItem(LOGGED_OUT_KEY) !== '1';
  } catch {
    return true;
  }
};

const setLoggedIn = (value: boolean) => {
  try {
    if (value) sessionStorage.removeItem(LOGGED_OUT_KEY);
    else sessionStorage.setItem(LOGGED_OUT_KEY, '1');
  } catch {
    // stockage indisponible : l'état reste celui par défaut (connecté)
  }
};

const publicUser = () => ({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });

const matches = (search: unknown, ...fields: string[]) => {
  if (!search) return true;
  const q = String(search).toLowerCase();
  return fields.some((f) => f.toLowerCase().includes(q));
};

const paginate = <T,>(items: T[], params: Record<string, unknown>) => {
  const page = Math.max(1, parseInt(String(params.page)) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit)) || 20));
  return {
    data: items.slice((page - 1) * limit, page * limit),
    total: items.length,
    page,
    limit,
    pages: Math.ceil(items.length / limit),
  };
};

class HttpError {
  constructor(public status: number, public message: string) {}
}

const requireAuth = () => {
  if (!isLoggedIn()) throw new HttpError(401, 'Access token required');
};

const route = (method: string, path: string, params: Record<string, unknown>, body: Record<string, any>): [number, unknown] => {
  let m: RegExpMatchArray | null;

  // Auth — n'importe quels identifiants connectent l'utilisateur de démo
  if (method === 'post' && (path === '/api/auth/login' || path === '/api/auth/register')) {
    if (!body.email || !body.password) throw new HttpError(400, 'Email and password are required');
    setLoggedIn(true);
    return [path.endsWith('register') ? 201 : 200, { user: publicUser() }];
  }
  if (method === 'post' && path === '/api/auth/logout') {
    setLoggedIn(false);
    return [200, { message: 'Logged out' }];
  }

  // Utilisateur
  if (method === 'get' && path === '/api/users/me') {
    requireAuth();
    return [200, user];
  }
  if (method === 'put' && path === '/api/users/profile') {
    requireAuth();
    const toInt = (v: unknown) => (v ? parseInt(String(v)) : null);
    user = {
      ...user,
      email: body.email || user.email,
      firstName: body.firstName || user.firstName,
      lastName: body.lastName || user.lastName,
      profile: {
        id: user.profile?.id || 'demo-profile',
        userId: user.id,
        currentJob: body.currentJob || null,
        currentSalary: toInt(body.currentSalary),
        yearsExperience: toInt(body.yearsExperience),
        sector: body.sector || null,
        formations: body.formations || null,
        phone: body.phone || null,
        age: toInt(body.age),
        city: body.city || null,
        country: body.country || null,
        experiences: Array.isArray(body.experiences) ? body.experiences : [],
        educations: Array.isArray(body.educations) ? body.educations : [],
      },
    };
    return [200, user];
  }

  // Postes
  if (method === 'get' && path === '/api/postes') {
    return [200, paginate(POSTES.filter((p) => matches(params.search, p.title, p.description)), params)];
  }
  if (method === 'get' && (m = path.match(/^\/api\/postes\/([^/]+)$/))) {
    const poste = POSTES.find((p) => p.id === m![1]);
    if (!poste) throw new HttpError(404, 'Poste not found');
    return [200, poste];
  }

  // Formations
  if (method === 'get' && path === '/api/formations') {
    return [200, paginate(FORMATIONS.filter((f) => matches(params.search, f.title, f.school, f.description)), params)];
  }
  if (method === 'get' && (m = path.match(/^\/api\/formations\/([^/]+)$/))) {
    const formation = FORMATIONS.find((f) => f.id === m![1]);
    if (!formation) throw new HttpError(404, 'Formation not found');
    return [200, formation];
  }

  // Forum
  if (method === 'get' && path === '/api/forum/topics') {
    const list = topics
      .filter((t) => matches(params.search, t.title, t.body))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ replies, ...t }) => t);
    return [200, paginate(list, params)];
  }
  if (method === 'post' && path === '/api/forum/topics') {
    requireAuth();
    if (!body.title || !body.body) throw new HttpError(400, 'Title and body are required');
    const now = new Date().toISOString();
    const topic: ForumTopic = {
      id: `topic-${Date.now()}`,
      title: body.title,
      body: body.body,
      authorId: user.id,
      views: 0,
      createdAt: now,
      updatedAt: now,
      author: toAuthor(user),
      _count: { replies: 0 },
      replies: [],
    };
    topics.unshift(topic);
    const { replies, ...rest } = topic;
    return [201, rest];
  }
  if (method === 'get' && (m = path.match(/^\/api\/forum\/topics\/([^/]+)$/))) {
    const topic = topics.find((t) => t.id === m![1]);
    if (!topic) throw new HttpError(404, 'Topic not found');
    topic.views += 1;
    return [200, structuredClone(topic)];
  }
  if (method === 'post' && (m = path.match(/^\/api\/forum\/topics\/([^/]+)\/replies$/))) {
    requireAuth();
    if (!body.body) throw new HttpError(400, 'Body is required');
    const topic = topics.find((t) => t.id === m![1]);
    if (!topic) throw new HttpError(404, 'Topic not found');
    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      topicId: topic.id,
      body: body.body,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      author: toAuthor(user),
    };
    topic.replies = [...(topic.replies || []), newReply];
    topic._count = { replies: topic.replies.length };
    return [201, newReply];
  }

  throw new HttpError(404, 'Not found');
};

const mockAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  // Petite latence pour que les spinners restent visibles comme en réel
  await new Promise((r) => setTimeout(r, 250));

  const method = (config.method || 'get').toLowerCase();
  const path = (config.url || '').split('?')[0];
  const params = (config.params || {}) as Record<string, unknown>;
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {};

  let status: number;
  let data: unknown;
  try {
    [status, data] = route(method, path, params, body);
  } catch (e) {
    if (!(e instanceof HttpError)) throw e;
    status = e.status;
    data = { error: e.message };
  }

  const response: AxiosResponse = { data, status, statusText: String(status), headers: {}, config, request: {} };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_REQUEST, config, null, response);
  }
  return response;
};

export const installMockApi = () => {
  axios.defaults.adapter = mockAdapter;
  console.info('[MIWAI] Mode démo actif — données fictives, backend non appelé.');
};
