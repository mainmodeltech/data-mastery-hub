/**
 * AdminPromoCodes.tsx — codes de parrainage (design system).
 * Une remise de parrainage ne dépasse jamais 30 % (règle serveur). Un code plus ancien au-dessus du plafond est signalé,
 * refusé aux candidats et doit être corrigé avant toute autre modification.
 */
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, Copy, Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog, EmptyState, ErrorNotice, errorMessage, Field, inputClass, SwitchRow } from "@/components/admin/AdminKit";
import { Button, Card, Pill, ProgressBar } from "@/components/shared";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useCreatePromoCode, useDeletePromoCode, usePromoCodes, useTogglePromoCodeActive, useUpdatePromoCode,
} from "@/hooks/usePromoCodes";
import { cn } from "@/lib/utils";
import { MAX_PROMO_DISCOUNT, type CreatePromoCodeDTO, type PromoCode } from "@/types/promo-code.type";

type Filter = "all" | "active" | "inactive" | "expired" | "full" | "fix";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "active", label: "Actifs" },
  { key: "inactive", label: "Inactifs" },
  { key: "expired", label: "Expirés" },
  { key: "full", label: "Épuisés" },
  { key: "fix", label: "À corriger" },
];

const day = (iso: string | null) => (iso ? format(parseISO(iso), "d MMM yyyy", { locale: fr }) : "—");

function isExpired(c: PromoCode) { return !!c.expiresAt && new Date(c.expiresAt) < new Date(); }
function isFull(c: PromoCode) { return c.maxUses != null && c.usageCount >= c.maxUses; }
function isOver(c: PromoCode) { return c.discountPercent > MAX_PROMO_DISCOUNT; }

function statusOf(c: PromoCode): { label: string; variant: "success" | "warning" | "error" | "neutral" } {
  if (isOver(c)) return { label: "À corriger", variant: "error" };
  if (!c.isActive) return { label: "Inactif", variant: "neutral" };
  if (isExpired(c)) return { label: "Expiré", variant: "error" };
  if (isFull(c)) return { label: "Épuisé", variant: "warning" };
  return { label: "Actif", variant: "success" };
}

interface FormState {
  code: string; description: string; referrerName: string; referrerEmail: string; referrerPhone: string;
  discountPercent: string; maxUses: string; expiresAt: string; isActive: boolean;
}

const EMPTY: FormState = {
  code: "", description: "", referrerName: "", referrerEmail: "", referrerPhone: "",
  discountPercent: "10", maxUses: "", expiresAt: "", isActive: true,
};

function toForm(c: PromoCode): FormState {
  return {
    code: c.code, description: c.description ?? "", referrerName: c.referrerName, referrerEmail: c.referrerEmail ?? "",
    referrerPhone: c.referrerPhone ?? "", discountPercent: String(c.discountPercent), maxUses: c.maxUses?.toString() ?? "",
    expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : "", isActive: c.isActive,
  };
}

function PromoDialog({ code, onClose }: { code: PromoCode | null; onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreatePromoCode();
  const update = useUpdatePromoCode();
  const [form, setForm] = useState<FormState>(code ? toForm(code) : EMPTY);
  const [error, setError] = useState("");
  const pending = create.isPending || update.isPending;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const percent = Number(form.discountPercent);
    if (!/^[A-Z0-9_-]+$/.test(form.code.trim().toUpperCase())) return setError("Le code ne contient que des lettres, chiffres, tirets et underscores.");
    if (!form.referrerName.trim()) return setError("Le nom du parrain est obligatoire.");
    if (!Number.isInteger(percent) || percent < 0 || percent > MAX_PROMO_DISCOUNT) {
      return setError(`La remise doit être un entier entre 0 et ${MAX_PROMO_DISCOUNT} %.`);
    }
    if (form.maxUses && (!Number.isInteger(Number(form.maxUses)) || Number(form.maxUses) < 1)) return setError("Le nombre d'utilisations doit être un entier positif.");

    const payload: CreatePromoCodeDTO = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      referrerName: form.referrerName.trim(),
      referrerEmail: form.referrerEmail.trim() || null,
      referrerPhone: form.referrerPhone.trim() || null,
      discountPercent: percent,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };
    try {
      if (code) {
        await update.mutateAsync({ id: code.id, data: payload });
        toast({ title: "Code mis à jour", description: payload.code });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "Code créé", description: payload.code });
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Enregistrement impossible."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-callout">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-navy">{code ? `Modifier ${code.code}` : "Nouveau code de parrainage"}</DialogTitle>
          <DialogDescription className="text-ink-secondary">
            Un candidat qui saisit ce code obtient la remise sur sa formation. Remise maximale : {MAX_PROMO_DISCOUNT} %.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {code && isOver(code) && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-error-bg px-4 py-3 text-sm text-error">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Ce code accorde {code.discountPercent} % : il est refusé aux candidats tant que la remise n'est pas ramenée à {MAX_PROMO_DISCOUNT} % ou moins.
            </p>
          )}
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code *" htmlFor="pc-code">
              <input id="pc-code" required className={cn(inputClass, "uppercase")} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="AWA2026" />
            </Field>
            <Field label={`Remise (%) * — max ${MAX_PROMO_DISCOUNT}`} htmlFor="pc-pct">
              <input id="pc-pct" type="number" required min={0} max={MAX_PROMO_DISCOUNT} step={1} className={inputClass} value={form.discountPercent} onChange={(e) => set("discountPercent", e.target.value)} />
            </Field>
          </div>
          <Field label="Parrain *" htmlFor="pc-ref"><input id="pc-ref" required className={inputClass} value={form.referrerName} onChange={(e) => set("referrerName", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-mail du parrain" htmlFor="pc-mail"><input id="pc-mail" type="email" className={inputClass} value={form.referrerEmail} onChange={(e) => set("referrerEmail", e.target.value)} /></Field>
            <Field label="Téléphone du parrain" htmlFor="pc-tel"><input id="pc-tel" className={inputClass} value={form.referrerPhone} onChange={(e) => set("referrerPhone", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Utilisations maximum" htmlFor="pc-max" hint="Vide : illimité."><input id="pc-max" type="number" min={1} className={inputClass} value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} /></Field>
            <Field label="Expire le" htmlFor="pc-exp" hint="Vide : sans expiration."><input id="pc-exp" type="datetime-local" className={inputClass} value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} /></Field>
          </div>
          <Field label="Note interne" htmlFor="pc-desc"><textarea id="pc-desc" rows={2} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <SwitchRow label="Code actif" description="Désactivé : refusé aux candidats." checked={form.isActive} onChange={(v) => set("isActive", v)} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" shape="rounded" disabled={pending} onClick={onClose}>Annuler</Button>
            <Button type="submit" shape="rounded" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : code ? "Enregistrer" : "Créer le code"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPromoCodes() {
  const { can } = useAuth();
  const canManage = can("PROMO_MANAGE");
  const { toast } = useToast();
  const { data, isLoading, isError } = usePromoCodes(0, 200);
  const toggle = useTogglePromoCodeActive();
  const remove = useDeletePromoCode();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<PromoCode | null>(null);

  const codes = useMemo(() => data?.content ?? [], [data]);
  const total = data?.totalElements ?? codes.length;
  const toFix = codes.filter(isOver);
  const usesTotal = codes.reduce((s, c) => s + c.usageCount, 0);

  const counts = useMemo<Record<Filter, number>>(() => ({
    all: codes.length,
    active: codes.filter((c) => !isOver(c) && c.isActive && !isExpired(c) && !isFull(c)).length,
    inactive: codes.filter((c) => !c.isActive).length,
    expired: codes.filter(isExpired).length,
    full: codes.filter(isFull).length,
    fix: codes.filter(isOver).length,
  }), [codes]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return codes.filter((c) => {
      if (q && !`${c.code} ${c.referrerName} ${c.referrerEmail ?? ""} ${c.description ?? ""}`.toLowerCase().includes(q)) return false;
      switch (filter) {
        case "active": return !isOver(c) && c.isActive && !isExpired(c) && !isFull(c);
        case "inactive": return !c.isActive;
        case "expired": return isExpired(c);
        case "full": return isFull(c);
        case "fix": return isOver(c);
        default: return true;
      }
    });
  }, [codes, filter, search]);

  const copy = async (c: PromoCode) => {
    try { await navigator.clipboard.writeText(c.code); toast({ title: "Code copié", description: c.code }); } catch { /* presse-papier indisponible */ }
  };

  return (
    <AdminLayout
      title="Codes de parrainage"
      description={`${total} code${total > 1 ? "s" : ""} · ${usesTotal} utilisation${usesTotal > 1 ? "s" : ""}`}
      actions={canManage ? <Button type="button" size="sm" shape="rounded" onClick={() => setCreating(true)}><Plus />Nouveau code</Button> : undefined}
    >
      <div className="flex flex-col gap-5">
        {toFix.length > 0 && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-card bg-error-bg px-5 py-4 text-sm text-error">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <strong>{toFix.length} code{toFix.length > 1 ? "s" : ""} dépasse{toFix.length > 1 ? "nt" : ""} {MAX_PROMO_DISCOUNT} %</strong> et {toFix.length > 1 ? "sont refusés" : "est refusé"} aux candidats
              tant que {toFix.length > 1 ? "leurs remises ne sont pas corrigées" : "sa remise n'est pas corrigée"} : {toFix.map((c) => c.code).join(", ")}.
            </span>
            <Button type="button" size="sm" shape="rounded" variant="outline" onClick={() => setFilter("fix")}>Voir</Button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer les codes">
          {FILTERS.map((f) => (
            <Button key={f.key} type="button" size="sm" shape="pill" variant={filter === f.key ? "navy" : "outline"} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label} <span className="ml-1 opacity-70">{counts[f.key]}</span>
            </Button>
          ))}
          <span className="flex-1" />
          <div className="flex items-center gap-2 rounded-[10px] border border-[#D6CEC0] bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-ink-secondary" />
            <input type="search" aria-label="Rechercher un code" placeholder="Code, parrain, e-mail…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-52 bg-transparent text-sm outline-none" />
          </div>
        </div>

        {isLoading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-secondary" />}
        {isError && <ErrorNotice>Impossible de charger les codes. Vérifiez la connexion au serveur puis rechargez la page.</ErrorNotice>}
        {!isLoading && !isError && visible.length === 0 && (
          <EmptyState title={codes.length === 0 ? "Aucun code de parrainage" : "Aucun code ne correspond"} text={codes.length === 0 ? "Créez un code pour offrir une remise à un candidat recommandé." : "Modifiez le filtre ou la recherche."} />
        )}

        {visible.length > 0 && (
          <Card radius="stat" className="overflow-hidden border border-[#E7E0D4] p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[#E7E0D4] bg-app-bg text-left text-xs text-ink-secondary">
                    <th scope="col" className="px-4 py-3 font-semibold">Code</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Parrain</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Remise</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Utilisations</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Expiration</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                    {canManage && <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c) => {
                    const st = statusOf(c);
                    return (
                      <tr key={c.id} className="border-b border-[#E7E0D4] last:border-b-0">
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => void copy(c)} className="inline-flex items-center gap-1.5 rounded-lg bg-info-bg px-2.5 py-1 font-mono text-[0.8125rem] font-bold text-navy hover:bg-[#D8E4F0]" title="Copier le code">
                            {c.code}<Copy className="h-3 w-3" aria-hidden="true" />
                          </button>
                          {c.description && <p className="mt-1 max-w-[220px] truncate text-xs text-ink-secondary" title={c.description}>{c.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-ink">{c.referrerName}</div>
                          <div className="text-xs text-ink-secondary">{c.referrerEmail ?? c.referrerPhone ?? ""}</div>
                        </td>
                        <td className={cn("px-4 py-3 text-right font-heading text-base font-extrabold", isOver(c) ? "text-error" : "text-navy")}>
                          {c.discountPercent} %
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex w-36 flex-col gap-1">
                            <span className="text-xs text-ink-secondary">{c.usageCount}{c.maxUses != null ? ` / ${c.maxUses}` : " · illimité"}</span>
                            {c.maxUses != null && <ProgressBar value={c.usageCount} max={c.maxUses} />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-secondary">{day(c.expiresAt)}</td>
                        <td className="px-4 py-3"><Pill variant={st.variant}>{st.label}</Pill></td>
                        {canManage && (
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              <Button type="button" size="sm" shape="rounded" variant="outline" disabled={toggle.isPending || isOver(c)} aria-label={c.isActive ? `Désactiver ${c.code}` : `Activer ${c.code}`} title={c.isActive ? "Désactiver" : "Activer"}
                                onClick={() => toggle.mutate(c.id)}>{c.isActive ? <EyeOff /> : <Eye />}</Button>
                              <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Modifier ${c.code}`} onClick={() => setEditing(c)}><Pencil /></Button>
                              <Button type="button" size="sm" shape="rounded" variant="outline" aria-label={`Supprimer ${c.code}`} onClick={() => setDeleting(c)}><Trash2 /></Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {total > codes.length && <p className="text-xs text-ink-secondary">{codes.length} codes affichés sur {total}.</p>}
      </div>

      {(creating || editing) && <PromoDialog code={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Supprimer le code ${deleting?.code ?? ""} ?`}
        description="Les inscriptions déjà remisées avec ce code ne changent pas ; il ne pourra plus être utilisé."
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast({ title: "Code supprimé", description: deleting.code });
        }}
      />
    </AdminLayout>
  );
}
