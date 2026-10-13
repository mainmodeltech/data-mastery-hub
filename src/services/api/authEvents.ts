/**
 * Bus d'événements d'authentification.
 *
 * Permet au httpClient (qui n'a pas accès au contexte React) de prévenir le AuthProvider :
 *   - 'unauthorized' : la session est terminée (rafraîchissement refusé) → déconnexion locale ;
 *   - 'token'        : un nouveau jeton d'accès vient d'être obtenu par rafraîchissement silencieux.
 */

interface AuthEventMap {
  unauthorized: undefined;
  token: string;
}

type AuthEventType = keyof AuthEventMap;
type Listener<T extends AuthEventType> = (payload: AuthEventMap[T]) => void;

class AuthEventBus {
  private listeners = new Map<AuthEventType, Set<Listener<AuthEventType>>>();

  on<T extends AuthEventType>(event: T, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as Listener<AuthEventType>);
    return () => this.off(event, listener);
  }

  off<T extends AuthEventType>(event: T, listener: Listener<T>): void {
    this.listeners.get(event)?.delete(listener as Listener<AuthEventType>);
  }

  emit<T extends AuthEventType>(event: T, ...payload: AuthEventMap[T] extends undefined ? [] : [AuthEventMap[T]]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload[0] as never));
  }
}

export const authEvents = new AuthEventBus();
