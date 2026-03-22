import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminBootcampService } from "@/services/Adminbootcampservice";
import { useFinancialSummary } from "@/hooks/usePayments";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Pencil, Trash2, Star, StarOff, Loader2, Calendar, Users, BookOpen, Plus,
    Wallet, TrendingUp, CircleDollarSign, Check, Clock, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
    BootcampSession, SessionStatus, SessionFormat,
    CreateSessionPayload, UpdateSessionPayload,
} from "@/types/bootcamp.type";

const STATUS_LABELS: Record<SessionStatus, string> = {
    DRAFT: "Brouillon", UPCOMING: "À venir", OPEN: "Inscriptions ouvertes",
    CLOSED: "Inscriptions fermées", IN_PROGRESS: "En cours",
    COMPLETED: "Terminée", CANCELLED: "Annulée",
};

const STATUS_BADGE: Record<SessionStatus, "default" | "secondary" | "outline" | "destructive"> = {
    DRAFT: "outline", UPCOMING: "secondary", OPEN: "default", CLOSED: "secondary",
    IN_PROGRESS: "default", COMPLETED: "secondary", CANCELLED: "destructive",
};

const FORMAT_LABELS: Record<SessionFormat, string> = {
    PRESENTIEL: "Présentiel", REMOTE: "À distance", HYBRID: "Hybride",
};

interface SessionWithBootcamp extends BootcampSession {
    bootcampTitle?: string;
}

type SessionFormState = {
    bootcampId: string; sessionName: string; cohortNumber: string; year: string;
    startDate: string; endDate: string; registrationDeadline: string;
    maxParticipants: string; status: SessionStatus; format: SessionFormat;
    location: string; priceOverride: string; earlyBirdPrice: string;
    earlyBirdDeadline: string; isFeatured: boolean; published: boolean;
};

const defaultForm = (bootcampId = ""): SessionFormState => ({
    bootcampId, sessionName: "", cohortNumber: "",
    year: new Date().getFullYear().toString(), startDate: "", endDate: "",
    registrationDeadline: "", maxParticipants: "20", status: "UPCOMING",
    format: "PRESENTIEL", location: "Dakar, Sénégal", priceOverride: "",
    earlyBirdPrice: "", earlyBirdDeadline: "", isFeatured: false, published: true,
});

function sessionToForm(s: SessionWithBootcamp): SessionFormState {
    return {
        bootcampId: s.bootcampId, sessionName: s.sessionName ?? "",
        cohortNumber: s.cohortNumber?.toString() ?? "",
        year: s.year?.toString() ?? new Date().getFullYear().toString(),
        startDate: s.startDate ?? "", endDate: s.endDate ?? "",
        registrationDeadline: s.registrationDeadline ?? "",
        maxParticipants: s.maxParticipants.toString(), status: s.status,
        format: s.format, location: s.location ?? "", priceOverride: s.price ?? "",
        earlyBirdPrice: s.earlyBirdPrice ?? "", earlyBirdDeadline: s.earlyBirdDeadline ?? "",
        isFeatured: s.isFeatured, published: s.published,
    };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFcfa(amount: number | null | undefined): string {
    if (amount == null) return "—";
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

// ─── Modale resume financier ─────────────────────────────────────────────────

function FinancialSummaryModal({ sessionId, sessionName, open, onClose }: {
    sessionId: string; sessionName: string; open: boolean; onClose: () => void;
}) {
    const { data, isLoading } = useFinancialSummary(open ? sessionId : "");

    // data is ApiResponse<SessionFinancialSummary>
    const summary = data?.data;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-primary" />
                        Finances — {sessionName}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : !summary ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucune donnee disponible</p>
                ) : (
                    <div className="space-y-6 pt-2">
                        {/* Barre de progression globale */}
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium text-foreground">Taux de recouvrement</span>
                                <span className="font-bold text-lg text-foreground">{summary.collectionRate}%</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        summary.collectionRate >= 100 ? "bg-emerald-500" :
                                        summary.collectionRate >= 50 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${Math.min(100, summary.collectionRate)}%` }}
                                />
                            </div>
                        </div>

                        {/* KPIs financiers */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs text-muted-foreground font-medium">Objectif</span>
                                </div>
                                <p className="text-lg font-bold text-foreground">{formatFcfa(summary.revenueTarget)}</p>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Wallet className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs text-muted-foreground font-medium">Encaisse</span>
                                </div>
                                <p className="text-lg font-bold text-emerald-600">{formatFcfa(summary.totalCollected)}</p>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs text-muted-foreground font-medium">Reste a recouvrer</span>
                                </div>
                                <p className="text-lg font-bold text-amber-600">{formatFcfa(summary.remainingToCollect)}</p>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-4 w-4 text-violet-600" />
                                    <span className="text-xs text-muted-foreground font-medium">Inscriptions</span>
                                </div>
                                <p className="text-lg font-bold text-foreground">{summary.totalRegistrations}</p>
                            </div>
                        </div>

                        {/* Repartition statuts paiement */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Repartition des paiements
                            </p>
                            <div className="flex gap-3">
                                <div className="flex-1 text-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                                    <Check className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{summary.paidCount}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Payes</p>
                                </div>
                                <div className="flex-1 text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                    <Clock className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{summary.partialCount}</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400">Partiels</p>
                                </div>
                                <div className="flex-1 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <X className="h-4 w-4 text-red-600 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{summary.unpaidCount}</p>
                                    <p className="text-xs text-red-600 dark:text-red-400">Non payes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function AdminAllSessions() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();

    const [statusFilter, setStatusFilter] = useState<SessionStatus | "ALL">("ALL");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<SessionWithBootcamp | null>(null);
    const [form, setForm] = useState<SessionFormState>(defaultForm());
    const [financialSessionId, setFinancialSessionId] = useState<string | null>(null);
    const [financialSessionName, setFinancialSessionName] = useState("");

    const { data: bootcamps, isLoading: loadingBootcamps } = useQuery({
        queryKey: ["admin", "bootcamps"],
        queryFn: adminBootcampService.list,
    });

    const { data: allSessions, isLoading: loadingSessions } = useQuery({
        queryKey: ["admin", "allSessions", bootcamps?.map((b) => b.id)],
        queryFn: async (): Promise<SessionWithBootcamp[]> => {
            if (!bootcamps?.length) return [];
            const results = await Promise.all(
                bootcamps.map((b) =>
                    adminBootcampService.listSessions(b.id)
                        .then((sessions) => sessions.map((s) => ({ ...s, bootcampTitle: b.title })))
                )
            );
            return results.flat();
        },
        enabled: !!bootcamps?.length,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "allSessions"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "bootcamps"] });
    };

    const createMutation = useMutation({
        mutationFn: ({ bootcampId, payload }: { bootcampId: string; payload: CreateSessionPayload }) =>
            adminBootcampService.createSession(bootcampId, payload),
        onSuccess: () => { invalidate(); closeDialog(); toast({ title: "Session créée" }); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionPayload }) =>
            adminBootcampService.updateSession(id, payload),
        onSuccess: () => { invalidate(); closeDialog(); toast({ title: "Session mise à jour" }); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminBootcampService.deleteSession(id),
        onSuccess: () => { invalidate(); toast({ title: "Session supprimée" }); },
        onError: () => toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" }),
    });

    const featuredMutation = useMutation({
        mutationFn: (id: string) => adminBootcampService.toggleSessionFeatured(id),
        onSuccess: () => invalidate(),
    });

    const openCreateDialog = () => {
        setEditingSession(null);
        setForm(defaultForm(searchParams.get("bootcamp") ?? bootcamps?.[0]?.id ?? ""));
        setDialogOpen(true);
    };

    const openEditDialog = (session: SessionWithBootcamp) => {
        setEditingSession(session);
        setForm(sessionToForm(session));
        setDialogOpen(true);
    };

    const closeDialog = () => { setDialogOpen(false); setEditingSession(null); };

    const set = (field: keyof SessionFormState, value: unknown) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        const payload: CreateSessionPayload = {
            sessionName: form.sessionName || undefined,
            cohortNumber: form.cohortNumber ? parseInt(form.cohortNumber) : undefined,
            year: form.year ? parseInt(form.year) : undefined,
            startDate: form.startDate || undefined, endDate: form.endDate || undefined,
            registrationDeadline: form.registrationDeadline || undefined,
            maxParticipants: parseInt(form.maxParticipants) || 20,
            status: form.status, format: form.format,
            location: form.location || undefined,
            priceOverride: form.priceOverride || undefined,
            earlyBirdPrice: form.earlyBirdPrice || undefined,
            earlyBirdDeadline: form.earlyBirdDeadline || undefined,
            isFeatured: form.isFeatured, published: form.published,
        };

        if (editingSession) {
            updateMutation.mutate({ id: editingSession.id, payload });
        } else {
            if (!form.bootcampId) {
                toast({ title: "Sélectionnez un bootcamp", variant: "destructive" });
                return;
            }
            createMutation.mutate({ bootcampId: form.bootcampId, payload });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const isLoading = loadingBootcamps || loadingSessions;
    const sessions = allSessions ?? [];
    const filtered = statusFilter === "ALL" ? sessions : sessions.filter((s) => s.status === statusFilter);
    const sorted = [...filtered].sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return (
        <AdminLayout title="Sessions bootcamp">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                        {sessions.length} session{sessions.length > 1 ? "s" : ""} au total
                    </p>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SessionStatus | "ALL")}>
                        <SelectTrigger className="w-52">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous les statuts</SelectItem>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={openCreateDialog} disabled={!bootcamps?.length}>
                    <Plus className="h-4 w-4" />
                    Nouvelle session
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : !sessions.length ? (
                <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Aucune session</p>
                    <p className="text-muted-foreground text-sm mb-6">
                        Créez d'abord un bootcamp, puis ajoutez des sessions.
                    </p>
                    <Button asChild variant="outline">
                        <Link to="/admin/bootcamps"><BookOpen className="h-4 w-4" />Gérer les bootcamps</Link>
                    </Button>
                </div>
            ) : !sorted.length ? (
                <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card">
                    <p className="text-foreground font-medium">Aucune session avec ce statut</p>
                    <Button variant="ghost" className="mt-3 text-sm" onClick={() => setStatusFilter("ALL")}>
                        Voir toutes les sessions
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                            <button
                                onClick={() => featuredMutation.mutate(session.id)}
                                className={`flex-shrink-0 transition-colors ${session.isFeatured ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                                title={session.isFeatured ? "Retirer la mise en avant" : "Mettre en avant"}
                            >
                                {session.isFeatured ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="font-semibold text-foreground">
                                        {session.sessionName ?? `Cohorte ${session.cohortNumber ?? "?"}`}
                                    </p>
                                    <Badge variant={STATUS_BADGE[session.status]} className="text-xs">
                                        {STATUS_LABELS[session.status]}
                                    </Badge>
                                    {!session.published && <Badge variant="outline" className="text-xs">Brouillon</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                    {session.bootcampTitle && (
                                        <span className="flex items-center gap-1 text-primary/80 font-medium">
                      <BookOpen className="h-3 w-3" />{session.bootcampTitle}
                    </span>
                                    )}
                                    {session.startDate && (
                                        <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                                            {new Date(session.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                            {session.endDate && ` → ${new Date(session.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
                    </span>
                                    )}
                                    <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                                        {session.currentParticipants}/{session.maxParticipants}
                                        {session.isFull && <span className="text-destructive font-medium ml-1">· Complet</span>}
                  </span>
                                    {session.price && <span className="font-medium text-foreground">{session.price}</span>}
                                    <span>{FORMAT_LABELS[session.format]}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                    variant="ghost" size="icon" className="h-8 w-8"
                                    onClick={() => { setFinancialSessionId(session.id); setFinancialSessionName(session.sessionName ?? `Cohorte ${session.cohortNumber ?? "?"}`); }}
                                    title="Voir les finances"
                                >
                                    <CircleDollarSign className="h-4 w-4 text-emerald-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(session)}>
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                    variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10"
                                    onClick={() => { if (confirm(`Supprimer cette session ?`)) deleteMutation.mutate(session.id); }}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSession ? "Modifier la session" : "Nouvelle session"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {!editingSession && (
                            <div className="space-y-1.5">
                                <Label>Bootcamp *</Label>
                                <Select value={form.bootcampId} onValueChange={(v) => set("bootcampId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Choisir un bootcamp" /></SelectTrigger>
                                    <SelectContent>
                                        {bootcamps?.map((b) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Nom de la session</Label>
                                <Input placeholder="ex: Cohorte 5 — Mars 2025" value={form.sessionName} onChange={(e) => set("sessionName", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>N° de cohorte</Label>
                                <Input type="number" min={1} placeholder="ex: 5" value={form.cohortNumber} onChange={(e) => set("cohortNumber", e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Date de début</Label>
                                <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Date de fin</Label>
                                <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Limite d'inscription</Label>
                            <Input type="date" value={form.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Statut</Label>
                                <Select value={form.status} onValueChange={(v) => set("status", v as SessionStatus)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Format</Label>
                                <Select value={form.format} onValueChange={(v) => set("format", v as SessionFormat)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(FORMAT_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Participants max</Label>
                                <Input type="number" min={1} value={form.maxParticipants} onChange={(e) => set("maxParticipants", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Lieu</Label>
                                <Input placeholder="ex: Dakar, Sénégal" value={form.location} onChange={(e) => set("location", e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Prix spécifique</Label>
                                <Input placeholder="ex: 400 000 FCFA" value={form.priceOverride} onChange={(e) => set("priceOverride", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Prix early bird</Label>
                                <Input placeholder="ex: 350 000 FCFA" value={form.earlyBirdPrice} onChange={(e) => set("earlyBirdPrice", e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Mise en avant</p>
                                    <p className="text-xs text-muted-foreground">Affiché comme "Prochaine session" sur la card</p>
                                </div>
                                <Switch checked={form.isFeatured} onCheckedChange={(v) => set("isFeatured", v)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Publiée</p>
                                    <p className="text-xs text-muted-foreground">Visible sur le site public</p>
                                </div>
                                <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>Annuler</Button>
                        <Button onClick={handleSubmit} disabled={isPending}>
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editingSession ? "Enregistrer" : "Créer la session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modale resume financier */}
            {financialSessionId && (
                <FinancialSummaryModal
                    sessionId={financialSessionId}
                    sessionName={financialSessionName}
                    open={!!financialSessionId}
                    onClose={() => setFinancialSessionId(null)}
                />
            )}
        </AdminLayout>
    );
}
