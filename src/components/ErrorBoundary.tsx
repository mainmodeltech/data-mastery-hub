/**
 * Error Boundary global pour capturer les erreurs React non gerees.
 * Affiche une UI de fallback propre au lieu d'un ecran blanc.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Logger l'erreur (remplacer par un service de monitoring en production)
    console.error('[ErrorBoundary] Erreur capturee :', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <h1 className="font-heading text-2xl font-bold text-foreground mb-3">
              Oups ! Une erreur est survenue
            </h1>

            <p className="text-muted-foreground mb-8">
              Nous nous excusons pour la gene. L'erreur a ete enregistree et notre equipe en a ete informee.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="h-4 w-4" />
                Accueil
              </Button>
              <Button onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4" />
                Recharger la page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
