/**
 * LearnerLegalGate — l'apprenant doit accepter les textes légaux en vigueur (conditions d'utilisation, confidentialité) avant d'utiliser son espace :
 * à la première connexion, puis à chaque nouvelle version publiée. Une version déjà acceptée n'est jamais redemandée.
 * Tant que rien n'est publié, ou si le serveur ne répond pas, rien ne bloque (on ne verrouille pas un apprenant sur une panne).
 */
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

import { DocumentLinks } from "@/components/legal/LegalConsent";
import { Button, Card } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useAcceptLearnerLegal, useLearnerLegalPending } from "@/hooks/useLegal";
import { submitErrorMessage } from "@/lib/formErrors";

export function LearnerLegalGate() {
  const { signOut } = useAuth();
  const { data: pending } = useLearnerLegalPending(true);
  const accept = useAcceptLearnerLegal();
  const [checked, setChecked] = useState(false);

  if (!pending || pending.length === 0) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="legal-gate-title" className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-dark/70 p-4 backdrop-blur-sm">
      <Card radius="callout" className="flex w-full max-w-lg flex-col gap-4 p-8">
        <h1 id="legal-gate-title" className="font-heading text-2xl font-bold text-navy">Avant de continuer</h1>
        <p className="text-sm text-ink-secondary">
          Pour utiliser votre espace, vous devez accepter {pending.length > 1 ? "les textes suivants" : "le texte suivant"}. Ils précisent notamment l'usage personnel
          des contenus (formations, banque de questions du simulateur) et la façon dont vos données sont traitées. Chaque version acceptée est enregistrée.
        </p>
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#1A3A5B]" />
          <span>J'ai lu et j'accepte <DocumentLinks documents={pending} />.</span>
        </label>
        {accept.isError && <p role="alert" className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error">{submitErrorMessage(accept.error)}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" shape="pill" size="sm" onClick={() => void signOut()}><LogOut />Me déconnecter</Button>
          <Button type="button" shape="pill" disabled={!checked || accept.isPending} onClick={() => accept.mutate(pending.map((d) => d.id))}>
            {accept.isPending ? <Loader2 className="animate-spin" /> : "Accepter et continuer"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
