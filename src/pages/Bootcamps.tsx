import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Download,
  Send,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Bootcamp = Tables<"bootcamps">;

// Fallback static data if DB is empty
const staticBootcamps: Bootcamp[] = [
  {
    id: "static-1",
    title: "Power BI pour la Finance",
    description: "Maîtrisez Power BI avec des cas pratiques orientés finance : analyse de la rentabilité, suivi budgétaire, reporting financier automatisé.",
    duration: "5 jours (35h)",
    audience: "Contrôleurs de gestion, DAF, analystes financiers",
    prerequisites: "Maîtrise d'Excel, notions de comptabilité",
    price: "450 000 FCFA",
    next_session: "20 - 24 Janvier 2026",
    benefits: ["Tableaux de bord financiers interactifs", "Automatisation des reportings mensuels", "Analyse de variance et KPIs", "Connexion aux sources comptables", "Certification de fin de formation"],
    featured: true,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "static-2",
    title: "Data Analytics pour Managers",
    description: "Développez une culture data-driven. Apprenez à interpréter les données et prendre des décisions éclairées basées sur les faits.",
    duration: "3 jours (21h)",
    audience: "Managers, directeurs, chefs de projet",
    prerequisites: "Aucun prérequis technique",
    price: "350 000 FCFA",
    next_session: "10 - 12 Février 2026",
    benefits: ["Lecture et interprétation des données", "Identification des KPIs pertinents", "Prise de décision basée sur les données", "Communication avec les équipes data", "Initiation à Power BI"],
    featured: false,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "static-3",
    title: "Reporting & Data Visualization",
    description: "Créez des visualisations impactantes et des rapports automatisés qui communiquent efficacement vos insights.",
    duration: "4 jours (28h)",
    audience: "Analystes, chargés de reporting, data analysts",
    prerequisites: "Bases Excel, esprit analytique",
    price: "400 000 FCFA",
    next_session: "3 - 6 Mars 2026",
    benefits: ["Principes de data visualization", "Power BI Desktop complet", "Conception de dashboards efficaces", "Storytelling avec les données", "Publication et partage"],
    featured: false,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "static-4",
    title: "Préparation Certification PL-300",
    description: "Préparez-vous intensivement à l'examen Microsoft PL-300 Power BI Data Analyst avec un taux de réussite supérieur à 90%.",
    duration: "3 jours (21h)",
    audience: "Utilisateurs Power BI confirmés",
    prerequisites: "Expérience Power BI (6 mois minimum)",
    price: "300 000 FCFA",
    next_session: "17 - 19 Mars 2026",
    benefits: ["Révision complète du syllabus", "Exercices pratiques ciblés", "3 examens blancs commentés", "Stratégies de passage d'examen", "Support jusqu'à l'examen"],
    featured: false,
    published: true,
    created_at: "",
    updated_at: "",
  },
];

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  message: string;
}

const initialForm: RegistrationForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  position: "",
  message: "",
};

const Bootcamps = () => {
  const { toast } = useToast();
  const [selectedBootcamp, setSelectedBootcamp] = useState<Bootcamp | null>(null);
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: bootcamps, isLoading } = useQuery({
    queryKey: ["bootcamps-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bootcamps")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Bootcamp[];
    },
  });

  const displayBootcamps = bootcamps && bootcamps.length > 0 ? bootcamps : staticBootcamps;

  const openRegistration = (bootcamp: Bootcamp) => {
    setSelectedBootcamp(bootcamp);
    setForm(initialForm);
    setSubmitted(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBootcamp) return;
    setSubmitting(true);

    const { error } = await supabase.from("registrations").insert({
      bootcamp_id: selectedBootcamp.id.startsWith("static-") ? null : selectedBootcamp.id,
      bootcamp_title: selectedBootcamp.title,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      position: form.position.trim() || null,
      message: form.message.trim() || null,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Erreur lors de l'inscription",
        description: "Veuillez réessayer ou nous contacter directement.",
        variant: "destructive",
      });
    } else {
      setSubmitted(true);
      toast({
        title: "Inscription envoyée !",
        description: "Nous vous contacterons dans les 24h pour confirmer votre place.",
      });
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Bootcamps & Formations
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Des programmes intensifs pour une montée en compétences rapide.
              Formations pratiques, cas réels et certification.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => document.getElementById("bootcamps-list")?.scrollIntoView({ behavior: "smooth" })}
              >
                Voir les sessions
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#" download>
                  <Download className="h-4 w-4" />
                  Télécharger le catalogue
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bootcamps List */}
      <section id="bootcamps-list" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {displayBootcamps.map((bootcamp, index) => (
                <div
                  key={bootcamp.id}
                  className={`relative p-8 lg:p-10 rounded-2xl border transition-all duration-300 opacity-0 animate-fade-in ${
                    bootcamp.featured
                      ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30"
                      : "bg-card border-border"
                  }`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {bootcamp.featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      Prochaine session
                    </div>
                  )}

                  <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
                    <div>
                      <h3 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">
                        {bootcamp.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {bootcamp.description}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {bootcamp.duration && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Durée</p>
                              <p className="text-sm font-medium text-foreground">{bootcamp.duration}</p>
                            </div>
                          </div>
                        )}
                        {bootcamp.audience && (
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Public cible</p>
                              <p className="text-sm font-medium text-foreground">{bootcamp.audience}</p>
                            </div>
                          </div>
                        )}
                        {bootcamp.prerequisites && (
                          <div className="flex items-center gap-3">
                            <Award className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Prérequis</p>
                              <p className="text-sm font-medium text-foreground">{bootcamp.prerequisites}</p>
                            </div>
                          </div>
                        )}
                        {bootcamp.next_session && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-accent" />
                            <div>
                              <p className="text-xs text-muted-foreground">Prochaine session</p>
                              <p className="text-sm font-medium text-accent">{bootcamp.next_session}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {bootcamp.benefits && bootcamp.benefits.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-3">Ce que vous apprendrez :</p>
                          <ul className="grid sm:grid-cols-2 gap-2">
                            {bootcamp.benefits.map((benefit) => (
                              <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="lg:border-l lg:border-border lg:pl-8 flex flex-col justify-center">
                      <div className="text-center lg:text-left mb-6">
                        <p className="text-sm text-muted-foreground mb-1">Tarif</p>
                        <p className="font-heading text-3xl font-bold text-foreground">{bootcamp.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports de formation inclus</p>
                      </div>
                      <div className="space-y-3">
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => openRegistration(bootcamp)}
                        >
                          S'inscrire
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/contact">
                            En savoir plus
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Besoin d'une formation sur-mesure ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Nous pouvons adapter nos bootcamps à vos besoins spécifiques ou créer un programme entièrement personnalisé.
            </p>
            <Button asChild size="lg">
              <Link to="/contact">
                Discutons de votre projet
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Registration Dialog */}
      <Dialog open={!!selectedBootcamp} onOpenChange={(open) => !open && setSelectedBootcamp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Inscription au bootcamp
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{selectedBootcamp?.title}</p>
                {selectedBootcamp?.next_session && (
                  <p className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-accent" />
                    <span className="text-accent font-medium">{selectedBootcamp.next_session}</span>
                  </p>
                )}
                {selectedBootcamp?.price && (
                  <p className="text-sm text-muted-foreground">Tarif : <span className="font-semibold text-foreground">{selectedBootcamp.price}</span></p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                Inscription envoyée !
              </h3>
              <p className="text-muted-foreground mb-6">
                Merci pour votre intérêt. Notre équipe vous contactera dans les 24h pour confirmer votre inscription et vous communiquer les détails de paiement.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setSelectedBootcamp(null)} variant="outline">
                  Fermer
                </Button>
                <Button onClick={() => { setSubmitted(false); setForm(initialForm); }}>
                  Nouvelle inscription
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-firstName">Prénom *</Label>
                  <Input
                    id="reg-firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-lastName">Nom *</Label>
                  <Input
                    id="reg-lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Téléphone</Label>
                  <Input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+221 77 000 00 00"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-company">Entreprise</Label>
                  <Input
                    id="reg-company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-position">Poste / Fonction</Label>
                  <Input
                    id="reg-position"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Votre poste actuel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-message">Message (optionnel)</Label>
                <Textarea
                  id="reg-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Questions, besoins particuliers, informations complémentaires..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedBootcamp(null)}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer ma candidature
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Bootcamps;
