# Backend — travail restant pour quitter le mode démo

Sur la branche `testUser`, le frontend tourne en **mode démo** : toutes les requêtes `/api/...` sont interceptées par un faux backend en mémoire (`frontend/src/demo/mockApi.ts`). Les nouvelles fonctionnalités (profil enrichi, catégories et tri du forum) **n'existent que dans ce mock**. Ce document liste ce que le vrai backend (`backend/`, Express + Prisma + PostgreSQL) doit implémenter pour que le frontend fonctionne sans le mock.

**Sources de vérité pour le contrat d'API :**
- Types partagés : `frontend/src/types/index.ts` (`UserProfile`, `Experience`, `Education`, `ForumTopic`, `FORUM_CATEGORIES`, `CONTRACT_TYPES`)
- Comportement attendu de chaque route : `frontend/src/demo/mockApi.ts`
- Règles de validation : `frontend/src/pages/Profil.tsx`, `frontend/src/components/profil/ExperienceSection.tsx`, `frontend/src/components/profil/EducationSection.tsx`
- Données d'exemple : `frontend/src/demo/mockData.ts`

---

## 0. Bloquant : le frontend ne joint pas le backend en production

Le frontend appelle l'API en chemin relatif (`axios.get('/api/...')`) et **n'utilise pas** `VITE_API_URL`, bien que `DEPLOIEMENT.md` le mentionne (aucun `baseURL` dans `frontend/src`). Sur Cloudflare Workers (`frontend/wrangler.jsonc`, assets seuls avec `not_found_handling: "single-page-application"`), une requête `/api/users/me` renvoie donc `index.html` au lieu d'atteindre le backend.

À faire (choisir une option) :
- **Option A — URL absolue** : dans `frontend/src/main.tsx` (ou `AuthContext.tsx`), `axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''`, et définir `VITE_API_URL` dans le build Cloudflare. Comme frontend et backend seront alors sur des domaines différents :
  - cookie `miwai_token` en `sameSite: 'none'` + `secure: true` en production (`backend/src/routes/auth.ts`, `COOKIE_OPTIONS` et le `clearCookie` du logout) ;
  - `FRONTEND_URL` côté backend = l'URL Cloudflare exacte (CORS, `backend/src/index.ts`).
- **Option B — même domaine (recommandée)** : ajouter un script Worker qui proxifie `/api/*` vers le backend et sert les assets pour le reste. Les cookies restent first-party, `sameSite: 'lax'` suffit, pas de CORS.

Dans les deux cas, mettre à jour `DEPLOIEMENT.md` pour refléter la solution retenue.

---

## 1. Schéma Prisma (`backend/src/prisma/schema.prisma`)

### 1.1 `UserProfile` — nouveaux champs

```prisma
model UserProfile {
  // ... champs existants (currentJob, currentSalary, yearsExperience, sector, formations)
  phone       String?
  age         Int?
  city        String?
  country     String?

  experiences Experience[]
  educations  Education[]
}
```

Les champs existants `currentJob`, `currentSalary`, `yearsExperience`, `sector`, `formations` sont **conservés** : le dashboard (`DashboardPerso.tsx`) les lit. Ils sont désormais calculés par le frontend à partir des expériences/formations et envoyés au `PUT` (voir §2.2). Option plus propre pour plus tard : les calculer côté backend.

### 1.2 Nouveau modèle `Experience`

```prisma
enum ContractType {
  CDI
  CDD
  Stage
  Alternance
  Freelance
  Interim   @map("Intérim")
  VIE
  Autre
}

model Experience {
  id           String       @id @default(cuid())
  profileId    String
  company      String       // max 100
  location     String       @default("") // max 100
  title        String       // max 100
  contractType ContractType
  startDate    String       // "YYYY-MM"
  endDate      String?      // "YYYY-MM", null = poste actuel
  salary       Int?         // brut fixe annuel en euros, 0..1 000 000
  sector       String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  profile UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  @@index([profileId])
}
```

Attention à `Intérim` : le frontend envoie la valeur accentuée `"Intérim"`. Soit garder un `String` validé contre la liste `CONTRACT_TYPES`, soit utiliser l'enum avec `@map` et convertir à l'entrée et à la sortie. **Le plus simple : `contractType String` + validation applicative.**

Les dates restent au format `"YYYY-MM"` (chaînes) pour coller au frontend (`frontend/src/utils/duration.ts`). Le tri lexicographique fonctionne sur ce format.

### 1.3 Nouveau modèle `Education`

```prisma
model Education {
  id        String   @id @default(cuid())
  profileId String
  school    String   // max 120
  degree    String   // max 120 (nom de la formation)
  field     String   // max 120 (domaine d'études)
  rank      Int?     // >= 1, <= promoSize
  promoSize Int?     // 1..5000, requis si rank renseigné
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  @@index([profileId])
}
```

### 1.4 `ForumTopic` — catégorie

```prisma
model ForumTopic {
  // ... champs existants
  category String   // une valeur de FORUM_CATEGORIES
  @@index([category])
  @@index([views])
  @@index([createdAt])
}
```

Valeurs autorisées (identiques à `FORUM_CATEGORIES` dans `frontend/src/types/index.ts`) :
`Rémunération`, `Poste`, `Orientation`, `Secteur`, `Spécialité`, `Formation`, `Reconversion`, `Entreprise`, `Vie pro`.

`String` + validation applicative plutôt qu'un enum Prisma, à cause des accents et de l'espace. Pour la migration des sujets existants : `@default("Vie pro")`, ou un backfill avant d'ajouter la contrainte NOT NULL.

### 1.5 Migration

```bash
cd backend
npx prisma migrate dev --schema src/prisma/schema.prisma --name profil_experiences_formations_forum_categories
npx prisma generate --schema src/prisma/schema.prisma
```

Vérifier que la migration générée dans `src/prisma/migrations/` gère bien les lignes `ForumTopic` existantes (valeur par défaut de `category`).

---

## 2. Routes utilisateur (`backend/src/routes/users.ts`)

### 2.1 `GET /api/users/me`

Doit renvoyer le profil **avec** expériences et formations :

```ts
include: {
  profile: {
    include: {
      experiences: { orderBy: { startDate: 'desc' } },
      educations: { orderBy: { createdAt: 'asc' } },
    },
  },
}
```

Forme de réponse attendue (voir `DEMO_USER` dans `mockData.ts`) :

```jsonc
{
  "id": "…", "email": "…", "firstName": "…", "lastName": "…",
  "profile": {
    "id": "…", "userId": "…",
    "currentJob": "…", "currentSalary": 52000, "yearsExperience": 9, "sector": "Conseil", "formations": "…",
    "phone": "06 12 34 56 78", "age": 29, "city": "Paris", "country": "France",
    "experiences": [{ "id": "…", "company": "…", "location": "…", "title": "…", "contractType": "CDI",
                      "startDate": "2022-03", "endDate": null, "salary": 52000, "sector": "Conseil" }],
    "educations":  [{ "id": "…", "school": "…", "degree": "…", "field": "…", "rank": 12, "promoSize": 180 }]
  }
}
```

Ne jamais exposer `password`, ni `profileId`/`createdAt`/`updatedAt` des sous-objets (inutile, mais sans danger).

### 2.2 `PUT /api/users/profile`

Corps envoyé par `Profil.tsx` (tous les nombres arrivent en **chaînes**, sauf dans `experiences`/`educations`) :

```jsonc
{
  "firstName": "Sarah", "lastName": "Martin",
  "email": "sarah.martin@miwai.io",
  "phone": "06 12 34 56 78", "age": "29", "city": "Paris", "country": "France",
  "currentJob": "Chef de Projet Digital",   // dérivé : poste en cours le plus récent
  "currentSalary": "52000",                 // dérivé : salaire de l'expérience la plus récente
  "yearsExperience": "9",                   // dérivé : durée cumulée sans chevauchement / 12
  "sector": "Conseil",                      // dérivé : secteur de l'expérience la plus récente
  "formations": "Master … — ESSEC, …",      // dérivé : résumé texte des formations
  "experiences": [ /* Experience[] complet, ids frontend possibles ("exp-1712…") */ ],
  "educations":  [ /* Education[] complet */ ]
}
```

À implémenter :
1. **Validation** (reproduire les règles du frontend, répondre `400 { error: "<message en français>" }`) :
   - `email` : requis, format `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`, max 254, trim + lowercase.
   - `firstName` / `lastName` : lettres (Unicode), espaces, `'`, `-`, max 50.
   - `phone` : optionnel ; une fois espaces, points et tirets retirés : `^(\+\d{8,15}|0\d{9})$`.
   - `age` : optionnel, entier 16..99.
   - `city` / `country` : optionnels, lettres, espaces, `'`, `.`, `-`, max 60.
   - `experiences[]` : `company`, `title`, `contractType` (dans `CONTRACT_TYPES`) et `startDate` requis. Dates au format `YYYY-MM`, pas dans le futur, `endDate >= startDate`. `salary` entier 0..1 000 000 ou null. Longueurs max 100. Plafonner le nombre d'éléments (ex. 50).
   - `educations[]` : `school`, `degree`, `field` requis, max 120 ; `rank`/`promoSize` entiers ≥ 1, `promoSize` ≤ 5000, `rank` ≤ `promoSize`, `promoSize` requis si `rank` est renseigné. Plafond (ex. 20).
2. **Changement d'email** : vérifier l'unicité (`409 { error: "Cet email est déjà utilisé" }` si un autre user l'a déjà). Mettre à jour `User.email`.
3. **Persistance dans une transaction** (`prisma.$transaction`) :
   - update `User` (email, firstName, lastName) ;
   - upsert `UserProfile` (champs simples + dérivés) ;
   - **remplacement complet** des listes : `deleteMany({ where: { profileId } })` puis `createMany` pour `experiences` et `educations`. Ignorer les `id` envoyés par le client (ids temporaires du frontend).
4. Répondre avec la même forme que `GET /me` (le frontend appelle `updateUser(res.data)`).

Point mineur existant, non bloquant : `firstName: firstName || undefined` empêche de vider un prénom ou un nom une fois renseigné.

---

## 3. Routes forum (`backend/src/routes/forum.ts`)

### 3.1 `GET /api/forum/topics`

Nouveaux query params (envoyés par `Forum.tsx`) :
- `category` : optionnel. Si présent, doit appartenir à `FORUM_CATEGORIES` (sinon `400`) → `where.category = category`.
- `sort` : `recent` (défaut) ou `top`.
  - `recent` → `orderBy: { createdAt: 'desc' }`
  - `top` → `orderBy: [{ views: 'desc' }, { createdAt: 'desc' }]`
- Combiner avec `search` existant : `where = { AND: [searchClause, categoryClause] }`.

Les objets renvoyés doivent inclure `category`. Prisma l'inclut automatiquement, aucun `select` restrictif n'étant utilisé.

### 3.2 `POST /api/forum/topics`

- Lire `category` dans le body ; requis et dans `FORUM_CATEGORIES`, sinon `400 { error: "Veuillez choisir une catégorie" }` (même message que le mock).
- L'enregistrer à la création.

### 3.3 `GET /api/forum/topics/:id`

Rien à faire de spécial, `category` est renvoyé avec le reste (affiché par `ForumTopic.tsx`).

### 3.4 Partager la liste des catégories

Pour éviter la double maintenance, créer `backend/src/constants.ts` avec `FORUM_CATEGORIES` et `CONTRACT_TYPES` en copie conforme du frontend, avec un commentaire pointant vers `frontend/src/types/index.ts`.

---

## 4. Seed (`backend/src/seed.ts`)

- Ajouter `category` à chaque sujet existant. Correspondance utilisée dans le mock :
  - `topic-reconversion-tech` → `Reconversion`
  - `topic-master-dauphine` → `Formation`
  - `topic-salaire-consultant` → `Rémunération`
  - `topic-remote-work` → `Secteur`
- Optionnel : enrichir l'utilisateur de test `test@miwai.io` avec un profil complet (téléphone, âge, ville, expériences avec salaires, formations), en reprenant `DEMO_USER` de `mockData.ts`, pour que le dashboard soit rempli dès le seed.
- Optionnel : ajouter le sujet `topic-chef-projet-vers-pm` (catégorie `Poste`) et des auteurs variés. Aujourd'hui tous les sujets du seed ont `testUser` comme auteur.

---

## 5. Sortir du mode démo (frontend)

Une fois le backend déployé et joignable (§0) :
1. Builder le frontend avec `VITE_DEMO_MODE=false` (variable d'environnement du build Cloudflare). Le mock n'est alors pas installé (`frontend/src/main.tsx`).
   - Le code du mock reste dans le bundle. Pour l'en retirer, passer à un `import()` dynamique conditionnel dans `main.tsx`.
   - Ou bien inverser la logique : n'activer le mode démo que si `VITE_DEMO_MODE === 'true'`, et ne définir la variable que pour la prévisualisation de `testUser`.
2. Vérifier les pages qui s'appuyaient sur le mock pour leurs erreurs. Le commit `ac5a97a` avait masqué les échecs réseau ; ils sont rétablis (`setLoading(false)` dans `finally`). Avec un vrai backend, une erreur affiche « Aucun résultat » plutôt qu'un spinner infini. Envisager un vrai message d'erreur.

---

## 6. Checklist de vérification

- [ ] `npx prisma migrate deploy` passe sur une base contenant déjà des sujets
- [ ] `GET /api/users/me` renvoie `experiences` et `educations`
- [ ] `PUT /api/users/profile` : ajout, modification et suppression d'expériences et de formations persistés après rechargement
- [ ] `PUT` rejette : email invalide, email déjà pris (409), âge 12, `endDate < startDate`, `rank > promoSize`, `contractType` inconnu
- [ ] Le dashboard affiche le poste, le salaire et le secteur issus de l'expérience la plus récente
- [ ] Forum : `?sort=top` ordonne par vues, `?sort=recent` par date, `?category=Formation` filtre, et les trois se combinent avec `search`
- [ ] Création de sujet sans catégorie → 400 ; avec catégorie → visible avec son badge
- [ ] Connexion, déconnexion et reconnexion fonctionnent depuis l'URL Cloudflare (cookie bien envoyé, cf. §0)
- [ ] `cd frontend && npx tsc --noEmit && npx vite build` passe avec `VITE_DEMO_MODE=false`
