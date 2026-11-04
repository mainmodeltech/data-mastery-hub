/**
 * Coque des écrans d'authentification secondaires (mot de passe oublié / réinitialisation) : la même que /connexion (AuthShell), avec un
 * titre et une phrase d'introduction à gauche du panneau de marque.
 */
import type { ReactNode } from "react";

import { AuthShell } from "@/components/auth/AuthShell";

export interface AuthCardLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCardLayout({ title, description, children }: AuthCardLayoutProps) {
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-[2rem] font-extrabold leading-tight tracking-[-1px] text-navy lg:text-[2.5rem]">{title}</h1>
        {description && <p className="text-base text-ink-secondary">{description}</p>}
      </div>
      {children}
    </AuthShell>
  );
}
