/**
 * Certificat.tsx — page publique de vérification (route /certificats/:publicId), cible du QR code
 * et de l'e-mail de délivrance. Aucune donnée de contact n'est affichée ; un certificat révoqué
 * l'indique clairement et n'offre plus de PDF.
 */
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle, BadgeCheck, Download, Loader2, ShieldAlert } from "lucide-react";

import { SeoHead } from "@/components/SeoHead";
import { Logo } from "@/components/shared/Logo";
import { Button, Card, Pill } from "@/components/shared";
import { useDownloadCertificatePdf, useVerifyCertificate } from "@/hooks/useCertificates";
import { useToast } from "@/hooks/use-toast";
import { saveBlob } from "@/lib/download";
import { ApiError } from "@/services/httpClient";

const date = (iso: string | null | undefined) => (iso ? format(new Date(iso), "d MMMM yyyy", { locale: fr }) : "—");

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-site-bg px-4 py-10">
      <SeoHead title="Vérification d'un certificat" description="Vérifiez l'authenticité d'un certificat Model Technologie." path="/certificats" noIndex />
      <Link to="/" aria-label="Model Technologie — accueil"><Logo className="h-14" /></Link>
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}

export default function Certificat() {
  const { publicId } = useParams<{ publicId: string }>();
  const { toast } = useToast();
  const { data: c, isLoading, error } = useVerifyCertificate(publicId);
  const pdf = useDownloadCertificatePdf();

  if (isLoading) {
    return <Frame><Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" /></Frame>;
  }

  if (error || !c) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <Frame>
        <div role="alert" className="flex items-start gap-3 rounded-card bg-error-bg px-5 py-4 text-error">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">{notFound ? "Certificat introuvable" : "Vérification momentanément indisponible"}</span>
            <span className="text-sm">
              {notFound
                ? "Aucun certificat ne correspond à ce numéro. Vérifiez le lien ou le QR code utilisé."
                : "Réessayez dans quelques instants."}
            </span>
          </div>
        </div>
      </Frame>
    );
  }

  const revoked = c.status === "REVOKED";

  const download = async () => {
    try {
      saveBlob(await pdf.mutateAsync(c.publicId), `certificat-${c.publicId}.pdf`);
    } catch (err) {
      toast({
        title: err instanceof ApiError && err.status === 410 ? "Certificat révoqué" : "Téléchargement impossible",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    }
  };

  return (
    <Frame>
      <Card radius="callout" className="flex flex-col gap-6 border border-[#E7E0D4] p-6 sm:p-8">
        <div className="flex flex-col items-start gap-3">
          {revoked ? (
            <Pill variant="error"><ShieldAlert className="h-4 w-4" />Certificat révoqué</Pill>
          ) : (
            <Pill variant="success"><BadgeCheck className="h-4 w-4" />Certificat authentique</Pill>
          )}
          <h1 className="font-heading text-[1.875rem] font-extrabold leading-tight tracking-[-0.5px] text-navy">{c.recipientName}</h1>
          <p className="text-ink-secondary">
            {revoked ? "n'est plus titulaire de ce certificat" : "a validé la formation"}{" "}
            <strong className="text-ink">{c.formationTitle}</strong>
            {c.durationLabel ? ` (${c.durationLabel})` : ""}.
          </p>
        </div>

        {revoked && (
          <div role="alert" className="rounded-card bg-error-bg px-4 py-3 text-sm text-error">
            Ce certificat a été révoqué{c.revokedAt ? ` le ${date(c.revokedAt)}` : ""} et n'est plus valable.
          </div>
        )}

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <dt className="text-ink-secondary">Délivré le</dt>
            <dd className="font-semibold text-ink">{date(c.issuedAt)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-ink-secondary">Organisme</dt>
            <dd className="font-semibold text-ink">{c.issuer}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-ink-secondary">Numéro</dt>
            <dd className="break-all font-semibold text-ink">{c.publicId}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-ink-secondary">Projet final</dt>
            <dd className="font-semibold text-ink">{c.includesProject ? "Validé" : "Non requis"}</dd>
          </div>
          {c.signatoryName && (
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <dt className="text-ink-secondary">Signataire</dt>
              <dd className="font-semibold text-ink">
                {c.signatoryName}{c.signatoryTitle ? `, ${c.signatoryTitle}` : ""}
              </dd>
            </div>
          )}
        </dl>

        {c.skills.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-navy">Compétences attestées</h2>
            <ul className="flex flex-wrap gap-2">
              {c.skills.map((s) => <li key={s}><Pill variant="info">{s}</Pill></li>)}
            </ul>
          </div>
        )}

        {!revoked && (
          <Button type="button" variant="navy" shape="rounded" className="w-fit" disabled={pdf.isPending} onClick={() => void download()}>
            {pdf.isPending ? <Loader2 className="animate-spin" /> : <><Download />Télécharger le PDF</>}
          </Button>
        )}
      </Card>
    </Frame>
  );
}
