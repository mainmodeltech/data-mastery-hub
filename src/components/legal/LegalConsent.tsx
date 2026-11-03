/**
 * LegalConsent — case d'acceptation des textes légaux avant un acte (candidature, achat, demande, paiement).
 * Elle affiche les textes PUBLIÉS exigés pour cet acte, chacun en lien vers sa page (nouvel onglet), et reste une case `terms` obligatoire des
 * formulaires existants. Tant que rien n'est publié, elle retombe sur le libellé historique : rien ne bloque. Le serveur contrôle de toute façon que
 * les versions envoyées (`useLegalAcceptedIds`) sont celles en vigueur.
 */
import { Fragment } from "react";
import { Link } from "react-router-dom";

import { useLegalRequirements } from "@/hooks/useLegal";
import type { LegalContext, LegalDocumentRef } from "@/types/legal.type";

const LINK_LABELS: Record<LegalDocumentRef["code"], string> = {
  CGU: "les conditions générales d'utilisation",
  CGV: "les conditions générales de vente",
  PRIVACY: "la politique de confidentialité",
  MENTIONS: "les mentions légales",
};

/** « les conditions générales d'utilisation, les conditions générales de vente et la politique de confidentialité » : un lien par texte. */
export function DocumentLinks({ documents }: { documents: LegalDocumentRef[] }) {
  return (
    <>
      {documents.map((d, i) => (
        <Fragment key={d.id}>
          {i > 0 && (i === documents.length - 1 ? " et " : ", ")}
          <Link to={d.path} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-2 hover:text-cta">
            {LINK_LABELS[d.code]}
          </Link>
        </Fragment>
      ))}
    </>
  );
}

interface Props {
  context: LegalContext;
  /** Libellé utilisé tant qu'aucun texte n'est publié. */
  fallbackLabel: string;
  /** Début de phrase devant la liste des textes (« J'ai lu et j'accepte »). */
  lead?: string;
  name?: string;
  className?: string;
  /** Ne rien afficher tant qu'aucun texte n'est publié (formulaires qui n'avaient pas de case avant). */
  hideWhenNone?: boolean;
  /** Mode contrôlé : l'état de la case est tenu par le formulaire. */
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function LegalConsent({ context, fallbackLabel, lead = "J'ai lu et j'accepte", name = "terms", className, hideWhenNone, checked, onCheckedChange }: Props) {
  const { data } = useLegalRequirements(context);
  const docs = data?.documents ?? [];
  if (hideWhenNone && docs.length === 0) return null;
  const controlled = checked !== undefined && onCheckedChange !== undefined;
  return (
    <label className={className ?? "flex items-start gap-2 text-sm text-ink"}>
      <input
        name={name} type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#1A3A5B]"
        {...(controlled ? { checked, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(e.target.checked) } : {})}
      />
      <span>{docs.length > 0 ? <>{lead} <DocumentLinks documents={docs} />.</> : fallbackLabel}</span>
    </label>
  );
}
