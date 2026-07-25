import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBootcampService } from "@/services/Adminbootcampservice.ts";
import { AdminLayout } from "@/components/admin/AdminLayout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { ArrowLeft, Plus, X, Loader2, Save, CalendarDays, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast.ts";
import type {
    CreateBootcampPayload,
    BootcampProfile,
    BootcampTool,
    BootcampOutcome,
    BootcampCurriculumWeek,
    BootcampTestimonial,
    BootcampCertification,
} from "@/types/bootcamp.type.ts";

const CATEGORIES = [
    { value: "bi", label: "Business Intelligence / Power BI" },
    { value: "python", label: "Python" },
    { value: "sql", label: "SQL & Bases de données" },
    { value: "excel-finance", label: "Excel Financiers & Contrôle de gestion" },
    { value: "data", label: "Data Analytics (général)" },
    { value: "ai", label: "Intelligence Artificielle" },
];

const ICONS = ["BarChart3", "Database", "Code2", "Calculator", "Table2", "Brain", "TrendingUp", "PieChart", "Table", "Cpu"];

const EMPTY_TESTIMONIAL: BootcampTestimonial = { name: "", role: "", company: "", content: "", initials: "" };
const EMPTY_CERTIFICATION: BootcampCertification = { name: "", logo: "🎓", description: "" };

type FormState = {
    title: string;
    description: string;
    duration: string;
    audience: string;
    prerequisites: string;
    price: string;
    benefits: string[];
    category: string;
    tag: string;
    iconName: string;
    featured: boolean;
    published: boolean;
    displayOrder: number;

    // Contenu configurable — voir docs/redesign-diagnostic.md §8
    tagline: string;
    colorKey: "accent" | "primary";
    profiles: BootcampProfile[];
    tools: BootcampTool[];
    outcomes: BootcampOutcome[];
    curriculum: BootcampCurriculumWeek[];
    testimonial: BootcampTestimonial;
    certification: BootcampCertification;
};

const defaultForm: FormState = {
    title: "",
    description: "",
    duration: "",
    audience: "",
    prerequisites: "",
    price: "",
    benefits: [],
    category: "data",
    tag: "",
    iconName: "BarChart3",
    featured: false,
    published: true,
    displayOrder: 0,
    tagline: "",
    colorKey: "primary",
    profiles: [],
    tools: [],
    outcomes: [],
    curriculum: [],
    testimonial: EMPTY_TESTIMONIAL,
    certification: EMPTY_CERTIFICATION,
};

// ─── Petits éditeurs réutilisables ─────────────────────────────────────────────

function ToolsEditor({ tools, onChange }: { tools: BootcampTool[]; onChange: (tools: BootcampTool[]) => void }) {
    const update = (i: number, patch: Partial<BootcampTool>) =>
        onChange(tools.map((t, j) => (j === i ? { ...t, ...patch } : t)));
    const remove = (i: number) => onChange(tools.filter((_, j) => j !== i));
    const add = () => onChange([...tools, { name: "", level: 70 }]);

    return (
        <div className="space-y-2">
            {tools.map((tool, i) => (
                <div key={i} className="flex items-center gap-2">
                    <Input
                        className="flex-1"
                        placeholder="ex: Power BI"
                        value={tool.name}
                        onChange={(e) => update(i, { name: e.target.value })}
                    />
                    <Input
                        type="number" min={0} max={100} className="w-24"
                        value={tool.level}
                        onChange={(e) => update(i, { level: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    />
                    <span className="text-xs text-muted-foreground w-4">%</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={add}>
                <Plus className="h-4 w-4" /> Ajouter un outil
            </Button>
        </div>
    );
}

function OutcomesEditor({ outcomes, onChange }: { outcomes: BootcampOutcome[]; onChange: (outcomes: BootcampOutcome[]) => void }) {
    const update = (i: number, patch: Partial<BootcampOutcome>) =>
        onChange(outcomes.map((o, j) => (j === i ? { ...o, ...patch } : o)));
    const remove = (i: number) => onChange(outcomes.filter((_, j) => j !== i));
    const add = () => onChange([...outcomes, { stat: "", label: "" }]);

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
                Chiffres clés affichés sur la fiche formation — ne pas inventer, laisser vide si non mesuré.
            </p>
            {outcomes.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                    <Input className="w-28" placeholder="ex: 94%" value={o.stat} onChange={(e) => update(i, { stat: e.target.value })} />
                    <Input className="flex-1" placeholder="ex: taux de satisfaction alumni" value={o.label} onChange={(e) => update(i, { label: e.target.value })} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={add}>
                <Plus className="h-4 w-4" /> Ajouter un chiffre clé
            </Button>
        </div>
    );
}

function ProfilesEditor({ profiles, onChange }: { profiles: BootcampProfile[]; onChange: (profiles: BootcampProfile[]) => void }) {
    const update = (i: number, patch: Partial<BootcampProfile>) =>
        onChange(profiles.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    const remove = (i: number) => onChange(profiles.filter((_, j) => j !== i));
    const add = () => onChange([...profiles, { icon: "💼", label: "" }]);

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">"Pour qui est ce bootcamp ?" — un emoji + un profil par ligne.</p>
            {profiles.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <Input className="w-16 text-center" value={p.icon} onChange={(e) => update(i, { icon: e.target.value })} />
                    <Input className="flex-1" placeholder="ex: Contrôleurs de gestion" value={p.label} onChange={(e) => update(i, { label: e.target.value })} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={add}>
                <Plus className="h-4 w-4" /> Ajouter un profil
            </Button>
        </div>
    );
}

function CurriculumEditor({ curriculum, onChange }: { curriculum: BootcampCurriculumWeek[]; onChange: (c: BootcampCurriculumWeek[]) => void }) {
    const update = (i: number, patch: Partial<BootcampCurriculumWeek>) =>
        onChange(curriculum.map((w, j) => (j === i ? { ...w, ...patch } : w)));
    const remove = (i: number) => onChange(curriculum.filter((_, j) => j !== i));
    const add = () => onChange([...curriculum, { week: "", title: "", hours: "", topics: [], project: "" }]);

    return (
        <div className="space-y-4">
            {curriculum.map((week, i) => (
                <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-secondary/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bloc {i + 1}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Période</Label>
                            <Input placeholder="ex: Semaines 1-2" value={week.week} onChange={(e) => update(i, { week: e.target.value })} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label className="text-xs">Titre du bloc</Label>
                            <Input placeholder="ex: Fondamentaux & Excel Avancé" value={week.title} onChange={(e) => update(i, { title: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Volume horaire</Label>
                        <Input className="w-32" placeholder="ex: 18h" value={week.hours} onChange={(e) => update(i, { hours: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Sujets abordés (un par ligne)</Label>
                        <Textarea
                            rows={3}
                            placeholder={"ex:\nTableaux croisés dynamiques avancés\nPower Query : import et transformation"}
                            value={week.topics.join("\n")}
                            onChange={(e) => update(i, { topics: e.target.value.split("\n").map((t) => t.trim()).filter(Boolean) })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Projet du bloc</Label>
                        <Input placeholder="ex: Tableau de bord financier Excel" value={week.project} onChange={(e) => update(i, { project: e.target.value })} />
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={add}>
                <Plus className="h-4 w-4" /> Ajouter un bloc au programme
            </Button>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BootcampForm() {
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [form, setForm] = useState<FormState>(defaultForm);
    const [newBenefit, setNewBenefit] = useState("");

    const { data: existingBootcamp, isLoading: isLoadingBootcamp } = useQuery({
        queryKey: ["admin", "bootcamps", id],
        queryFn: () => adminBootcampService.get(id!),
        enabled: isEdit,
    });

    // Pré-remplissage à l'arrivée des données — dans un effet, pas dans `select`.
    // `select` réexécute à chaque re-render (nouvelle référence de fonction),
    // et appeler setState() depuis `select` déclenche alors une boucle de
    // re-renders ("Too many re-renders") dès qu'on atteint /admin/bootcamps/:id/edit
    // (notamment juste après la création, quand la page bascule automatiquement
    // en mode édition).
    useEffect(() => {
        if (!existingBootcamp) return;
        const data = existingBootcamp;
        setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            duration: data.duration ?? "",
            audience: data.audience ?? "",
            prerequisites: data.prerequisites ?? "",
            price: data.price ?? "",
            benefits: data.benefits ?? [],
            category: data.category ?? "data",
            tag: data.tag ?? "",
            iconName: data.iconName ?? "BarChart3",
            featured: data.featured ?? false,
            published: data.published ?? true,
            displayOrder: data.displayOrder ?? 0,
            tagline: data.tagline ?? "",
            colorKey: data.colorKey ?? "primary",
            profiles: data.profiles ?? [],
            tools: data.tools ?? [],
            outcomes: data.outcomes ?? [],
            curriculum: data.curriculum ?? [],
            testimonial: data.testimonial ?? EMPTY_TESTIMONIAL,
            certification: data.certification ?? EMPTY_CERTIFICATION,
        });
    }, [existingBootcamp]);

    const mutation = useMutation({
        mutationFn: (payload: CreateBootcampPayload) =>
            isEdit
                ? adminBootcampService.update(id!, payload)
                : adminBootcampService.create(payload),
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "bootcamps"] });
            toast({
                title: isEdit ? "Bootcamp mis à jour" : "Bootcamp créé",
                description: saved.title,
            });
            // En création, redirige vers edit pour pouvoir ajouter des sessions
            if (!isEdit) {
                navigate(`/admin/bootcamps/${saved.id}/edit`);
            }
        },
        onError: () => {
            toast({ title: "Erreur", description: "Sauvegarde impossible", variant: "destructive" });
        },
    });

    const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const addBenefit = () => {
        const val = newBenefit.trim();
        if (!val || form.benefits.includes(val)) return;
        set("benefits", [...form.benefits, val]);
        setNewBenefit("");
    };

    const removeBenefit = (benefit: string) =>
        set("benefits", form.benefits.filter((b) => b !== benefit));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast({ title: "Le titre est obligatoire", variant: "destructive" });
            return;
        }
        mutation.mutate({
            ...form,
            tag: form.tag.trim() || undefined,
            displayOrder: Number(form.displayOrder) || 0,
            tagline: form.tagline.trim() || undefined,
            // Testimonial/certification vides (name non renseigné) → non envoyés,
            // la fiche formation retombe alors sur le contenu générique de repli.
            testimonial: form.testimonial.name.trim() ? form.testimonial : null,
            certification: form.certification.name.trim() ? form.certification : null,
        });
    };

    const pageTitle = isEdit ? "Modifier le bootcamp" : "Nouveau bootcamp";

    if (isEdit && isLoadingBootcamp) {
        return (
            <AdminLayout title={pageTitle}>
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={pageTitle}>
            {/* Breadcrumb / retour */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/bootcamps")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <p className="text-sm text-muted-foreground">
                        {isEdit
                            ? "Modifiez les informations du programme"
                            : "Remplissez les informations du nouveau programme"}
                    </p>
                </div>
                {/* Bouton sessions si mode édition */}
                {isEdit && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto gap-2"
                        onClick={() => navigate(`/admin/bootcamp-sessions?bootcamp=${id}`)}
                    >
                        <CalendarDays className="h-4 w-4" />
                        Gérer les sessions
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
                {/* Section : Informations principales */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Informations principales</h2>

                    <div className="space-y-2">
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                            id="title"
                            placeholder="ex: Bootcamp Power BI — De Zéro à Expert"
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tagline">Accroche courte</Label>
                        <Input
                            id="tagline"
                            placeholder="ex: Du tableur au tableau de bord — préparez la certification PL-300"
                            value={form.tagline}
                            onChange={(e) => set("tagline", e.target.value)}
                            maxLength={120}
                        />
                        <p className="text-xs text-muted-foreground">Affichée sous le titre sur la fiche formation.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Décrivez le programme en quelques phrases..."
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select value={form.category} onValueChange={(v) => set("category", v)}>
                                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="iconName">Icône</Label>
                            <Select value={form.iconName} onValueChange={(v) => set("iconName", v)}>
                                <SelectTrigger id="iconName"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {ICONS.map((icon) => (
                                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="colorKey">Couleur d'accent de la fiche</Label>
                        <Select value={form.colorKey} onValueChange={(v) => set("colorKey", v as "accent" | "primary")}>
                            <SelectTrigger id="colorKey" className="w-56"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="accent">Orange (accent)</SelectItem>
                                <SelectItem value="primary">Navy (primary)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Durée</Label>
                            <Input
                                id="duration"
                                placeholder="ex: 10 semaines"
                                value={form.duration}
                                onChange={(e) => set("duration", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Prix affiché</Label>
                            <Input
                                id="price"
                                placeholder="ex: 450 000 FCFA"
                                value={form.price}
                                onChange={(e) => set("price", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tag">Badge / Tag (optionnel)</Label>
                        <Input
                            id="tag"
                            placeholder="ex: Bestseller, Nouveau, Places limitées"
                            value={form.tag}
                            onChange={(e) => set("tag", e.target.value)}
                            maxLength={40}
                        />
                    </div>
                </section>

                {/* Section : Public & Prérequis */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Public & Prérequis</h2>

                    <div className="space-y-2">
                        <Label htmlFor="audience">Public cible</Label>
                        <Textarea
                            id="audience"
                            placeholder="ex: Professionnels en reconversion, Étudiants bac+2..."
                            value={form.audience}
                            onChange={(e) => set("audience", e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prerequisites">Prérequis</Label>
                        <Textarea
                            id="prerequisites"
                            placeholder="ex: Aucun prérequis technique — maîtrise de l'outil informatique recommandée"
                            value={form.prerequisites}
                            onChange={(e) => set("prerequisites", e.target.value)}
                            rows={2}
                        />
                    </div>

                    <ProfilesEditor profiles={form.profiles} onChange={(v) => set("profiles", v)} />
                </section>

                {/* Section : Compétences acquises */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Compétences acquises</h2>
                    <p className="text-sm text-muted-foreground">
                        Points listés dans "Ce que vous apprendrez" sur la fiche formation.
                    </p>

                    <div className="flex gap-2">
                        <Input
                            placeholder="ex: Maîtriser Power BI Desktop"
                            value={newBenefit}
                            onChange={(e) => setNewBenefit(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); addBenefit(); }
                            }}
                        />
                        <Button type="button" variant="outline" onClick={addBenefit}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {form.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.benefits.map((benefit) => (
                                <Badge key={benefit} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5">
                                    {benefit}
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(benefit)}
                                        className="ml-1 hover:text-destructive transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </section>

                {/* Section : Outils maîtrisés */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Outils maîtrisés</h2>
                    <ToolsEditor tools={form.tools} onChange={(v) => set("tools", v)} />
                </section>

                {/* Section : Chiffres clés */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Chiffres clés (optionnel)</h2>
                    <OutcomesEditor outcomes={form.outcomes} onChange={(v) => set("outcomes", v)} />
                </section>

                {/* Section : Programme */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Programme semaine par semaine</h2>
                    <CurriculumEditor curriculum={form.curriculum} onChange={(v) => set("curriculum", v)} />
                </section>

                {/* Section : Témoignage */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Témoignage alumni (optionnel)</h2>
                    <p className="text-xs text-muted-foreground">Laisser le nom vide pour ne pas afficher de témoignage.</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Nom</Label>
                            <Input value={form.testimonial.name} onChange={(e) => set("testimonial", { ...form.testimonial, name: e.target.value })} placeholder="ex: Emmanuel BOUADI" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Initiales</Label>
                            <Input value={form.testimonial.initials} onChange={(e) => set("testimonial", { ...form.testimonial, initials: e.target.value })} placeholder="ex: EB" maxLength={3} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Rôle</Label>
                            <Input value={form.testimonial.role} onChange={(e) => set("testimonial", { ...form.testimonial, role: e.target.value })} placeholder="ex: Data analyst" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Entreprise</Label>
                            <Input value={form.testimonial.company} onChange={(e) => set("testimonial", { ...form.testimonial, company: e.target.value })} placeholder="ex: WAVE" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Citation</Label>
                        <Textarea rows={2} value={form.testimonial.content} onChange={(e) => set("testimonial", { ...form.testimonial, content: e.target.value })} />
                    </div>
                </section>

                {/* Section : Certification */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Certification / Attestation (optionnel)</h2>
                    <p className="text-xs text-muted-foreground">Laisser le nom vide pour ne rien afficher.</p>
                    <div className="grid sm:grid-cols-[1fr,80px] gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Nom</Label>
                            <Input value={form.certification.name} onChange={(e) => set("certification", { ...form.certification, name: e.target.value })} placeholder="ex: Microsoft Power BI Data Analyst (PL-300)" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Icône</Label>
                            <Input className="text-center" value={form.certification.logo} onChange={(e) => set("certification", { ...form.certification, logo: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Description</Label>
                        <Textarea rows={2} value={form.certification.description} onChange={(e) => set("certification", { ...form.certification, description: e.target.value })} />
                    </div>
                </section>

                {/* Section : Publication */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Options de publication</h2>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                            <p className="font-medium text-foreground text-sm">Publié</p>
                            <p className="text-xs text-muted-foreground">Visible sur le site public</p>
                        </div>
                        <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                            <p className="font-medium text-foreground text-sm">Mis en avant</p>
                            <p className="text-xs text-muted-foreground">Bandeau et fond dégradé sur la card</p>
                        </div>
                        <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="displayOrder">Ordre d'affichage</Label>
                        <Input
                            id="displayOrder"
                            type="number"
                            min={0}
                            value={form.displayOrder}
                            onChange={(e) => set("displayOrder", parseInt(e.target.value) || 0)}
                            className="w-32"
                        />
                        <p className="text-xs text-muted-foreground">0 = premier affiché.</p>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isEdit ? "Enregistrer" : "Créer le bootcamp"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate("/admin/bootcamps")}>
                        Annuler
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
