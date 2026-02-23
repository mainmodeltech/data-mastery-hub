/**
 * Types TypeScript independants du backend (Supabase/Spring Boot).
 * Ces types representent le contrat d'interface entre le frontend et l'API REST.
 *
 * Convention :
 * - Les types suffixes par "DTO" representent les objets recus/envoyes a l'API.
 * - Les types sans suffixe representent les entites metier cote frontend.
 */

// ============================================================
// Enums & Types communs
// ============================================================

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type ContactMessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export type ReferenceCategory = 'client' | 'school' | 'partner';

// ============================================================
// Entites Metier
// ============================================================

/** Bootcamp / Programme de formation */
export interface Bootcamp {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  audience: string | null;
  prerequisites: string | null;
  price: string | null;
  nextSession: string | null;
  benefits: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Inscription d'un visiteur a un bootcamp */
export interface Registration {
  id: string;
  bootcampId: string | null;
  bootcampTitle: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  position: string | null;
  message: string | null;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
}

/** Alumni - Ancien apprenant ayant termine un bootcamp */
export interface Alumni {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  currentTitle: string | null;
  currentPosition: string | null;
  linkedinUrl: string | null;
  cohort: string | null;
  year: number | null;
  bootcampId: string | null;
  registrationId: string | null;
  published: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Membre d'un projet (liaison Alumni <-> Projet) */
export interface ProjectMember {
  id: string;
  projectId: string;
  alumniId: string;
  role: string | null;
  displayOrder: number | null;
  createdAt: string;
  /** Donnees de l'alumni associe (hydrate par l'API) */
  alumni?: Pick<Alumni, 'id' | 'name' | 'currentTitle' | 'currentPosition' | 'linkedinUrl' | 'photoUrl'>;
}

/** Capture d'ecran d'un projet */
export interface ProjectScreenshot {
  id: string;
  projectId: string;
  photoUrl: string;
  caption: string | null;
  displayOrder: number | null;
  createdAt: string;
}

/** Projet realise par des alumni lors du Demo Day */
export interface Project {
  id: string;
  title: string;
  description: string | null;
  toolsTechnologies: string[];
  accessLink: string | null;
  coverImageUrl: string | null;
  cohort: string | null;
  year: number | null;
  bootcampId: string | null;
  published: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
  /** Relations hydratees */
  members: ProjectMember[];
  screenshots: ProjectScreenshot[];
}

/** Service propose par Model Technologie */
export interface Service {
  id: string;
  title: string;
  description: string | null;
  features: string[];
  duration: string | null;
  iconName: string | null;
  published: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Reference client / partenaire */
export interface Reference {
  id: string;
  name: string;
  fullName: string | null;
  description: string | null;
  logoUrl: string | null;
  logoText: string | null;
  category: ReferenceCategory;
  sector: string | null;
  published: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Temoignage */
export interface Testimonial {
  id: string;
  name: string;
  content: string;
  company: string | null;
  role: string | null;
  rating: number | null;
  published: boolean;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Message de contact */
export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Photo de galerie */
export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  bootcampName: string | null;
  published: boolean;
  displayOrder: number | null;
  createdAt: string;
}

// ============================================================
// DTOs pour creation/modification (envoi vers l'API)
// ============================================================

export type CreateRegistrationDTO = Omit<Registration, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export type CreateContactMessageDTO = Omit<ContactMessage, 'id' | 'status' | 'notes' | 'createdAt' | 'updatedAt'>;

export type CreateBootcampDTO = Omit<Bootcamp, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBootcampDTO = Partial<CreateBootcampDTO>;

export type CreateServiceDTO = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateServiceDTO = Partial<CreateServiceDTO>;

export type CreateAlumniDTO = Omit<Alumni, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAlumniDTO = Partial<CreateAlumniDTO>;

export type CreateProjectDTO = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'members' | 'screenshots'>;
export type UpdateProjectDTO = Partial<CreateProjectDTO>;

export type CreateReferenceDTO = Omit<Reference, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateReferenceDTO = Partial<CreateReferenceDTO>;

export type CreateTestimonialDTO = Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTestimonialDTO = Partial<CreateTestimonialDTO>;

export type CreateGalleryPhotoDTO = Omit<GalleryPhoto, 'id' | 'createdAt'>;
export type UpdateGalleryPhotoDTO = Partial<CreateGalleryPhotoDTO>;

// ============================================================
// Types de reponse API
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// Types d'authentification
// ============================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
