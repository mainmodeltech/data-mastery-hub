import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Bootcamps from "./pages/Bootcamps";
import Alumni from "./pages/Alumni";
import References from "./pages/References";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBootcamps from "./pages/admin/AdminBootcamps";
import AdminInscriptions from "./pages/admin/AdminInscriptions";
import AdminServices from "./pages/admin/AdminServices";
import AdminReferences from "./pages/admin/AdminReferences";
import AdminTemoignages from "./pages/admin/AdminTemoignages";
import AdminAlumni from "./pages/admin/AdminAlumni";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminGalerie from "./pages/admin/AdminGalerie";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Site public */}
            <Route path="/" element={<Index />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/bootcamps" element={<Bootcamps />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/references" element={<References />} />
            <Route path="/contact" element={<Contact />} />

            {/* Backoffice admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/bootcamps" element={<ProtectedRoute><AdminBootcamps /></ProtectedRoute>} />
            <Route path="/admin/inscriptions" element={<ProtectedRoute><AdminInscriptions /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/references" element={<ProtectedRoute><AdminReferences /></ProtectedRoute>} />
            <Route path="/admin/temoignages" element={<ProtectedRoute><AdminTemoignages /></ProtectedRoute>} />
            <Route path="/admin/alumni" element={<ProtectedRoute><AdminAlumni /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/galerie" element={<ProtectedRoute><AdminGalerie /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
