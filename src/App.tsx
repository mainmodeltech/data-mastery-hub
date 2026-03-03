/**
 * Point d'entree de l'application React.
 */

import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QUERY_CONFIG } from '@/config/constants';
import ProtectedRoute from '@/components/admin/ProtectedRoute';

// ============================================================
// Lazy loading des pages
// ============================================================

// Pages publiques
const Index = lazy(() => import('./pages/Index'));
const About = lazy(() => import('./pages/About'));
// const Services = lazy(() => import('./pages/Services'));
const Bootcamps = lazy(() => import('./pages/Bootcamps'));
const Alumni = lazy(() => import('./pages/Alumni'));
const Orientation = lazy(() => import('./pages/Orientation'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Pages admin
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBootcamps = lazy(() => import('./pages/admin/AdminBootcamps'));
const AdminBootcampForm = lazy(() => import('./pages/admin/BootcampForm'));
const AdminAllSessions = lazy(() => import('./pages/admin/AdminAllSessions'));
const AdminInscriptions = lazy(() => import('./pages/admin/AdminInscriptions'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminReferences = lazy(() => import('./pages/admin/AdminReferences'));
const AdminTemoignages = lazy(() => import('./pages/admin/AdminTemoignages'));
const AdminAlumni = lazy(() => import('./pages/admin/AdminAlumni'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminGalerie = lazy(() => import('./pages/admin/AdminGalerie'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));

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
                  <Route path="/bootcamps" element={<Bootcamps />} />
                  <Route path="/alumni" element={<Alumni />} />
                  <Route path="/orientation" element={<Orientation />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* ── Backoffice admin ─────────────────────────── */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                  {/* Bootcamps */}
                  <Route path="/admin/bootcamps" element={<ProtectedRoute><AdminBootcamps /></ProtectedRoute>} />
                  <Route path="/admin/bootcamps/new" element={<ProtectedRoute><AdminBootcampForm /></ProtectedRoute>} />
                  <Route path="/admin/bootcamps/:id/edit" element={<ProtectedRoute><AdminBootcampForm /></ProtectedRoute>} />

                  {/* Sessions bootcamp */}
                  <Route path="/admin/bootcamp-sessions" element={<ProtectedRoute><AdminAllSessions /></ProtectedRoute>} />

                  {/* Autres sections */}
                  <Route path="/admin/inscriptions" element={<ProtectedRoute><AdminInscriptions /></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
                  <Route path="/admin/references" element={<ProtectedRoute><AdminReferences /></ProtectedRoute>} />
                  <Route path="/admin/temoignages" element={<ProtectedRoute><AdminTemoignages /></ProtectedRoute>} />
                  <Route path="/admin/alumni" element={<ProtectedRoute><AdminAlumni /></ProtectedRoute>} />
                  <Route path="/admin/projets" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
                  <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
                  <Route path="/admin/galerie" element={<ProtectedRoute><AdminGalerie /></ProtectedRoute>} />

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
