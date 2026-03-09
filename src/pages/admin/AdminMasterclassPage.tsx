// src/pages/admin/AdminMasterclassPage.tsx

import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import {
    Search,
    Users,
    MailCheck,
    MailX,
    GraduationCap,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    Mail,
    Phone,
    Building2,
    User,
    Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMasterclassRegistrations } from "@/hooks/useMasterclassRegistrations";
import {MasterclassRegistration} from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const MASTERCLASS_ID = "power-bi-dashboard-2026-03-20";
const PAGE_SIZE      = 20;

// ─── Profil config ────────────────────────────────────────────────────────────

const PROFILE_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    "Étudiant(e)":      { label: "Étudiant(e)",      className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",    icon: GraduationCap },
    "Professionnel":    { label: "Professionnel",    className: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300", icon: Briefcase },
    "Entrepreneur":     { label: "Entrepreneur",     className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",  icon: Briefcase },
    "En reconversion":  { label: "En reconversion",  className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300", icon: User },
    "Autre":            { label: "Autre",            className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",  icon: User },
};

function getProfileConfig(profile: string | null) {
    if (!profile) return PROFILE_CONFIG["Autre"];
    return PROFILE_CONFIG[profile] ?? PROFILE_CONFIG["Autre"];
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
                     label,
                     value,
                     icon: Icon,
                     accent,
                     sub,
                 }: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    accent: string;
    sub?: string;
}) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-2xl font-black leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
                {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function RegistrationDetailDialog({
                                      reg,
                                      onClose,
                                  }: {
    reg: MasterclassRegistration | null;
    onClose: () => void;
}) {
    if (!reg) return null;
    const profile = getProfileConfig(reg.profile);
    const ProfileIcon = profile.icon;

    return (
        <Dialog open={!!reg} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {reg.firstName} {reg.lastName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Badge profil */}
                    <Badge variant="outline" className={`${profile.className} gap-1.5`}>
                        <ProfileIcon className="h-3 w-3" />
                        {profile.label}
                    </Badge>

                    {/* Infos */}
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <a href={`mailto:${reg.email}`} className="text-primary hover:underline truncate">
                                {reg.email}
                            </a>
                        </div>
                        {reg.phone && (
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{reg.phone}</span>
                            </div>
                        )}
                        {reg.company && (
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{reg.company}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>Inscrit le {format(new Date(reg.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            {reg.emailSent ? (
                                <><MailCheck className="h-4 w-4 text-emerald-500 shrink-0" /><span className="text-emerald-600 dark:text-emerald-400">Email de confirmation envoyé</span></>
                            ) : (
                                <><MailX className="h-4 w-4 text-rose-500 shrink-0" /><span className="text-rose-500">Email non envoyé</span></>
                            )}
                        </div>
                    </div>

                    <Button className="w-full" asChild>
                        <a href={`mailto:${reg.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer un email
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
                        page,
                        totalPages,
                        totalElements,
                        size,
                        onChange,
                    }: {
    page: number;
    totalPages: number;
    totalElements: number;
    size: number;
    onChange: (p: number) => void;
}) {
    const from = page * size + 1;
    const to   = Math.min((page + 1) * size, totalElements);

    return (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
      <span>
        {from}–{to} sur {totalElements} inscription{totalElements !== 1 ? "s" : ""}
      </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page === 0}
                    onClick={() => onChange(page - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 font-medium text-foreground">
          {page + 1} / {totalPages}
        </span>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages - 1}
                    onClick={() => onChange(page + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const AdminMasterclass = () => {
    const [page, setPage]             = useState(0);
    const [search, setSearch]         = useState("");
    const [filterProfile, setFilterProfile] = useState<string>("all");
    const [filterEmail, setFilterEmail]     = useState<string>("all");
    const [selected, setSelected]     = useState<MasterclassRegistration | null>(null);

    const { data, isLoading, isFetching } = useMasterclassRegistrations(
        MASTERCLASS_ID,
        page,
        PAGE_SIZE,
    );

    const registrations = data?.items ?? [];
    const pagination    = data?.pagination;

    // ── KPIs calculés côté client sur la page courante
    // Les totaux vrais viennent de la pagination
    const kpis = useMemo(() => {
        const total     = pagination?.totalElements ?? 0;
        const emailSent = registrations.filter(r => r.emailSent).length;
        const profiles  = registrations.reduce<Record<string, number>>((acc, r) => {
            const k = r.profile ?? "Autre";
            acc[k] = (acc[k] ?? 0) + 1;
            return acc;
        }, {});
        const topProfile = Object.entries(profiles).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        return { total, emailSent, topProfile };
    }, [registrations, pagination]);

    // ── Filtrage local (sur la page courante) ─────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return registrations.filter(r => {
            const matchSearch =
                !q ||
                `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                (r.company ?? "").toLowerCase().includes(q);
            const matchProfile =
                filterProfile === "all" || r.profile === filterProfile;
            const matchEmail =
                filterEmail === "all" ||
                (filterEmail === "sent" && r.emailSent) ||
                (filterEmail === "pending" && !r.emailSent);
            return matchSearch && matchProfile && matchEmail;
        });
    }, [registrations, search, filterProfile, filterEmail]);

    // Reset page si on change les filtres
    const handleSearch = (v: string) => { setSearch(v); setPage(0); };
    const handleProfile = (v: string) => { setFilterProfile(v); setPage(0); };
    const handleEmail = (v: string) => { setFilterEmail(v); setPage(0); };

    return (
        <AdminLayout title="Masterclass — Inscriptions">

            {/* ── En-tête ─────────────────────────────────────────────────────── */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                        Power BI Dashboard · 20 mars 2026
                    </p>
                </div>
                <p className="text-muted-foreground text-sm">
                    Construire son premier tableau de bord avec Microsoft Power BI
                </p>
            </div>

            {/* ── KPIs ────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    label="Total inscrits"
                    value={isLoading ? "—" : kpis.total}
                    icon={Users}
                    accent="bg-amber-100 text-amber-600 dark:bg-amber-950/60"
                    sub="Depuis l'ouverture"
                />
                <KpiCard
                    label="Emails envoyés"
                    value={isLoading ? "—" : kpis.emailSent}
                    icon={MailCheck}
                    accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60"
                    sub="Confirmation Meet"
                />
                <KpiCard
                    label="Sans confirmation"
                    value={isLoading ? "—" : registrations.filter(r => !r.emailSent).length}
                    icon={MailX}
                    accent="bg-rose-100 text-rose-600 dark:bg-rose-950/60"
                    sub="Email non envoyé"
                />
                <KpiCard
                    label="Profil dominant"
                    value={isLoading ? "—" : kpis.topProfile}
                    icon={GraduationCap}
                    accent="bg-violet-100 text-violet-600 dark:bg-violet-950/60"
                    sub="Cette page"
                />
            </div>

            {/* ── Barre de recherche + filtres ────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Rechercher par nom, email, entreprise…"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>

                <Select value={filterProfile} onValueChange={handleProfile}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Tous les profils" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les profils</SelectItem>
                        {Object.keys(PROFILE_CONFIG).map(k => (
                            <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterEmail} onValueChange={handleEmail}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Email" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="sent">Email envoyé</SelectItem>
                        <SelectItem value="pending">Email en attente</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* ── Tableau ─────────────────────────────────────────────────────── */}
            <div className={`rounded-xl border border-border overflow-hidden transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-10">#</TableHead>
                            <TableHead>Participant</TableHead>
                            <TableHead className="hidden md:table-cell">Profil</TableHead>
                            <TableHead className="hidden lg:table-cell">Entreprise</TableHead>
                            <TableHead className="hidden sm:table-cell">Email confirm.</TableHead>
                            <TableHead className="hidden sm:table-cell">Date</TableHead>
                            <TableHead className="text-right">Détail</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-16">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                                    Aucun résultat.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((reg, idx) => {
                                const profile    = getProfileConfig(reg.profile);
                                const ProfileIcon = profile.icon;
                                const rowNum     = page * PAGE_SIZE + idx + 1;

                                return (
                                    <TableRow
                                        key={reg.id}
                                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => setSelected(reg)}
                                    >
                                        {/* Numéro */}
                                        <TableCell className="text-muted-foreground text-xs font-mono">
                                            {rowNum}
                                        </TableCell>

                                        {/* Participant */}
                                        <TableCell>
                                            <p className="font-semibold leading-none">
                                                {reg.firstName} {reg.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                                {reg.email}
                                            </p>
                                        </TableCell>

                                        {/* Profil */}
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline" className={`${profile.className} gap-1 text-xs`}>
                                                <ProfileIcon className="h-3 w-3" />
                                                {profile.label}
                                            </Badge>
                                        </TableCell>

                                        {/* Entreprise */}
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                            {reg.company ?? "—"}
                                        </TableCell>

                                        {/* Email confirmation */}
                                        <TableCell className="hidden sm:table-cell">
                                            {reg.emailSent ? (
                                                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <MailCheck className="h-3.5 w-3.5" /> Envoyé
                        </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                          <MailX className="h-3.5 w-3.5" /> En attente
                        </span>
                                            )}
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                                            {format(new Date(reg.createdAt), "d MMM yyyy", { locale: fr })}
                                        </TableCell>

                                        {/* Action */}
                                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setSelected(reg)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────────────── */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    totalElements={pagination.totalElements}
                    size={pagination.size}
                    onChange={setPage}
                />
            )}

            {/* Compteur résultats filtrés */}
            {!isLoading && (
                <p className="text-xs text-muted-foreground mt-2 text-right">
                    {filtered.length !== registrations.length
                        ? `${filtered.length} résultat(s) filtré(s) sur ${registrations.length} de cette page`
                        : `${registrations.length} inscription(s) sur cette page`}
                </p>
            )}

            {/* ── Dialog détail ────────────────────────────────────────────────── */}
            <RegistrationDetailDialog
                reg={selected}
                onClose={() => setSelected(null)}
            />
        </AdminLayout>
    );
};

export default AdminMasterclass;
