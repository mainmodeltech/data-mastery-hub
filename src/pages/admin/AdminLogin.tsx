/**
 * AdminLogin.tsx
 *
 * Page de connexion au backoffice — utilise désormais useAuth branché
 * sur le backend Spring Boot (JWT) au lieu de Supabase.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const { signIn } = useAuth();
  const navigate   = useNavigate();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <img src={logo} alt="Model Technologie" className="h-14 w-auto mb-4" />
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">Backoffice Admin</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Connectez-vous pour accéder au panneau d'administration
                </p>
              </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@model-technologie.com"
                      className="pl-10"
                      required
                      autoComplete="email"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                      autoComplete="current-password"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                  >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
              >
                {loading ? "Connexion en cours…" : "Se connecter"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Retour au site
              </a>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminLogin;
