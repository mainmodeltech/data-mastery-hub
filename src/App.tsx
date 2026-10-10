/**
 * Point d'entree de l'application React.
 */

import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QUERY_CONFIG } from '@/config/constants';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { LEARNER_ROLES, ROLE_GROUPS, STAFF_ROLES } from '@/lib/roles';
import AdminPromoCodes from "@/pages/admin/AdminPromoCodes.tsx";
import MasterclassPage from "@/pages/MasterclassPage";
import AdminForgotPassword from "@/pages/admin/AdminForgotPassword.tsx";
import AdminResetPassword from "@/pages/admin/AdminResetPassword.tsx";

// L'espace apprenant est aussi ouvert au personnel (aperçu depuis l'éditeur de formation)
const LEARNER_AREA_ROLES = [...LEARNER_ROLES, ...STAFF_ROLES];

// ============================================================
// Lazy loading des pages
// ============================================================

// Pages publiques
const Index = lazy(() => import('./pages/Index'));
const About = lazy(() => import('./pages/About'));
const Formations = lazy(() => import('./pages/Formations'));
const FormationDetail = lazy(() => import('./pages/FormationDetail'));
const Alumni = lazy(() => import('./pages/Alumni'));
const Orientation = lazy(() => import('./pages/Orientation'));
const Contact = lazy(() => import('./pages/Contact'));
const Connexion = lazy(() => import('./pages/Connexion'));
const ConnexionLien = lazy(() => import('./pages/ConnexionLien'));
const Espace = lazy(() => import('./pages/Espace'));
const MesFormations = lazy(() => import('./pages/MesFormations'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'));
const Evaluations = lazy(() => import('./pages/Evaluations'));
const QuizRunner = lazy(() => import('./pages/QuizRunner'));
const EspaceEvaluations = lazy(() => import('./pages/EspaceEvaluations'));
const EspaceCertificats = lazy(() => import('./pages/EspaceCertificats'));
const EspaceCalendrier = lazy(() => import('./pages/EspaceCalendrier'));
const EspaceRessources = lazy(() => import('./pages/EspaceRessources'));
const EspaceProfil = lazy(() => import('./pages/EspaceProfil'));
const Coaching = lazy(() => import('./pages/Coaching'));
const Entreprises = lazy(() => import('./pages/Entreprises'));
const Ressources = lazy(() => import('./pages/Ressources'));
const Partenaires = lazy(() => import('./pages/Partenaires'));
const Paiement = lazy(() => import('./pages/Paiement'));
const Certificat = lazy(() => import('./pages/Certificat'));
const NewsletterConfirmation = lazy(() => import('./pages/NewsletterToken').then((m) => ({ default: m.NewsletterConfirmation })));
const NewsletterUnsubscribe = lazy(() => import('./pages/NewsletterToken').then((m) => ({ default: m.NewsletterUnsubscribe })));
const NotFound = lazy(() => import('./pages/NotFound'));

// Pages admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMonEspace = lazy(() => import('./pages/admin/AdminMonEspace'));
const AdminBootcamps = lazy(() => import('./pages/admin/AdminBootcamps'));
const AdminBootcampForm = lazy(() => import('./pages/admin/BootcampForm'));
const AdminAllSessions = lazy(() => import('./pages/admin/AdminAllSessions'));
const AdminInscriptions = lazy(() => import('./pages/admin/AdminInscriptions'));
const AdminCandidatures = lazy(() => import('./pages/admin/AdminCandidatures'));
const AdminPaiements = lazy(() => import('./pages/admin/AdminPaiements'));
const AdminFormationEditor = lazy(() => import('./pages/admin/AdminFormationEditor'));
const AdminQuizBank = lazy(() => import('./pages/admin/AdminQuizBank'));
const AdminSessionSuivi = lazy(() => import('./pages/admin/AdminSessionSuivi'));
const AdminApprenants = lazy(() => import('./pages/admin/AdminApprenants'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminContenus = lazy(() => import('./pages/admin/AdminContenus'));
const AdminFactures = lazy(() => import('./pages/admin/AdminFactures'));
const AdminCertificats = lazy(() => import('./pages/admin/AdminCertificats'));
const EspacePaiements = lazy(() => import('./pages/EspacePaiements'));
const AdminEmails = lazy(() => import('./pages/admin/AdminEmails'));
const AdminComptes = lazy(() => import('./pages/admin/AdminComptes'));
const AdminDomaines = lazy(() => import('./pages/admin/AdminDomaines'));
const AdminPartenaires = lazy(() => import('./pages/admin/AdminPartenaires'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminTemoignages = lazy(() => import('./pages/admin/AdminTemoignages'));
const AdminMasterclassPage = lazy(() => import('./pages/admin/AdminMasterclassPage.tsx'));
const AdminAlumni = lazy(() => import('./pages/admin/AdminAlumni'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));

// Lot 0 design-system — dev-only visual check, absent from production builds
const DesignSystemPreview = lazy(() => import('./pages/_dev/DesignSystemPreview'));


// ============================================================
// Configuration React Query
// ============================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.staleTime,
      gcTime: QUERY_CONFIG.gcTime,
      retry: QUERY_CONFIG.retryCount,
      refetchOnWindowFocus: QUERY_CONFIG.refetchOnWindowFocus,
    },
  },
});

// ============================================================
// Composant de chargement
// ============================================================

function PageLoader() {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
  );
}

// ============================================================
// App
// ============================================================

const App = () => (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Site public ─────────────────────────────── */}
                  <Route path="/" element={<Index />} />
                  <Route path="/a-propos" element={<About />} />
                  {/*<Route path="/services" element={<Services />} />*/}
                  {/* Lot 1 — catalogue par domaines. L'ancien /bootcamps y redirige. */}
                  <Route path="/bootcamps" element={<Navigate to="/formations" replace />} />
                  <Route path="/formations" element={<Formations />} />
                  <Route path="/formations/:slug" element={<FormationDetail />} />
                  <Route path="/alumni" element={<Alumni />} />
                  <Route path="/orientation" element={<Orientation />} />
                  <Route path="/contact" element={<Contact />} />
                  {/* Lot 2 — nouvelles pages publiques (docs/design/README.md §2) */}
                  <Route path="/coaching" element={<Coaching />} />
                  <Route path="/entreprises" element={<Entreprises />} />
                  <Route path="/ressources" element={<Ressources />} />
                  <Route path="/partenaires" element={<Partenaires />} />
                  <Route path="/masterclass/power-bi-dashboard" element={<MasterclassPage />} />

                  {/* Lien de paiement envoyé au candidat accepté (jeton = seul secret) */}
                  <Route path="/paiement/:token" element={<Paiement />} />
                  {/* Vérification publique d'un certificat (cible du QR code et de l'e-mail) */}
                  <Route path="/certificats/:publicId" element={<Certificat />} />
                  <Route path="/newsletter/confirmation" element={<NewsletterConfirmation />} />
                  <Route path="/newsletter/desinscription" element={<NewsletterUnsubscribe />} />

                  {/* ── Connexion unique + espace apprenant (Lot 3) ─ */}
                  <Route path="/connexion" element={<Connexion />} />
                  <Route path="/connexion/lien" element={<ConnexionLien />} />
                  {/* Le personnel y accède aussi : bouton « Aperçu apprenant » de l'éditeur de formation */}
                  <Route path="/espace" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><Espace /></ProtectedRoute>} />
                  <Route path="/espace/formations" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><MesFormations /></ProtectedRoute>} />
                  <Route path="/espace/formations/:id" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><CoursePlayer /></ProtectedRoute>} />
                  <Route path="/espace/formations/:id/lecons/:lessonId" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><CoursePlayer /></ProtectedRoute>} />
                  {/* Lot 6 — évaluations (quiz, projet final, conditions du certificat) */}
                  <Route path="/espace/calendrier" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><EspaceCalendrier /></ProtectedRoute>} />
                  <Route path="/espace/ressources" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><EspaceRessources /></ProtectedRoute>} />
                  <Route path="/espace/paiements" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><EspacePaiements /></ProtectedRoute>} />
                  <Route path="/espace/profil" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><EspaceProfil /></ProtectedRoute>} />
                  <Route path="/espace/certificats" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><EspaceCertificats /></ProtectedRoute>} />
                  <Route path="/espace/evaluations" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><EspaceEvaluations /></ProtectedRoute>} />
                  <Route path="/espace/formations/:id/evaluations" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><Evaluations /></ProtectedRoute>} />
                  <Route path="/espace/formations/:id/evaluations/:quizId" element={<ProtectedRoute roles={LEARNER_AREA_ROLES}><QuizRunner /></ProtectedRoute>} />

                  {/* ── Backoffice admin ─────────────────────────── */}
                  <Route path="/admin/login"          element={<Navigate to="/connexion" replace />} />
                  <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                  {/* Chemins neutres : le lien d'invitation / de réinitialisation envoyé aux apprenants */}
                  <Route path="/mot-de-passe-oublie" element={<AdminForgotPassword />} />
                  <Route path="/reinitialiser-mot-de-passe" element={<AdminResetPassword />} />
                  <Route path="/admin/reset-password"  element={<AdminResetPassword />} />

                  <Route path="/admin/espace" element={<ProtectedRoute roles={ROLE_GROUPS.BACKOFFICE}><AdminMonEspace /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute roles={ROLE_GROUPS.BACKOFFICE}><AdminDashboard /></ProtectedRoute>} />

                  {/* Bootcamps */}
                  <Route path="/admin/bootcamps" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminBootcamps /></ProtectedRoute>} />
                  <Route path="/admin/bootcamps/new" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminBootcampForm /></ProtectedRoute>} />
                  <Route path="/admin/bootcamps/:id/edit" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminBootcampForm /></ProtectedRoute>} />

                  {/* Sessions bootcamp */}
                  <Route path="/admin/bootcamp-sessions" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminAllSessions /></ProtectedRoute>} />




                  {/* Autres sections */}
                  <Route path="/admin/lessons/:lessonId/quiz" element={<ProtectedRoute roles={ROLE_GROUPS.PROGRAM}><AdminQuizBank /></ProtectedRoute>} />
                  <Route path="/admin/formations/:id" element={<ProtectedRoute roles={ROLE_GROUPS.PROGRAM}><AdminFormationEditor /></ProtectedRoute>} />
                  <Route path="/admin/apprenants" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminApprenants /></ProtectedRoute>} />
                  <Route path="/admin/newsletter" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminNewsletter /></ProtectedRoute>} />
                  <Route path="/admin/contenus" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminContenus /></ProtectedRoute>} />
                  <Route path="/admin/factures" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminFactures /></ProtectedRoute>} />
                  <Route path="/admin/certificats" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminCertificats /></ProtectedRoute>} />
                  <Route path="/admin/emails" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminEmails /></ProtectedRoute>} />
                  <Route path="/admin/comptes" element={<ProtectedRoute roles={ROLE_GROUPS.SUPER}><AdminComptes /></ProtectedRoute>} />
                  <Route path="/admin/domaines" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminDomaines /></ProtectedRoute>} />
                  <Route path="/admin/partenaires" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminPartenaires /></ProtectedRoute>} />
                  <Route path="/admin/sessions/:id" element={<ProtectedRoute roles={ROLE_GROUPS.PEDAGOGY}><AdminSessionSuivi /></ProtectedRoute>} />
                  <Route path="/admin/paiements" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminPaiements /></ProtectedRoute>} />
                  <Route path="/admin/candidatures" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminCandidatures /></ProtectedRoute>} />
                  <Route path="/admin/inscriptions" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminInscriptions /></ProtectedRoute>} />
                  <Route path="/admin/promo-codes" element={<ProtectedRoute roles={ROLE_GROUPS.ADMINS}><AdminPromoCodes /></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminServices /></ProtectedRoute>} />
                  <Route path="/admin/temoignages" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminTemoignages /></ProtectedRoute>} />
                  <Route path="/admin/masterclass" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminMasterclassPage /></ProtectedRoute>} />
                  <Route path="/admin/alumni" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminAlumni /></ProtectedRoute>} />
                  <Route path="/admin/projets" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminProjects /></ProtectedRoute>} />
                  <Route path="/admin/messages" element={<ProtectedRoute roles={ROLE_GROUPS.CONTENT}><AdminMessages /></ProtectedRoute>} />


                  {import.meta.env.DEV && (
                    <Route path="/_dev/design-system" element={<DesignSystemPreview />} />
                  )}

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
);

export default App;
