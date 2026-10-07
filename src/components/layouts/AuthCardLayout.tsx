/**
 * Coque des écrans d'authentification secondaires (mot de passe oublié / réinitialisation).
 * Même langage visuel que /connexion : fond site, logo officiel, carte blanche.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/shared/Logo";
import { Card } from "@/components/shared";

export interface AuthCardLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthCardLayout({ title, description, children }: AuthCardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-site-bg px-4 py-10">
      <Link to="/" aria-label="Model Technologie — accueil" className="flex w-fit items-center">
        <Logo className="h-14" />
      </Link>

      <Card radius="callout" className="w-full max-w-md border border-[#E7E0D4] p-8">
        <div className="mb-6 flex flex-col gap-2 text-center">
          <h1 className="font-heading text-2xl font-extrabold tracking-[-0.5px] text-navy">{title}</h1>
          {description && <p className="text-sm text-ink-secondary">{description}</p>}
        </div>
        {children}
      </Card>
    </div>
  );
}
