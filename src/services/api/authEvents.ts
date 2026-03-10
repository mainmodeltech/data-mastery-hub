/**
 * Bus d'événements d'authentification.
 *
 * Permet au httpClient (qui n'a pas accès au contexte React)
 * de signaler un 401/403 au AuthProvider pour déclencher
 * une déconnexion automatique.
 *
 * Usage :
 *   - httpClient émet :  authEvents.emit('unauthorized')
 *   - AuthProvider écoute et appelle signOut()
 */

type AuthEventType = 'unauthorized';

type Listener = () => void;

class AuthEventBus {
    private listeners: Map<AuthEventType, Set<Listener>> = new Map();

    on(event: AuthEventType, listener: Listener): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);

        // Retourne une fonction de cleanup
        return () => this.off(event, listener);
    }

    off(event: AuthEventType, listener: Listener): void {
        this.listeners.get(event)?.delete(listener);
    }

    emit(event: AuthEventType): void {
        this.listeners.get(event)?.forEach(listener => listener());
    }
}

export const authEvents = new AuthEventBus();
