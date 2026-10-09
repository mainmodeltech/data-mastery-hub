/**
 * Consigne du projet final d'une formation (GET/PUT/DELETE /admin/formations/{id}/project).
 * Sans consigne, la formation n'a pas de projet : les apprenants n'en voient pas.
 * Règles : consigne obligatoire, au moins une extension, taille maximale de 1 à 50 Mo.
 */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { errorMessage } from "@/components/admin/AdminKit";
import { Button, Card, Pill } from "@/components/shared";
import { useDeleteProjectConfig, useProjectConfig, useSaveProjectConfig } from "@/hooks/useAuthoring";
import { useToast } from "@/hooks/use-toast";
import { MAX_PROJECT_SIZE_MB } from "@/types/authoring.type";

const fieldClass = "w-full rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-navy";

const parseExtensions = (raw: string): string[] =>
  [...new Set(raw.split(/[\s,;]+/).map((e) => e.trim().replace(/^\./, "").toLowerCase()).filter(Boolean))];

export function ProjectBriefCard({ formationId }: { formationId: string }) {
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useProjectConfig(formationId);
  const save = useSaveProjectConfig(formationId);
  const remove = useDeleteProjectConfig(formationId);

  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [extensions, setExtensions] = useState("");
  const [maxSize, setMaxSize] = useState("10");

  useEffect(() => {
    if (!data) return;
    setBrief(data.brief ?? "");
    setDeadline(data.deadlineLabel ?? "");
    setExtensions((data.acceptedExtensions ?? []).join(", "));
    setMaxSize(String(data.maxSizeMb ?? 10));
  }, [data]);

  const configured = !!data?.brief;
  const size = Number(maxSize);
  const exts = parseExtensions(extensions);
  const problem = !brief.trim()
    ? "La consigne est obligatoire."
    : exts.length === 0
      ? "Indiquez au moins une extension acceptée (ex. pdf, zip)."
      : !Number.isInteger(size) || size < 1 || size > MAX_PROJECT_SIZE_MB
        ? `La taille maximale doit être comprise entre 1 et ${MAX_PROJECT_SIZE_MB} Mo.`
        : null;

  const handleSave = () => {
    if (problem) return toast({ title: "Projet incomplet", description: problem, variant: "destructive" });
    save.mutate(
      { brief: brief.trim(), deadlineLabel: deadline.trim() || null, acceptedExtensions: exts, maxSizeMb: size },
      {
        onSuccess: () => toast({ title: "Projet final enregistré" }),
        onError: (e) => toast({ title: "Enregistrement impossible", description: errorMessage(e, "Réessayez dans un instant."), variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm("Supprimer la consigne ? Les apprenants ne verront plus de projet final.")) return;
    remove.mutate(undefined, {
      onSuccess: () => { setBrief(""); setDeadline(""); setExtensions(""); setMaxSize("10"); toast({ title: "Projet final supprimé" }); },
      onError: (e) => toast({ title: "Suppression impossible", description: errorMessage(e), variant: "destructive" }),
    });
  };

  return (
    <Card id="projet" radius="stat" className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold text-navy">Projet final</h2>
        <Pill variant={configured ? "success" : "neutral"}>{configured ? "Configuré" : "Aucun projet"}</Pill>
      </div>
      {isLoading && <Loader2 className="h-5 w-5 animate-spin text-ink-secondary" />}
      {isError && <p role="alert" className="text-sm text-error">{errorMessage(error, "Impossible de charger la consigne.")}</p>}
      {data && (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Consigne *
            <textarea rows={5} className={fieldClass} value={brief} onChange={(e) => setBrief(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Échéance (texte libre)
            <input className={fieldClass} placeholder="ex. 2 semaines après la fin de session" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Extensions acceptées *
            <input className={fieldClass} placeholder="pdf, zip, pbix" value={extensions} onChange={(e) => setExtensions(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
            Taille maximale par fichier (Mo)
            <input type="number" min={1} max={MAX_PROJECT_SIZE_MB} className={fieldClass} value={maxSize} onChange={(e) => setMaxSize(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="navy" shape="rounded" size="sm" disabled={save.isPending} onClick={handleSave}>
              {save.isPending ? <Loader2 className="animate-spin" /> : "Enregistrer le projet"}
            </Button>
            {configured && (
              <Button type="button" variant="outline" shape="rounded" size="sm" disabled={remove.isPending} onClick={handleDelete}>Supprimer</Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
