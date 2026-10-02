/**
 * Espace.tsx — point d'arrivée des apprenants après connexion (Lot 3).
 * Le tableau de bord réel (App-Apprenant.dc.html) arrive au Lot 5 ; cette page
 * existe pour que la redirection par rôle et le guard LEARNER soient fonctionnels.
 */
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layouts/AppLayout";
import { Button, Card } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";

export default function Espace() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout
      navItems={[{ href: "/espace", label: "Mon espace", icon: LayoutDashboard, exact: true }]}
      greeting="Bonjour 👋"
    >
      <Card radius="stat" className="flex max-w-xl flex-col gap-3 p-8">
        <p className="font-heading text-xl font-bold text-navy">Votre espace apprenant arrive bientôt</p>
        <p className="text-sm text-ink-secondary">
          Connecté en tant que {user?.email}. Vos formations, évaluations et certificats seront disponibles ici.
        </p>
        <Button
          variant="outline"
          shape="rounded"
          className="w-fit"
          onClick={() => {
            signOut();
            navigate("/connexion", { replace: true });
          }}
        >
          Se déconnecter
        </Button>
      </Card>
    </AppLayout>
  );
}
