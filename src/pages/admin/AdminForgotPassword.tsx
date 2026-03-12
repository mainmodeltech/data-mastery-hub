/**
 * Page de demande de réinitialisation de mot de passe.
 * Route : /admin/forgot-password
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

const AdminForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await forgotPassword(email);

        if (error) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } else {
            setSubmitted(true); // Toujours afficher la confirmation (sécurité anti-énumération)
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-card">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="Model Technologie" className="h-14 w-auto mb-4" />
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-foreground">Mot de passe oublié</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Saisissez votre email pour recevoir un lien de réinitialisation
                            </p>
                        </div>
                    </div>

                    {/* État : soumis avec succès */}
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Email envoyé !</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Si un compte est associé à <strong>{email}</strong>, vous recevrez
                                    un lien de réinitialisation dans quelques minutes.
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Pensez à vérifier vos spams.
                                </p>
                            </div>
                            <Link
                                to="/admin/login"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Retour à la connexion
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@modeltechnologie.com"
                                            className="pl-10"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        'Envoyer le lien de réinitialisation'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-border text-center">
                                <Link
                                    to="/admin/login"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Retour à la connexion
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminForgotPassword;
