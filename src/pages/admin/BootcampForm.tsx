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
import { ArrowLeft, Plus, X, Loader2, Save, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast.ts";
import type { CreateBootcampPayload } from "@/types/bootcamp.type.ts";

const CATEGORIES = [
    { value: "bi", label: "Business Intelligence / Power BI" },
    { value: "python", label: "Python" },
    { value: "sql", label: "SQL & Bases de données" },
    { value: "data", label: "Data Analytics" },
    { value: "ai", label: "Intelligence Artificielle" },
];

const ICONS = ["BarChart3", "Database", "Code2", "Brain", "TrendingUp", "PieChart", "Table", "Cpu"];

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
};

export default function BootcampForm() {
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [form, setForm] = useState<FormState>(defaultForm);
    const [newBenefit, setNewBenefit] = useState("");

    const { isLoading: isLoadingBootcamp } = useQuery({
        queryKey: ["admin", "bootcamps", id],
        queryFn: () => adminBootcampService.get(id!),
        enabled: isEdit,
        select: (data) => {
            // Pre-fill dès que la donnée arrive
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
            });
            return data;
        },
    });

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

    const set = (field: keyof FormState, value: unknown) =>
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
                </section>

                {/* Section : Compétences acquises */}
                <section className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <h2 className="font-semibold text-foreground">Compétences acquises</h2>
                    <p className="text-sm text-muted-foreground">
                        Points listés dans "Ce que vous apprendrez" sur la card bootcamp.
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
