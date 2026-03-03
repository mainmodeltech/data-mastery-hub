import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminBootcampService } from "@/services/Adminbootcampservice.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    Star,
    StarOff,
    Loader2,
    Calendar,
    Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
    BootcampSession,
    CreateSessionPayload,
    UpdateSessionPayload,
    SessionStatus,
    SessionFormat,
} from "@/types/bootcamp.type";

const STATUS_LABELS: Record<SessionStatus, string> = {
    DRAFT: "Brouillon",
    UPCOMING: "À venir",
    OPEN: "Inscriptions ouvertes",
    CLOSED: "Inscriptions fermées",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    CANCELLED: "Annulée",
};

const STATUS_COLORS: Record<SessionStatus, string> = {
    DRAFT: "outline",
    UPCOMING: "secondary",
    OPEN: "default",
    CLOSED: "secondary",
    IN_PROGRESS: "default",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
};

const FORMAT_LABELS: Record<SessionFormat, string> = {
    PRESENTIEL: "Présentiel",
    REMOTE: "À distance",
    HYBRID: "Hybride",
};

type SessionFormState = {
    sessionName: string;
    cohortNumber: string;
    year: string;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    maxParticipants: string;
    status: SessionStatus;
    format: SessionFormat;
    location: string;
    priceOverride: string;
    earlyBirdPrice: string;
    earlyBirdDeadline: string;
    isFeatured: boolean;
    published: boolean;
};

const defaultSessionForm: SessionFormState = {
    sessionName: "",
    cohortNumber: "",
    year: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxParticipants: "20",
    status: "UPCOMING",
    format: "PRESENTIEL",
    location: "Dakar, Sénégal",
    priceOverride: "",
    earlyBirdPrice: "",
    earlyBirdDeadline: "",
    isFeatured: false,
    published: true,
};

function sessionToForm(s: BootcampSession): SessionFormState {
    return {
        sessionName: s.sessionName ?? "",
        cohortNumber: s.cohortNumber?.toString() ?? "",
        year: s.year?.toString() ?? new Date().getFullYear().toString(),
        startDate: s.startDate ?? "",
        endDate: s.endDate ?? "",
        registrationDeadline: s.registrationDeadline ?? "",
        maxParticipants: s.maxParticipants.toString(),
        status: s.status,
        format: s.format,
        location: s.location ?? "",
        priceOverride: s.price ?? "",
        earlyBirdPrice: s.earlyBirdPrice ?? "",
        earlyBirdDeadline: s.earlyBirdDeadline ?? "",
        isFeatured: s.isFeatured,
        published: s.published,
    };
}

export default function BootcampSessions() {
    const { id: bootcampId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<BootcampSession | null>(null);
    const [form, setForm] = useState<SessionFormState>(defaultSessionForm);

    const { data: bootcamp } = useQuery({
        queryKey: ["admin", "bootcamps", bootcampId],
        queryFn: () => adminBootcampService.get(bootcampId!),
        enabled: !!bootcampId,
    });

    const { data: sessions, isLoading } = useQuery({
        queryKey: ["admin", "bootcamps", bootcampId, "sessions"],
        queryFn: () => adminBootcampService.listSessions(bootcampId!),
        enabled: !!bootcampId,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "bootcamps", bootcampId, "sessions"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "bootcamps"] });
    };

    const createMutation = useMutation({
        mutationFn: (payload: CreateSessionPayload) =>
            adminBootcampService.createSession(bootcampId!, payload),
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
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });

    const featuredMutation = useMutation({
        mutationFn: (id: string) => adminBootcampService.toggleSessionFeatured(id),
        onSuccess: () => invalidate(),
    });

    const openCreateDialog = () => {
        setEditingSession(null);
        setForm(defaultSessionForm);
        setDialogOpen(true);
    };

    const openEditDialog = (session: BootcampSession) => {
        setEditingSession(session);
        setForm(sessionToForm(session));
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingSession(null);
    };

    const set = (field: keyof SessionFormState, value: unknown) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        const payload: CreateSessionPayload = {
            sessionName: form.sessionName || undefined,
            cohortNumber: form.cohortNumber ? parseInt(form.cohortNumber) : undefined,
            year: form.year ? parseInt(form.year) : undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            registrationDeadline: form.registrationDeadline || undefined,
            maxParticipants: parseInt(form.maxParticipants) || 20,
            status: form.status,
            format: form.format,
            location: form.location || undefined,
            priceOverride: form.priceOverride || undefined,
            earlyBirdPrice: form.earlyBirdPrice || undefined,
            earlyBirdDeadline: form.earlyBirdDeadline || undefined,
            isFeatured: form.isFeatured,
            published: form.published,
        };

        if (editingSession) {
            updateMutation.mutate({ id: editingSession.id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/bootcamps/${bootcampId}/edit`)}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="font-heading text-2xl font-bold text-foreground">
                        Sessions — {bootcamp?.title ?? "..."}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Planifiez les cohortes de ce bootcamp
                    </p>
                </div>
                <Button className="ml-auto" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4" />
                    Nouvelle session
                </Button>
            </div>

            {/* Sessions list */}
            <div className="mt-6">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !sessions?.length ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-xl">
                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <p className="text-foreground font-medium mb-2">Aucune session planifiée</p>
                        <p className="text-muted-foreground text-sm mb-6">
                            Ajoutez une session pour commencer à recevoir des inscriptions.
                        </p>
                        <Button variant="outline" onClick={openCreateDialog}>
                            <Plus className="h-4 w-4" />
                            Créer une session
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
                            >
                                {/* Indicateur mise en avant */}
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={() => featuredMutation.mutate(session.id)}
                                        className={`transition-colors ${session.isFeatured ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
                                        title={session.isFeatured ? "Retirer la mise en avant" : "Mettre en avant"}
                                    >
                                        {session.isFeatured ? (
                                            <Star className="h-5 w-5 fill-current" />
                                        ) : (
                                            <StarOff className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="font-semibold text-foreground">
                                            {session.sessionName ?? `Cohorte ${session.cohortNumber ?? "?"}`}
                                        </p>
                                        <Badge variant={STATUS_COLORS[session.status] as "default" | "secondary" | "outline" | "destructive"} className="text-xs">
                                            {STATUS_LABELS[session.status]}
                                        </Badge>
                                        {!session.published && (
                                            <Badge variant="outline" className="text-xs">Brouillon</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                        {session.startDate && (
                                            <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                                                {new Date(session.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                                {session.endDate && ` → ${new Date(session.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
                      </span>
                                        )}
                                        <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                                            {session.currentParticipants}/{session.maxParticipants} participants
                    </span>
                                        {session.price && (
                                            <span className="font-medium text-foreground">{session.price}</span>
                                        )}
                                        <span>{FORMAT_LABELS[session.format]}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEditDialog(session)}
                                    >
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-destructive/10"
                                        onClick={() => {
                                            if (confirm("Supprimer cette session ?")) {
                                                deleteMutation.mutate(session.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog create/edit session */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSession ? "Modifier la session" : "Nouvelle session"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Nom de la session</Label>
                                <Input
                                    placeholder="ex: Cohorte 5 — Janvier 2025"
                                    value={form.sessionName}
                                    onChange={(e) => set("sessionName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>N° de cohorte</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="ex: 5"
                                    value={form.cohortNumber}
                                    onChange={(e) => set("cohortNumber", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Date de début</Label>
                                <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => set("startDate", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Date de fin</Label>
                                <Input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => set("endDate", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Limite d'inscription</Label>
                            <Input
                                type="date"
                                value={form.registrationDeadline}
                                onChange={(e) => set("registrationDeadline", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Statut</Label>
                                <Select value={form.status} onValueChange={(v) => set("status", v as SessionStatus)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Format</Label>
                                <Select value={form.format} onValueChange={(v) => set("format", v as SessionFormat)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Participants max</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={form.maxParticipants}
                                    onChange={(e) => set("maxParticipants", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Lieu</Label>
                                <Input
                                    placeholder="ex: Dakar, Sénégal"
                                    value={form.location}
                                    onChange={(e) => set("location", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Prix spécifique (optionnel)</Label>
                                <Input
                                    placeholder="ex: 400 000 FCFA"
                                    value={form.priceOverride}
                                    onChange={(e) => set("priceOverride", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Prix early bird</Label>
                                <Input
                                    placeholder="ex: 350 000 FCFA"
                                    value={form.earlyBirdPrice}
                                    onChange={(e) => set("earlyBirdPrice", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Mise en avant</p>
                                    <p className="text-xs text-muted-foreground">
                                        Affiché comme "Prochaine session" sur la card
                                    </p>
                                </div>
                                <Switch
                                    checked={form.isFeatured}
                                    onCheckedChange={(v) => set("isFeatured", v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Publiée</p>
                                    <p className="text-xs text-muted-foreground">Visible sur le site public</p>
                                </div>
                                <Switch
                                    checked={form.published}
                                    onCheckedChange={(v) => set("published", v)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog}>
                            Annuler
                        </Button>
                        <Button onClick={handleSubmit} disabled={isPending}>
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editingSession ? "Enregistrer" : "Créer la session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
