/**
 * LegalPage — page publique d'un texte légal en vigueur (/cgu, /cgv, /confidentialite, /mentions-legales).
 * Affiche la version publiée (numéro et date d'entrée en vigueur). Tant que le texte n'est pas publié, la page l'indique et renvoie au contact.
 */
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { SeoHead } from "@/components/SeoHead";
import { LegalText } from "@/components/legal/LegalText";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { Button, Card } from "@/components/shared";
import { openCookieSettings } from "@/lib/cookieConsent";
import { useLegalDocument } from "@/hooks/useLegal";
import { LEGAL_PATHS, type LegalCode } from "@/types/legal.type";

const TITLES: Record<LegalCode, string> = {
  CGU: "Conditions générales d'utilisation", CGV: "Conditions générales de vente",
  PRIVACY: "Politique de confidentialité et cookies", MENTIONS: "Mentions légales",
};

export default function LegalPage({ code }: { code: LegalCode }) {
  const { data, isLoading, isError } = useLegalDocument(code);
  const title = data?.document.title ?? TITLES[code];

  return (
    <SiteLayout>
      <SeoHead title={title} description={`${title} de Model Technologie.`} path={LEGAL_PATHS[code]} />
      <section className="px-6 py-16 lg:px-20">
        <Card radius="callout" className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
          <h1 className="font-heading text-3xl font-extrabold text-navy">{title}</h1>
          {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-navy" aria-hidden="true" />}
          {isError && (
            <div className="flex flex-col gap-3">
              <p className="text-ink-secondary">Ce document est en cours de préparation et sera publié prochainement. Pour toute question, contactez-nous.</p>
              <Button asChild shape="pill" className="w-fit"><Link to="/contact">Nous contacter</Link></Button>
            </div>
          )}
          {data && (
            <>
              <p className="text-sm text-ink-secondary">
                Version {data.document.version} · en vigueur depuis le {format(new Date(data.document.publishedAt), "d MMMM yyyy", { locale: fr })}
              </p>
              <LegalText source={data.body} />
              {code === "PRIVACY" && (
                <Button type="button" variant="outline" shape="pill" className="w-fit" onClick={openCookieSettings}>Gérer mes cookies</Button>
              )}
            </>
          )}
        </Card>
      </section>
    </SiteLayout>
  );
}
