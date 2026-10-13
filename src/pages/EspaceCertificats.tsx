/**
 * /espace/certificats — « Mes certificats » : liste (GET /learner/certificates), PDF, lien public
 * de vérification et bouton « Ajouter à LinkedIn » fourni par l'API.
 */
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Award, Download, ExternalLink, Linkedin, Loader2 } from "lucide-react";

import { Button, Card, Pill } from "@/components/shared";
import { LearnerShell } from "@/components/learner/LearnerShell";
import { useDownloadCertificatePdf, useMyCertificates } from "@/hooks/useCertificates";
import { useToast } from "@/hooks/use-toast";
import { saveBlob } from "@/lib/download";
import { ApiError } from "@/services/httpClient";
import type { LearnerCertificate } from "@/types/certificate.type";

/** Lien externe fourni par l'API : on n'ouvre que du http(s). */
function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, window.location.origin);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Chemin de la page de vérification : on garde la route du front même si l'API renvoie une URL absolue. */
function verifyPath(c: LearnerCertificate): string {
  return `/certificats/${encodeURIComponent(c.publicId)}`;
}

function CertificateCard({ c }: { c: LearnerCertificate }) {
  const { toast } = useToast();
  const pdf = useDownloadCertificatePdf();
  const revoked = c.status === "REVOKED";
  const linkedIn = safeHttpUrl(c.linkedInUrl);

  const download = async () => {
    try {
      saveBlob(await pdf.mutateAsync(c.publicId), `certificat-${c.publicId}.pdf`);
    } catch (err) {
      toast({ title: "Téléchargement impossible", description: err instanceof ApiError ? err.message : undefined, variant: "destructive" });
    }
  };

  return (
    <Card radius="stat" className="flex flex-col gap-4 border border-[#E7E0D4] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-heading text-lg font-bold text-navy">{c.formationTitle}</h2>
          <span className="text-sm text-ink-secondary">
            Délivré le {format(new Date(c.issuedAt), "d MMMM yyyy", { locale: fr })} · n° <span className="break-all">{c.publicId}</span>
          </span>
        </div>
        <Pill variant={revoked ? "error" : "success"}>{revoked ? "Révoqué" : "Valide"}</Pill>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {!revoked && (
          <Button type="button" variant="navy" shape="rounded" size="sm" disabled={pdf.isPending} onClick={() => void download()}>
            {pdf.isPending ? <Loader2 className="animate-spin" /> : <><Download />Télécharger le PDF</>}
          </Button>
        )}
        <Button asChild variant="outline" shape="rounded" size="sm">
          <Link to={verifyPath(c)}><ExternalLink />Page de vérification</Link>
        </Button>
        {!revoked && linkedIn && (
          <Button asChild variant="outline" shape="rounded" size="sm">
            <a href={linkedIn} target="_blank" rel="noopener noreferrer"><Linkedin />Ajouter à LinkedIn</a>
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function EspaceCertificats() {
  const { data, isLoading, isError } = useMyCertificates();

  return (
    <LearnerShell title="Mes certificats" description="Vos certificats de fin de formation">
      <div className="flex flex-col gap-4">
        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && (
          <div role="alert" className="rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            Impossible de charger vos certificats pour le moment.
          </div>
        )}
        {data && data.length === 0 && (
          <Card radius="stat" variant="sand" className="flex flex-col items-start gap-3 p-8">
            <Award className="h-8 w-8 text-navy" aria-hidden="true" />
            <p className="font-heading text-lg font-bold text-navy">Pas encore de certificat</p>
            <p className="text-sm text-ink-secondary">
              Votre certificat est préparé dès que toutes les conditions de la formation sont remplies, puis validé par notre équipe avant de vous être envoyé.
            </p>
            <Button asChild variant="navy" shape="rounded" size="sm">
              <Link to="/espace/evaluations">Voir les conditions</Link>
            </Button>
          </Card>
        )}
        {data?.map((c) => <CertificateCard key={c.publicId} c={c} />)}
      </div>
    </LearnerShell>
  );
}
