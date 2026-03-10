/**
 * Page de réinitialisation du mot de passe.
 * Route : /admin/reset-password?token=<uuid>
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const AdminResetPassword = () => {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get('token') ?? '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Rediriger si pas de token dans l'URL
    useEffect(() => {
        if (!token) {
            navigate('/admin/login', { replace: true });
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setLoading(true);
        const { error } = await resetPassword(token, newPassword);

        if (error) {
            setError('Le lien est invalide ou a expiré. Veuillez faire une nouvelle demande.');
        } else {
            setSuccess(true);
            // Rediriger vers login après 3 secondes
            setTimeout(() => navigate('/admin/login'), 3000);
        }
        setLoading(false);
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-card">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="Model Technologie" className="h-14 w-auto mb-4" />
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-foreground">Nouveau mot de passe</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Choisissez un mot de passe sécurisé (8 caractères minimum)
                            </p>
                        </div>
                    </div>

                    {/* Succès */}
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Mot de passe modifié !</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Vous allez être redirigé vers la page de connexion…
                                </p>
                            </div>
                            <Link
                                to="/admin/login"
                                className="inline-block text-sm text-primary hover:underline"
                            >
                                Se connecter maintenant
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-10"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                {/* Indicateur de correspondance */}
                                {confirmPassword && (
                                    <p className={`text-xs ${newPassword === confirmPassword ? 'text-green-500' : 'text-destructive'}`}>
                                        {newPassword === confirmPassword
                                            ? '✓ Les mots de passe correspondent'
                                            : '✗ Les mots de passe ne correspondent pas'}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={loading || newPassword !== confirmPassword}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Modification en cours...
                                        </>
                                    ) : (
                                        'Définir le nouveau mot de passe'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-border text-center">
                                <Link
                                    to="/admin/forgot-password"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Demander un nouveau lien
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminResetPassword;
