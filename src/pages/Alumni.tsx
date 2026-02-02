import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  ExternalLink, 
  Users, 
  Calendar,
  Linkedin,
  Mail,
  ChevronLeft,
  ChevronRight,
  Quote
} from "lucide-react";

// Données de démonstration - à remplacer par les vraies données
const alumniGroups = [
  {
    id: 1,
    cohort: "Cohorte 2024",
    year: 2024,
    members: [
      { name: "Amadou Diallo", position: "Data Analyst - Banque Atlantique", linkedin: "https://linkedin.com", email: "amadou@email.com" },
      { name: "Fatou Sow", position: "Contrôleur de Gestion - Orange Sénégal", linkedin: "https://linkedin.com", email: "fatou@email.com" },
    ],
    testimonial: "Une expérience transformatrice ! Le bootcamp nous a permis de maîtriser Power BI et d'appliquer ces compétences directement dans nos entreprises respectives. L'accompagnement personnalisé a fait toute la différence.",
    projectTitle: "Dashboard de Suivi Commercial",
    projectDescription: "Création d'un tableau de bord interactif pour le suivi des performances commerciales d'une entreprise de distribution. Intégration de KPIs clés, analyse des tendances et reporting automatisé.",
    groupPhoto: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
    workPhotos: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
    ],
    projectLink: "https://app.powerbi.com",
  },
  {
    id: 2,
    cohort: "Cohorte 2024",
    year: 2024,
    members: [
      { name: "Moussa Ndiaye", position: "Responsable BI - CBAO", linkedin: "https://linkedin.com", email: "moussa@email.com" },
      { name: "Aïssatou Ba", position: "Analyste Financier - Société Générale", linkedin: "https://linkedin.com", email: "aissatou@email.com" },
      { name: "Omar Sy", position: "Chef de Projet Data - Sonatel", linkedin: "https://linkedin.com", email: "omar@email.com" },
    ],
    testimonial: "Le bootcamp Model Technologie nous a donné les outils et la méthodologie pour devenir autonomes sur Power BI. Les cas pratiques inspirés du monde réel nous ont préparés à relever tous les défis data.",
    projectTitle: "Analyse RH & Masse Salariale",
    projectDescription: "Développement d'un outil d'analyse des ressources humaines permettant de suivre les effectifs, la masse salariale, le turnover et les indicateurs de performance RH.",
    groupPhoto: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
    workPhotos: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    ],
    projectLink: "https://app.powerbi.com",
  },
  {
    id: 3,
    cohort: "Cohorte 2023",
    year: 2023,
    members: [
      { name: "Ibrahima Fall", position: "Business Analyst - Ecobank", linkedin: "https://linkedin.com", email: "ibrahima@email.com" },
      { name: "Mariama Diop", position: "Data Manager - Total Energies", linkedin: "https://linkedin.com", email: "mariama@email.com" },
    ],
    testimonial: "Grâce au bootcamp, j'ai pu obtenir ma certification Microsoft et décrocher le poste de mes rêves. La qualité de la formation et l'expertise des formateurs sont exceptionnelles.",
    projectTitle: "Tableau de Bord Financier",
    projectDescription: "Conception d'un dashboard financier complet pour le suivi budgétaire, l'analyse des écarts et la prévision financière d'une PME du secteur industriel.",
    groupPhoto: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
    workPhotos: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
    ],
    projectLink: "https://app.powerbi.com",
  },
];

const Alumni = () => {
  const [selectedAlumni, setSelectedAlumni] = useState<typeof alumniGroups[0] | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    if (selectedAlumni) {
      setCurrentPhotoIndex((prev) => 
        prev === selectedAlumni.workPhotos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (selectedAlumni) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? selectedAlumni.workPhotos.length - 1 : prev - 1
      );
    }
  };

  const openAlumniDetail = (alumni: typeof alumniGroups[0]) => {
    setSelectedAlumni(alumni);
    setCurrentPhotoIndex(0);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Nos Alumni</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Découvrez les projets de nos apprenants
            </h1>
            <p className="text-lg text-muted-foreground">
              Nos alumni appliquent leurs compétences acquises lors des bootcamps pour créer 
              des solutions data innovantes dans leurs entreprises.
            </p>
          </div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alumniGroups.map((alumni) => (
              <Card 
                key={alumni.id} 
                className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card cursor-pointer"
                onClick={() => openAlumniDetail(alumni)}
              >
                {/* Group Photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={alumni.groupPhoto}
                    alt={`Groupe ${alumni.cohort}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {alumni.cohort}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Members */}
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {alumni.members.length} membre{alumni.members.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {alumni.projectTitle}
                  </h3>

                  {/* Members Names */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {alumni.members.map(m => m.name).join(", ")}
                  </p>

                  {/* Testimonial Preview */}
                  <div className="relative bg-muted/50 rounded-lg p-4 mb-4">
                    <Quote className="w-4 h-4 text-primary/40 absolute top-2 left-2" />
                    <p className="text-sm text-muted-foreground italic line-clamp-2 pl-4">
                      {alumni.testimonial}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Voir le projet
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Detail Modal */}
      <Dialog open={!!selectedAlumni} onOpenChange={() => setSelectedAlumni(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAlumni && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    <Calendar className="w-3 h-3 mr-1" />
                    {selectedAlumni.cohort}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">
                  {selectedAlumni.projectTitle}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Group Photo */}
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <img
                    src={selectedAlumni.groupPhoto}
                    alt={`Groupe ${selectedAlumni.cohort}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Team Members */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    L'équipe
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedAlumni.members.map((member, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-4">
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground mb-3">{member.position}</p>
                        <div className="flex gap-2">
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Linkedin className="w-4 h-4 text-primary" />
                          </a>
                          <a
                            href={`mailto:${member.email}`}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-4 h-4 text-primary" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6">
                  <Quote className="w-8 h-8 text-primary/30 mb-2" />
                  <p className="text-foreground italic leading-relaxed">
                    "{selectedAlumni.testimonial}"
                  </p>
                </div>

                {/* Project Description */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">À propos du projet</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedAlumni.projectDescription}
                  </p>
                </div>

                {/* Work Photos Gallery */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Aperçu du travail</h4>
                  <div className="relative">
                    <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                      <img
                        src={selectedAlumni.workPhotos[currentPhotoIndex]}
                        alt={`Travail ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Navigation */}
                    {selectedAlumni.workPhotos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-4">
                      {selectedAlumni.workPhotos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentPhotoIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {selectedAlumni.workPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentPhotoIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Miniature ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Project Link */}
                <Button asChild className="w-full" size="lg">
                  <a
                    href={selectedAlumni.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Accéder au projet
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Alumni;
