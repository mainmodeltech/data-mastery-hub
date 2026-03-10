# Frontend — React SPA

React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + TanStack React Query v5 + React Router v6 + Zod + React Hook Form + Lucide icons.

## Build

```bash
npm run dev      # Vite dev (port 8080)
npm run build    # production
npm run preview  # preview prod build
```

## Architecture fichiers

```
src/
  config/constants.ts        — API_CONFIG, QUERY_CONFIG, COMPANY, PUBLIC_NAVIGATION
  services/httpClient.ts     — fetch wrapper (auth JWT, timeout, erreurs)
  services/api/              — 1 service par entite
  services/api/index.ts      — barrel re-exports
  hooks/use*.ts              — React Query hooks (1 fichier par entite)
  hooks/useAuth.tsx          — AuthContext + AuthProvider
  types/index.ts             — types metier + DTOs + enums
  types/bootcamp.type.ts     — Bootcamp enrichi, BootcampSession, SessionStatus
  types/auth.type.ts         — LoginCredentials, AuthResponse, AuthUser
  pages/                     — pages publiques
  pages/admin/               — pages backoffice
  components/ui/             — shadcn/ui (NE PAS MODIFIER)
  components/admin/          — AdminLayout, ProtectedRoute
  components/layout/         — Header, Footer, Layout
  components/home/           — sections landing
```

---

## httpClient — Signature complete

Fichier: `src/services/httpClient.ts`

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  skipAuth?: boolean;  // true = pas de header Authorization
}

export const httpClient = {
  get:    <T>(path: string, options?: RequestOptions) => Promise<T>,
  post:   <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>,
  put:    <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>,
  patch:  <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>,
  delete: <T>(path: string, options?: RequestOptions) => Promise<T>,
};
```

- `path` = chemin relatif apres `API_CONFIG.baseUrl` (ex: `/bootcamps`, `/admin/bootcamps/123`)
- `params` = query string params (`undefined` filtre automatiquement)
- `skipAuth: true` = endpoints publics (pas de JWT)
- Timeout: 15s. Erreurs: throw `HttpError { status, message, errors? }`
- 401 -> `tokenStorage.clearTokens()` + redirect `/admin/login`

```typescript
export const tokenStorage = {
  getAccessToken: () => string | null,
  setAccessToken: (token: string) => void,
  getRefreshToken: () => string | null,
  setRefreshToken: (token: string) => void,
  clearTokens: () => void,
};
```

---

## Config — constants.ts

```typescript
API_CONFIG.baseUrl   = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'
API_CONFIG.timeout   = 15000
QUERY_CONFIG.staleTime = 5 * 60 * 1000   // 5 min
QUERY_CONFIG.gcTime    = 10 * 60 * 1000  // 10 min
QUERY_CONFIG.retryCount = 2
QUERY_CONFIG.refetchOnWindowFocus = false
```

---

## Services API existants

Re-exportes depuis `src/services/api/index.ts`:

| Service | Import | Routes publiques | Routes admin |
|---------|--------|-----------------|--------------|
| `authService` | `authService` | `/auth/login` (POST), `/auth/me` (GET) | — |
| `bootcampService` | `bootcampService` | `/bootcamps` | `/admin/bootcamps` |
| `registrationService` | `registrationService` | `/registrations` (POST) | `/admin/registrations` |
| `alumniService` | `alumniService` | `/alumni/published` | `/alumni` |
| `projectService` | `projectService` | `/projects/published` | `/projects` |
| `serviceService` | `serviceService` | `/services` | `/admin/services` |
| `referenceService` | `referenceService` | `/references/published` | `/references` |
| `testimonialService` | `testimonialService` | `/testimonials/published` | `/testimonials` |
| `contactService` | `contactService` | `/contact-messages` (POST) | `/admin/contact-messages` |
| `galleryService` | `galleryService` | `/gallery/published` | `/gallery` |

Note: certains services utilisent `/admin/xxx` (bootcamp, registration, contact, service), d'autres utilisent directement `/xxx` pour admin (alumni, project, reference, testimonial, gallery). Respecter le pattern existant.

---

## Hooks React Query existants

Fichier par entite dans `src/hooks/`:

| Fichier | Hooks exportes |
|---------|---------------|
| `useBootcamps.ts` | `usePublishedBootcamps`, `useBootcamps(page,size)`, `useBootcamp(id)`, `useCreateBootcamp`, `useUpdateBootcamp`, `useDeleteBootcamp` |
| `useRegistrations.ts` | `useCreateRegistration`, `useRegistrations(page,size,status)`, `useUpdateRegistrationStatus`, `useDeleteRegistration` |
| `useServices.ts` | hooks CRUD services |
| `useAlumni.ts` | hooks CRUD alumni |
| `useProjects.ts` | hooks CRUD projects |
| `useReferences.ts` | hooks CRUD references |
| `useTestimonials.ts` | hooks CRUD testimonials |
| `useContacts.ts` | hooks CRUD contacts |
| `useGallery.ts` | hooks CRUD gallery |
| `useAuth.tsx` | `useAuth()` → `{ user, isAuthenticated, loading, signIn, signOut }` |

---

## Types complets

### types/index.ts

```typescript
// --- Enums ---
type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type ContactMessageStatus = 'unread' | 'read' | 'replied' | 'archived';
type ReferenceCategory = 'client' | 'school' | 'partner';

// --- Entites ---
interface Bootcamp {
  id: string; title: string; description: string | null; duration: string | null;
  audience: string | null; prerequisites: string | null; price: string | null;
  nextSession: string | null; benefits: string[]; featured: boolean; published: boolean;
  createdAt: string; updatedAt: string;
}

interface Registration {
  id: string; bootcampId: string | null; bootcampTitle: string | null;
  sessionId: string | null; sessionName: string | null;
  promoCodeUsed: string | null; discountPercent: number | null;
  firstName: string; lastName: string; email: string;
  phone: string | null; company: string | null; position: string | null;
  message: string | null; status: RegistrationStatus;
  createdAt: string; updatedAt: string;
}

interface Alumni {
  id: string; name: string; email: string | null; phone: string | null;
  photoUrl: string | null; currentTitle: string | null; currentPosition: string | null;
  linkedinUrl: string | null; cohort: string | null; year: number | null;
  bootcampId: string | null; registrationId: string | null;
  published: boolean; displayOrder: number | null;
  createdAt: string; updatedAt: string;
}

interface ProjectMember {
  id: string; projectId: string; alumniId: string; role: string | null;
  displayOrder: number | null; createdAt: string;
  alumni?: Pick<Alumni, 'id' | 'name' | 'currentTitle' | 'currentPosition' | 'linkedinUrl' | 'photoUrl'>;
}

interface ProjectScreenshot {
  id: string; projectId: string; photoUrl: string;
  caption: string | null; displayOrder: number | null; createdAt: string;
}

interface Project {
  id: string; title: string; description: string | null;
  toolsTechnologies: string[]; accessLink: string | null; coverImageUrl: string | null;
  cohort: string | null; year: number | null; bootcampId: string | null;
  published: boolean; displayOrder: number | null;
  createdAt: string; updatedAt: string;
  members: ProjectMember[]; screenshots: ProjectScreenshot[];
}

interface Service {
  id: string; title: string; description: string | null; features: string[];
  duration: string | null; iconName: string | null; published: boolean;
  displayOrder: number | null; createdAt: string; updatedAt: string;
}

interface Reference {
  id: string; name: string; fullName: string | null; description: string | null;
  logoUrl: string | null; logoText: string | null; category: ReferenceCategory;
  sector: string | null; published: boolean; displayOrder: number | null;
  createdAt: string; updatedAt: string;
}

interface Testimonial {
  id: string; name: string; content: string; company: string | null;
  role: string | null; rating: number | null; published: boolean;
  displayOrder: number | null; createdAt: string; updatedAt: string;
}

interface ContactMessage {
  id: string; firstName: string; lastName: string; email: string;
  phone: string | null; company: string | null; subject: string | null;
  message: string; status: ContactMessageStatus; notes: string | null;
  createdAt: string; updatedAt: string;
}

interface GalleryPhoto {
  id: string; url: string; caption: string | null; bootcampName: string | null;
  published: boolean; displayOrder: number | null; createdAt: string;
}

// --- DTOs creation/modification ---
interface CreateRegistrationDTO {
  bootcampId: string | null; bootcampTitle: string | null; sessionId: string | null;
  firstName: string; lastName: string; email: string;
  phone: string | null; company: string | null; position: string | null;
  message: string | null; promoCode: string | null;
}

type CreateContactMessageDTO = Omit<ContactMessage, 'id' | 'status' | 'notes' | 'createdAt' | 'updatedAt'>;
type CreateBootcampDTO = Omit<Bootcamp, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateBootcampDTO = Partial<CreateBootcampDTO>;
type CreateServiceDTO = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateServiceDTO = Partial<CreateServiceDTO>;
type CreateAlumniDTO = Omit<Alumni, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateAlumniDTO = Partial<CreateAlumniDTO>;
type CreateProjectDTO = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'members' | 'screenshots'>;
type UpdateProjectDTO = Partial<CreateProjectDTO>;
type CreateReferenceDTO = Omit<Reference, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateReferenceDTO = Partial<CreateReferenceDTO>;
type CreateTestimonialDTO = Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTestimonialDTO = Partial<CreateTestimonialDTO>;
type CreateGalleryPhotoDTO = Omit<GalleryPhoto, 'id' | 'createdAt'>;
type UpdateGalleryPhotoDTO = Partial<CreateGalleryPhotoDTO>;

// --- Reponses API ---
interface ApiResponse<T> { data: T; message?: string; }
interface PaginatedResponse<T> {
  content: T[]; totalElements: number; totalPages: number;
  size: number; number: number; first: boolean; last: boolean; empty: boolean;
}
interface ApiError { status: number; message: string; errors?: Record<string, string[]>; }

// --- Auth (aussi dans types/auth.type.ts) ---
interface LoginCredentials { email: string; password: string; }
interface AuthTokens { accessToken: string; refreshToken: string; expiresIn: number; }
interface AuthUser { id: string; email: string; role: string; }
interface AuthState { user: AuthUser | null; tokens: AuthTokens | null; isAuthenticated: boolean; isLoading: boolean; }
```

### types/bootcamp.type.ts (version enrichie, utilisee par les pages)

```typescript
type SessionStatus = 'DRAFT' | 'UPCOMING' | 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type SessionFormat = 'PRESENTIEL' | 'REMOTE' | 'HYBRID';

interface BootcampSession {
  id: string; bootcampId: string; sessionName: string | null;
  cohortNumber: number | null; year: number | null;
  startDate: string | null; endDate: string | null; registrationDeadline: string | null;
  maxParticipants: number; currentParticipants: number; isFull: boolean;
  status: SessionStatus; format: SessionFormat; location: string | null;
  price: string | null; earlyBirdPrice: string | null; earlyBirdDeadline: string | null;
  isFeatured: boolean; published: boolean; spotsRemaining: number | null;
}

interface Bootcamp {
  id: string; title: string; description: string | null; duration: string | null;
  audience: string | null; prerequisites: string | null; price: string | null;
  benefits: string[]; category: string; tag: string | null; iconName: string | null;
  featured: boolean; published: boolean; displayOrder: number;
  nextSession: BootcampSession | null; sessions?: BootcampSession[];
  createdAt: string; updatedAt: string;
}

interface CreateBootcampPayload {
  title: string; description?: string; duration?: string; audience?: string;
  prerequisites?: string; price?: string; benefits?: string[];
  category?: string; tag?: string; iconName?: string;
  featured?: boolean; published?: boolean; displayOrder?: number;
}
interface UpdateBootcampPayload extends Partial<CreateBootcampPayload> {}

interface CreateSessionPayload {
  sessionName?: string; cohortNumber?: number; year?: number;
  startDate?: string; endDate?: string; registrationDeadline?: string;
  maxParticipants?: number; status?: SessionStatus; format?: SessionFormat;
  location?: string; priceOverride?: string; earlyBirdPrice?: string;
  earlyBirdDeadline?: string; isFeatured?: boolean; published?: boolean;
}
interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
  currentParticipants?: number; isFull?: boolean;
}
```

### types/auth.type.ts

```typescript
interface LoginCredentials { email: string; password: string; }
interface AuthResponse { accessToken: string; tokenType: string; expiresIn: number; user: AuthUser; }
interface AuthUser { id: string; email: string; fullName: string; role: string; }
interface AuthState { user: AuthUser | null; accessToken: string | null; isAuthenticated: boolean; isLoading: boolean; }
```

---

## Routes

### Publiques

| Path | Page | Fichier |
|------|------|---------|
| `/` | Landing | `pages/Index.tsx` |
| `/a-propos` | A propos | `pages/About.tsx` |
| `/bootcamps` | Catalogue bootcamps | `pages/Bootcamps.tsx` |
| `/alumni` | Alumni | `pages/Alumni.tsx` |
| `/orientation` | Orientation | `pages/Orientation.tsx` |
| `/contact` | Contact | `pages/Contact.tsx` |
| `*` | 404 | `pages/NotFound.tsx` |

### Admin (protegees par `ProtectedRoute`)

| Path | Page | Fichier |
|------|------|---------|
| `/admin/login` | Login | `pages/admin/AdminLogin.tsx` |
| `/admin` | Dashboard | `pages/admin/AdminDashboard.tsx` |
| `/admin/bootcamps` | Liste bootcamps | `pages/admin/AdminBootcamps.tsx` |
| `/admin/bootcamps/new` | Creer bootcamp | `pages/admin/BootcampForm.tsx` |
| `/admin/bootcamps/:id/edit` | Editer bootcamp | `pages/admin/BootcampForm.tsx` |
| `/admin/bootcamp-sessions` | Sessions | `pages/admin/AdminAllSessions.tsx` |
| `/admin/inscriptions` | Inscriptions | `pages/admin/AdminInscriptions.tsx` |
| `/admin/services` | Services | `pages/admin/AdminServices.tsx` |
| `/admin/references` | References | `pages/admin/AdminReferences.tsx` |
| `/admin/temoignages` | Temoignages | `pages/admin/AdminTemoignages.tsx` |
| `/admin/alumni` | Alumni | `pages/admin/AdminAlumni.tsx` |
| `/admin/projets` | Projets | `pages/admin/AdminProjects.tsx` |
| `/admin/messages` | Messages | `pages/admin/AdminMessages.tsx` |
| `/admin/galerie` | Galerie | `pages/admin/AdminGalerie.tsx` |

---

## Admin — Sidebar

Definie dans `components/admin/AdminLayout.tsx`. Items de navigation:

```typescript
const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/bootcamps", label: "Bootcamps", icon: BookOpen },
  { href: "/admin/bootcamp-sessions", label: "Sessions bootcamp", icon: CalendarDays },
  { href: "/admin/inscriptions", label: "Inscriptions", icon: ClipboardList },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/references", label: "References", icon: Star },
  { href: "/admin/temoignages", label: "Temoignages", icon: MessageSquare },
  { href: "/admin/alumni", label: "Alumni", icon: GraduationCap },
  { href: "/admin/projets", label: "Projets", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/galerie", label: "Galerie", icon: Image },
];
```

Usage dans une page admin:
```tsx
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminXxx() {
  return (
    <AdminLayout title="Titre de la page">
      {/* contenu */}
    </AdminLayout>
  );
}
```

---

## TEMPLATE — Nouveau service API

Copier-coller, remplacer `Xxx`, `xxx`:

```typescript
// src/services/api/xxxService.ts
import { httpClient } from '@/services/httpClient';
import type { Xxx, CreateXxxDTO, UpdateXxxDTO, PaginatedResponse } from '@/types';

const BASE_PATH = '/xxx';           // ou '/admin/xxx' si routes separees
// const ADMIN_PATH = '/admin/xxx'; // decommenter si routes admin separees

export const xxxService = {
  /** Public: liste publiee */
  getPublished: () =>
    httpClient.get<Xxx[]>(`${BASE_PATH}/published`, { skipAuth: true }),

  /** Admin: liste paginee */
  getAll: (page?: number, size?: number) =>
    httpClient.get<PaginatedResponse<Xxx>>(BASE_PATH, { params: { page, size } }),

  /** Admin: detail */
  getById: (id: string) =>
    httpClient.get<Xxx>(`${BASE_PATH}/${id}`),

  /** Admin: creation */
  create: (data: CreateXxxDTO) =>
    httpClient.post<Xxx>(BASE_PATH, data),

  /** Admin: mise a jour */
  update: (id: string, data: UpdateXxxDTO) =>
    httpClient.put<Xxx>(`${BASE_PATH}/${id}`, data),

  /** Admin: suppression (soft delete) */
  delete: (id: string) =>
    httpClient.delete<void>(`${BASE_PATH}/${id}`),
};
```

Puis ajouter dans `src/services/api/index.ts`:
```typescript
export { xxxService } from './xxxService';
```

---

## TEMPLATE — Nouveau hook React Query

Copier-coller, remplacer `Xxx`, `xxx`:

```typescript
// src/hooks/useXxx.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { xxxService } from '@/services/api';
import type { CreateXxxDTO, UpdateXxxDTO } from '@/types';
import { QUERY_CONFIG } from '@/config/constants';

export const XXX_KEYS = {
  all: ['xxx'] as const,
  published: ['xxx', 'published'] as const,
  detail: (id: string) => ['xxx', id] as const,
};

/** Public: liste publiee */
export function usePublishedXxx() {
  return useQuery({
    queryKey: XXX_KEYS.published,
    queryFn: xxxService.getPublished,
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Admin: liste paginee */
export function useXxx(page = 0, size = 20) {
  return useQuery({
    queryKey: [...XXX_KEYS.all, { page, size }],
    queryFn: () => xxxService.getAll(page, size),
    staleTime: QUERY_CONFIG.staleTime,
  });
}

/** Admin: detail par ID */
export function useXxxDetail(id: string) {
  return useQuery({
    queryKey: XXX_KEYS.detail(id),
    queryFn: () => xxxService.getById(id),
    enabled: !!id,
  });
}

/** Mutation: creer */
export function useCreateXxx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateXxxDTO) => xxxService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: XXX_KEYS.all });
      qc.invalidateQueries({ queryKey: XXX_KEYS.published });
    },
  });
}

/** Mutation: mettre a jour */
export function useUpdateXxx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateXxxDTO }) =>
      xxxService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: XXX_KEYS.all });
      qc.invalidateQueries({ queryKey: XXX_KEYS.published });
      qc.invalidateQueries({ queryKey: XXX_KEYS.detail(id) });
    },
  });
}

/** Mutation: supprimer */
export function useDeleteXxx() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => xxxService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: XXX_KEYS.all });
      qc.invalidateQueries({ queryKey: XXX_KEYS.published });
    },
  });
}
```

---

## TEMPLATE — Nouvelle page admin CRUD

```tsx
// src/pages/admin/AdminXxx.tsx
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { useXxx, useCreateXxx, useUpdateXxx, useDeleteXxx } from '@/hooks/useXxx';
import { useToast } from '@/hooks/use-toast';

export default function AdminXxx() {
  const { toast } = useToast();
  const { data, isLoading } = useXxx();
  const createMutation = useCreateXxx();
  const updateMutation = useUpdateXxx();
  const deleteMutation = useDeleteXxx();

  return (
    <AdminLayout title="Xxx">
      {/* Table + Dialog CRUD */}
    </AdminLayout>
  );
}
```

Pour ajouter la route, modifier `src/App.tsx`:
```tsx
const AdminXxx = lazy(() => import('./pages/admin/AdminXxx'));
// Dans <Routes>:
<Route path="/admin/xxx" element={<ProtectedRoute><AdminXxx /></ProtectedRoute>} />
```

Pour ajouter a la sidebar, modifier `navItems` dans `src/components/admin/AdminLayout.tsx`:
```typescript
{ href: "/admin/xxx", label: "Xxx", icon: SomeIcon },
```

---

## Auth — Pattern

- `AuthProvider` dans `src/hooks/useAuth.tsx` wrape `<App>` dans `App.tsx`
- Login: `authService.login(credentials)` -> stocke JWT -> `setUser(response.user)`
- Logout: `authService.logout()` -> `tokenStorage.clearTokens()` (stateless, pas d'appel reseau)
- Init: au mount, si token -> `GET /auth/me` pour valider
- `ProtectedRoute` dans `components/admin/ProtectedRoute.tsx` -> redirect `/admin/login` si non auth
- Hook: `const { user, isAuthenticated, loading, signIn, signOut } = useAuth();`

---

## NE PAS FAIRE

- **NE PAS** modifier les fichiers dans `components/ui/` (shadcn/ui genere)
- **NE PAS** utiliser `fetch()` directement — toujours `httpClient`
- **NE PAS** utiliser queryKey en string — toujours tableau: `['xxx']` pas `'xxx'`
- **NE PAS** oublier `skipAuth: true` pour les endpoints publics dans les services
- **NE PAS** utiliser `@Builder` sur les types (convention backend, pas de lien direct mais garder la coherence)
- **NE PAS** creer de fichier `bootcampService.ts` a la racine de `services/` — un legacy existe deja, utiliser celui dans `services/api/`
- **NE PAS** oublier d'ajouter le re-export dans `services/api/index.ts` apres creation d'un nouveau service
- **NE PAS** oublier le lazy import + route dans `App.tsx` + nav item dans `AdminLayout.tsx` pour une nouvelle page admin
- **NE PAS** utiliser `cacheTime` — remplace par `gcTime` dans React Query v5

## Conventions

- Types dans `src/types/index.ts` (ajouter a la suite)
- DTOs: `CreateXxxDTO = Omit<Xxx, 'id' | 'createdAt' | 'updatedAt'>`, `UpdateXxxDTO = Partial<CreateXxxDTO>`
- queryKey pattern: `['entite']`, `['entite', 'published']`, `['entite', id]`, `['entite', { page, size }]`
- Pages admin: wrappees dans `<AdminLayout title="...">` + protegees par `<ProtectedRoute>`
- Icones: `lucide-react` (import depuis `lucide-react`)
- Toast: `import { useToast } from '@/hooks/use-toast'`
- Formulaires: `react-hook-form` + `zod` pour validation
- Dates: `date-fns` pour formatting
