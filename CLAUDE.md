# Frontend — React SPA

## Tech

React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack React Query v5, React Router.

## Architecture

```
src/
  config/constants.ts          — API_CONFIG.baseUrl (VITE_API_BASE_URL)
  services/
    httpClient.ts              — fetch wrapper (auth, refresh, error handling)
    api/                       — services par entite (bootcampService, registrationService, etc.)
    api/index.ts               — re-exports
    bootcampService.ts         — service public bootcamps (legacy, utilise aussi)
  hooks/
    useBootcamps.ts            — React Query hooks (queries + mutations)
    useRegistrations.ts        — idem pour inscriptions
    useServices.ts             — idem pour services B2B
    useAuth.tsx                — AuthContext + provider
    use*.ts                    — autres hooks React Query
  types/
    index.ts                   — types metier + DTOs + PaginatedResponse
    bootcamp.type.ts           — Bootcamp, BootcampSession, SessionStatus, SessionFormat
    auth.type.ts               — types auth
  pages/
    Index.tsx                  — landing page
    Bootcamps.tsx              — catalogue bootcamps + RegistrationModal
    Bootcampsessions.tsx       — admin sessions (CRUD)
    Contact.tsx, About.tsx...  — pages publiques
    admin/
      AdminDashboard.tsx       — dashboard admin
      AdminBootcamps.tsx       — CRUD bootcamps
      AdminInscriptions.tsx    — gestion inscriptions
      AdminServices.tsx        — CRUD services
      Admin*.tsx               — autres CRUD admin
  components/
    layout/                    — Header, Footer, Layout
    home/                      — sections landing (HeroSection, etc.)
    admin/                     — AdminLayout, ProtectedRoute
    ui/                        — shadcn/ui (NE PAS MODIFIER ces fichiers)
```

## Pattern services API

```typescript
// services/api/xxxService.ts
import { httpClient } from '@/services/httpClient';
import type { Xxx, CreateXxxDTO, PaginatedResponse } from '@/types';

const PATH = '/xxx';          // public
const ADMIN_PATH = '/admin/xxx'; // admin

export const xxxService = {
  getAll: () => httpClient.get<Xxx[]>(PATH),
  create: (data: CreateXxxDTO) => httpClient.post<Xxx>(PATH, data, { skipAuth: true }),
  // admin...
  adminGetAll: (page?: number) => httpClient.get<PaginatedResponse<Xxx>>(ADMIN_PATH, { params: { page } }),
};
```

## Pattern hooks React Query

```typescript
// hooks/useXxx.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { xxxService } from '@/services/api';

export const useXxx = () => useQuery({ queryKey: ['xxx'], queryFn: xxxService.getAll });
export const useCreateXxx = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: xxxService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['xxx'] }) });
};
```

## Types importants (types/index.ts)

```typescript
type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
type CreateRegistrationDTO = Omit<Registration, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

interface PaginatedResponse<T> {
  content: T[]; totalElements: number; totalPages: number;
  size: number; number: number; first: boolean; last: boolean; empty: boolean;
}
```

## Types bootcamp (types/bootcamp.type.ts)

```typescript
type SessionStatus = 'DRAFT' | 'UPCOMING' | 'OPEN' | 'CLOSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type SessionFormat = 'PRESENTIEL' | 'REMOTE' | 'HYBRID';

interface BootcampSession {
  id, bootcampId, sessionName, cohortNumber, year,
  startDate, endDate, registrationDeadline,
  maxParticipants, currentParticipants, isFull,
  status, format, location, price, earlyBirdPrice, earlyBirdDeadline,
  isFeatured, published, spotsRemaining
}

interface Bootcamp {
  id, title, description, duration, audience, prerequisites, price,
  benefits[], category, tag, iconName, featured, published, displayOrder,
  nextSession?: BootcampSession, sessions?: BootcampSession[]
}
```

## Regles importantes

- **shadcn/ui** (`components/ui/`) : fichiers generes, ne pas les modifier manuellement
- **httpClient** : toutes les requetes API passent par `httpClient.ts`. Ne jamais utiliser `fetch()` directement.
- Endpoints publics : `{ skipAuth: true }` dans httpClient
- **React Query v5** : queryKey en tableau (`['bootcamps']`), pas de string
- **API base URL** : `import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'`

## Build

```bash
npm run dev      # Vite dev server (port 8080)
npm run build    # production build
npm run preview  # preview production build
```
