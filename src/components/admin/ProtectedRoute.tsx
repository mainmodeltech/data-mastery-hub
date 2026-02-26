/**
 * ProtectedRoute - Bypass temporaire de l'authentification.
 * TODO: Reactiver la verification JWT quand le backend auth sera implemente.
 */

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Auth bypass: laisser passer tout le monde pour le moment
  return <>{children}</>;

  // --- Code original a reactiver avec JWT ---
  // const { user, loading } = useAuth();
  // const location = useLocation();
  //
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-secondary">
  //       <div className="text-muted-foreground">Chargement...</div>
  //     </div>
  //   );
  // }
  //
  // if (!user) {
  //   return <Navigate to="/admin/login" state={{ from: location }} replace />;
  // }
  //
  // return <>{children}</>;
};

export default ProtectedRoute;
