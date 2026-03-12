import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  Calendar,
  Users,
  Percent,
  Mail,
  Phone,
  User,
  Copy,
  CheckCircle2,
  Eye,
  EyeOff,
  Save,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  usePromoCodes,
  useCreatePromoCode,
  useUpdatePromoCode,
  useDeletePromoCode,
  useTogglePromoCodeActive,
} from "@/hooks/usePromoCodes";
import type { PromoCode, CreatePromoCodeDTO } from "@/types/promo-code.type";

// Types pour le formulaire
type FormState = {
  code: string;
  description: string;
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  discountPercent: number;
  maxUses: string;
  expiresAt: string;
  isActive: boolean;
};

const defaultForm: FormState = {
  code: "",
  description: "",
  referrerName: "",
  referrerEmail: "",
  referrerPhone: "",
  discountPercent: 0,
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

// Filtres possibles
type StatusFilter = "all" | "active" | "inactive" | "expired" | "full";

function promoCodeToForm(promoCode: PromoCode): FormState {
  return {
    code: promoCode.code,
    description: promoCode.description || "",
    referrerName: promoCode.referrerName,
    referrerEmail: promoCode.referrerEmail || "",
    referrerPhone: promoCode.referrerPhone || "",
    discountPercent: promoCode.discountPercent,
    maxUses: promoCode.maxUses?.toString() || "",
    expiresAt: promoCode.expiresAt || "",
    isActive: promoCode.isActive,
  };
}

function validateForm(form: FormState): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!form.code.trim()) {
    errors.code = "Le code est obligatoire";
  } else if (!/^[A-Z0-9_-]+$/.test(form.code.toUpperCase())) {
    errors.code = "Le code ne doit contenir que des lettres majuscules, chiffres, tirets et underscores";
  }

  if (!form.referrerName.trim()) {
    errors.referrerName = "Le nom du parrain est obligatoire";
  }

  if (form.referrerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.referrerEmail)) {
    errors.referrerEmail = "Email invalide";
  }

  if (form.discountPercent < 0 || form.discountPercent > 100) {
    errors.discountPercent = "La réduction doit être entre 0 et 100%";
  }

  if (form.maxUses && (parseInt(form.maxUses) < 1 || !Number.isInteger(parseInt(form.maxUses)))) {
    errors.maxUses = "Le nombre d'utilisations doit être un entier positif";
  }

  if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
    errors.expiresAt = "La date d'expiration doit être dans le futur";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export default function AdminPromoCodes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // États
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Recherche et filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Requêtes
  const { data, isLoading } = usePromoCodes();
  const promoCodes = data?.content || [];
  const totalElements = data?.totalElements || 0;

  const createMutation = useCreatePromoCode();
  const updateMutation = useUpdatePromoCode();
  const deleteMutation = useDeletePromoCode();
  const toggleActiveMutation = useTogglePromoCodeActive();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ['promoCodes', 'list'] });
  };

  // Filtrage des codes
  const filteredPromoCodes = promoCodes.filter((promoCode) => {
    // Filtre par recherche
    const matchesSearch =
        searchQuery === "" ||
        promoCode.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promoCode.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (promoCode.referrerEmail?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (promoCode.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filtre par statut
    if (statusFilter === "all") return true;

    const isExpired = promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date();
    const isFull = promoCode.maxUses ? promoCode.usageCount >= promoCode.maxUses : false;

    switch (statusFilter) {
      case "active":
        return promoCode.isActive && !isExpired && !isFull;
      case "inactive":
        return !promoCode.isActive;
      case "expired":
        return isExpired;
      case "full":
        return isFull;
      default:
        return true;
    }
  });

  // Ouvrir le formulaire de création
  const openCreate = () => {
    setEditingPromoCode(null);
    setForm(defaultForm);
    setFormErrors({});
    setDialogOpen(true);
  };

  // Ouvrir le formulaire d'édition
  const openEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setForm(promoCodeToForm(promoCode));
    setFormErrors({});
    setDialogOpen(true);
  };

  // Ouvrir le détail
  const openDetail = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setDetailDialogOpen(true);
  };

  // Fermer les dialogues
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPromoCode(null);
    setFormErrors({});
  };

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedPromoCode(null);
  };

  // Mettre à jour un champ du formulaire
  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Copier le code
  const copyToClipboard = (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Code copié !",
      description: "Le code a été copié dans le presse-papier",
    });
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors } = validateForm(form);
    if (!isValid) {
      setFormErrors(errors);
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs du formulaire",
        variant: "destructive",
      });
      return;
    }

    const payload: CreatePromoCodeDTO = {
      code: form.code.toUpperCase().trim(),
      description: form.description.trim() || null,
      referrerName: form.referrerName.trim(),
      referrerEmail: form.referrerEmail.trim() || null,
      referrerPhone: form.referrerPhone.trim() || null,
      discountPercent: form.discountPercent,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    if (editingPromoCode) {
      updateMutation.mutate(
          { id: editingPromoCode.id, data: payload },
          {
            onSuccess: (updated) => {
              invalidateLists();
              toast({
                title: "Code mis à jour",
                description: `Le code ${updated.code} a été modifié avec succès`,
              });
              closeDialog();
            },
            onError: () => {
              toast({
                title: "Erreur",
                description: "Impossible de modifier le code",
                variant: "destructive",
              });
            },
          }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (created) => {
          invalidateLists();
          toast({
            title: "Code créé",
            description: `Le code ${created.code} a été créé avec succès`,
          });
          closeDialog();
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible de créer le code",
            variant: "destructive",
          });
        },
      });
    }
  };

  // Formater une date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Obtenir le statut d'un code
  const getPromoCodeStatus = (promoCode: PromoCode) => {
    const isExpired = promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date();
    const isFull = promoCode.maxUses ? promoCode.usageCount >= promoCode.maxUses : false;

    if (!promoCode.isActive) return { label: "Inactif", variant: "outline" as const };
    if (isExpired) return { label: "Expiré", variant: "destructive" as const };
    if (isFull) return { label: "Épuisé", variant: "destructive" as const };
    return { label: "Actif", variant: "default" as const };
  };

  return (
      <AdminLayout title="Codes de parrainage">
        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-2xl font-bold">Gestion des codes promo</CardTitle>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau code
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérez vos codes de parrainage et suivez leurs utilisations.
              </p>
            </CardContent>
          </Card>

          {/* Barre de recherche et filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Rechercher par code, parrain, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                  />
                </div>
                <div className="w-full sm:w-64">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="inactive">Inactifs</SelectItem>
                      <SelectItem value="expired">Expirés</SelectItem>
                      <SelectItem value="full">Épuisés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des codes */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : !filteredPromoCodes.length ? (
                  <div className="text-center py-20">
                    <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">
                      {searchQuery || statusFilter !== "all"
                          ? "Aucun code ne correspond aux filtres"
                          : "Aucun code de parrainage"}
                    </p>
                    <p className="text-muted-foreground text-sm mb-6">
                      {searchQuery || statusFilter !== "all"
                          ? "Essayez de modifier vos filtres"
                          : "Créez votre premier code pour commencer"}
                    </p>
                    {(searchQuery || statusFilter !== "all") && (
                        <Button
                            variant="outline"
                            onClick={() => {
                              setSearchQuery("");
                              setStatusFilter("all");
                            }}
                        >
                          Réinitialiser les filtres
                        </Button>
                    )}
                  </div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Parrain</TableHead>
                        <TableHead>Réduction</TableHead>
                        <TableHead>Utilisations</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPromoCodes.map((promoCode) => {
                        const status = getPromoCodeStatus(promoCode);
                        const isExpiringSoon = promoCode.expiresAt &&
                            new Date(promoCode.expiresAt) > new Date() &&
                            new Date(promoCode.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                        return (
                            <TableRow
                                key={promoCode.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => openDetail(promoCode)}
                            >
                              {/* Code avec copie */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-medium">{promoCode.code}</span>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => copyToClipboard(promoCode.code, e)}
                                  >
                                    {copiedCode === promoCode.code ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                  </Button>
                                </div>
                                {promoCode.description && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {promoCode.description}
                                    </p>
                                )}
                              </TableCell>

                              {/* Parrain */}
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">{promoCode.referrerName}</p>
                                  {(promoCode.referrerEmail || promoCode.referrerPhone) && (
                                      <div className="text-xs text-muted-foreground space-y-0.5">
                                        {promoCode.referrerEmail && (
                                            <p className="flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              <span className="truncate max-w-[150px]">{promoCode.referrerEmail}</span>
                                            </p>
                                        )}
                                        {promoCode.referrerPhone && (
                                            <p className="flex items-center gap-1">
                                              <Phone className="h-3 w-3" />
                                              {promoCode.referrerPhone}
                                            </p>
                                        )}
                                      </div>
                                  )}
                                </div>
                              </TableCell>

                              {/* Réduction */}
                              <TableCell>
                                <Badge variant="outline" className="bg-primary/5">
                                  <Percent className="h-3 w-3 mr-1" />
                                  {promoCode.discountPercent}%
                                </Badge>
                              </TableCell>

                              {/* Utilisations */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className={promoCode.maxUses && promoCode.usageCount >= promoCode.maxUses ? "text-destructive font-medium" : ""}>
                              {promoCode.usageCount}
                                    {promoCode.maxUses && ` / ${promoCode.maxUses}`}
                            </span>
                                </div>
                              </TableCell>

                              {/* Expiration */}
                              <TableCell>
                                {promoCode.expiresAt ? (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className={isExpiringSoon ? "text-yellow-600" : ""}>
                                {formatDate(promoCode.expiresAt)}
                                        {isExpiringSoon && (
                                            <Clock className="h-3 w-3 inline ml-1" />
                                        )}
                              </span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>

                              {/* Statut */}
                              <TableCell>
                                <Badge variant={status.variant}>
                                  {status.label}
                                </Badge>
                              </TableCell>

                              {/* Actions */}
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      title={promoCode.isActive ? "Désactiver" : "Activer"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleActiveMutation.mutate(promoCode.id);
                                      }}
                                      disabled={toggleActiveMutation.isPending}
                                  >
                                    {promoCode.isActive ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </Button>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEdit(promoCode);
                                      }}
                                  >
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-destructive/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Supprimer le code "${promoCode.code}" ?`)) {
                                          deleteMutation.mutate(promoCode.id, {
                                            onSuccess: () => {
                                              toast({
                                                title: "Code supprimé",
                                                description: `Le code ${promoCode.code} a été supprimé`,
                                              });
                                            },
                                          });
                                        }
                                      }}
                                      disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
              )}
            </CardContent>
          </Card>

          {/* Dialogue de création/édition */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPromoCode ? "Modifier le code de parrainage" : "Nouveau code de parrainage"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                {/* Code et description */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    Informations générales
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Code * <span className="text-xs text-muted-foreground">(majuscules, chiffres, - et _)</span>
                    </Label>
                    <Input
                        id="code"
                        placeholder="ex: BIENVENUE2024, PARRAIN_JEAN"
                        value={form.code}
                        onChange={(e) => setField("code", e.target.value.toUpperCase())}
                        className={formErrors.code ? "border-destructive" : ""}
                        maxLength={50}
                    />
                    {formErrors.code && (
                        <p className="text-xs text-destructive">{formErrors.code}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Description du code (optionnel)"
                        value={form.description}
                        onChange={(e) => setField("description", e.target.value)}
                        rows={2}
                    />
                  </div>
                </section>

                {/* Informations du parrain */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    Informations du parrain
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="referrerName">Nom du parrain *</Label>
                    <Input
                        id="referrerName"
                        placeholder="ex: Jean Dupont"
                        value={form.referrerName}
                        onChange={(e) => setField("referrerName", e.target.value)}
                        className={formErrors.referrerName ? "border-destructive" : ""}
                    />
                    {formErrors.referrerName && (
                        <p className="text-xs text-destructive">{formErrors.referrerName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referrerEmail">Email</Label>
                      <Input
                          id="referrerEmail"
                          type="email"
                          placeholder="jean.dupont@email.com"
                          value={form.referrerEmail}
                          onChange={(e) => setField("referrerEmail", e.target.value)}
                          className={formErrors.referrerEmail ? "border-destructive" : ""}
                      />
                      {formErrors.referrerEmail && (
                          <p className="text-xs text-destructive">{formErrors.referrerEmail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referrerPhone">Téléphone</Label>
                      <Input
                          id="referrerPhone"
                          placeholder="+221 77 123 45 67"
                          value={form.referrerPhone}
                          onChange={(e) => setField("referrerPhone", e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Réduction et limites */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    Réduction et limites
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountPercent">Pourcentage de réduction *</Label>
                      <div className="flex items-center gap-2">
                        <Input
                            id="discountPercent"
                            type="number"
                            min={0}
                            max={100}
                            value={form.discountPercent}
                            onChange={(e) => setField("discountPercent", parseInt(e.target.value) || 0)}
                            className={formErrors.discountPercent ? "border-destructive" : ""}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      {formErrors.discountPercent && (
                          <p className="text-xs text-destructive">{formErrors.discountPercent}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxUses">Nombre max d'utilisations</Label>
                      <Input
                          id="maxUses"
                          type="number"
                          min={1}
                          step={1}
                          placeholder="Illimité"
                          value={form.maxUses}
                          onChange={(e) => setField("maxUses", e.target.value)}
                          className={formErrors.maxUses ? "border-destructive" : ""}
                      />
                      {formErrors.maxUses && (
                          <p className="text-xs text-destructive">{formErrors.maxUses}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Laissez vide pour illimité
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Date d'expiration</Label>
                    <Input
                        id="expiresAt"
                        type="datetime-local"
                        value={form.expiresAt}
                        onChange={(e) => setField("expiresAt", e.target.value)}
                        className={formErrors.expiresAt ? "border-destructive" : ""}
                    />
                    {formErrors.expiresAt && (
                        <p className="text-xs text-destructive">{formErrors.expiresAt}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour pas de date d'expiration
                    </p>
                  </div>
                </section>

                {/* État */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    État
                  </h3>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Code actif</p>
                      <p className="text-xs text-muted-foreground">
                        Désactivez pour suspendre temporairement ce code
                      </p>
                    </div>
                    <Switch
                        checked={form.isActive}
                        onCheckedChange={(v) => setField("isActive", v)}
                    />
                  </div>
                </section>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingPromoCode ? "Enregistrer" : "Créer le code"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialogue de détail */}
          <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails du code promo</DialogTitle>
                <DialogDescription>
                  Informations complètes sur le code de parrainage
                </DialogDescription>
              </DialogHeader>

              {selectedPromoCode && (
                  <div className="space-y-6">
                    {/* En-tête avec code */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Code</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xl font-bold">{selectedPromoCode.code}</span>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyToClipboard(selectedPromoCode.code)}
                          >
                            {copiedCode === selectedPromoCode.code ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Badge variant={getPromoCodeStatus(selectedPromoCode).variant} className="text-sm px-3 py-1">
                        {getPromoCodeStatus(selectedPromoCode).label}
                      </Badge>
                    </div>

                    {/* Description */}
                    {selectedPromoCode.description && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Description</p>
                          <p className="text-foreground bg-muted/30 p-3 rounded-lg">
                            {selectedPromoCode.description}
                          </p>
                        </div>
                    )}

                    {/* Grille d'informations */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Parrain */}
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground mb-2">Informations du parrain</p>
                        <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedPromoCode.referrerName}</span>
                          </div>
                          {selectedPromoCode.referrerEmail && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${selectedPromoCode.referrerEmail}`} className="text-primary hover:underline">
                                  {selectedPromoCode.referrerEmail}
                                </a>
                              </div>
                          )}
                          {selectedPromoCode.referrerPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href={`tel:${selectedPromoCode.referrerPhone}`} className="text-primary hover:underline">
                                  {selectedPromoCode.referrerPhone}
                                </a>
                              </div>
                          )}
                        </div>
                      </div>

                      {/* Réduction */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Réduction</p>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <span className="text-2xl font-bold text-primary">{selectedPromoCode.discountPercent}%</span>
                        </div>
                      </div>

                      {/* Utilisations */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Utilisations</p>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <span className="text-2xl font-bold">{selectedPromoCode.usageCount}</span>
                          {selectedPromoCode.maxUses && (
                              <span className="text-muted-foreground"> / {selectedPromoCode.maxUses}</span>
                          )}
                        </div>
                      </div>

                      {/* Date d'expiration */}
                      {selectedPromoCode.expiresAt && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground mb-1">Date d'expiration</p>
                            <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(selectedPromoCode.expiresAt)}</span>
                              {new Date(selectedPromoCode.expiresAt) < new Date() && (
                                  <Badge variant="destructive" className="ml-2">Expiré</Badge>
                              )}
                            </div>
                          </div>
                      )}

                      {/* Dates de création/modification */}
                      <div className="col-span-2 border-t pt-4 mt-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Créé le</p>
                            <p>{formatDate(selectedPromoCode.createdAt)}</p>
                            {selectedPromoCode.createdBy && (
                                <p className="text-xs text-muted-foreground">par {selectedPromoCode.createdBy}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-muted-foreground">Modifié le</p>
                            <p>{formatDate(selectedPromoCode.updatedAt)}</p>
                            {selectedPromoCode.updatedBy && (
                                <p className="text-xs text-muted-foreground">par {selectedPromoCode.updatedBy}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions dans le dialogue de détail */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                          variant="outline"
                          onClick={() => {
                            closeDetailDialog();
                            openEdit(selectedPromoCode);
                          }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                          variant={selectedPromoCode.isActive ? "outline" : "default"}
                          onClick={() => {
                            toggleActiveMutation.mutate(selectedPromoCode.id);
                            closeDetailDialog();
                          }}
                      >
                        {selectedPromoCode.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Désactiver
                            </>
                        ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Activer
                            </>
                        )}
                      </Button>
                    </div>
                  </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
  );
}
