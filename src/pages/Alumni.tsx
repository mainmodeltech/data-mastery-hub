import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { supabase } from "@/integrations/supabase/client";

type AlumniMember = {
  id: string;
  name: string;
  position: string | null;
  linkedin_url: string | null;
  email: string | null;
};

type AlumniWorkPhoto = {
  id: string;
  photo_url: string;
  caption: string | null;
};

type AlumniGroup = {
  id: string;
  cohort: string;
  year: number;
  project_title: string;
  project_description: string | null;
  project_link: string | null;
  group_photo_url: string | null;
  testimonial: string | null;
  members: AlumniMember[];
  work_photos: AlumniWorkPhoto[];
};

const Alumni = () => {
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniGroup | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: groups, isLoading } = useQuery({
    queryKey: ["alumni-groups"],
    queryFn: async () => {
      const { data: groupsData, error: groupsError } = await supabase
        .from("alumni_groups")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (groupsError) throw groupsError;

      if (!groupsData || groupsData.length === 0) return [];

      const groupIds = groupsData.map(g => g.id);

      const [membersRes, photosRes] = await Promise.all([
        supabase.from("alumni_members").select("*").in("group_id", groupIds).order("display_order"),
        supabase.from("alumni_work_photos").select("*").in("group_id", groupIds).order("display_order"),
      ]);

      return groupsData.map(group => ({
        ...group,
        members: (membersRes.data || []).filter(m => m.group_id === group.id),
        work_photos: (photosRes.data || []).filter(p => p.group_id === group.id),
      })) as AlumniGroup[];
    },
  });

  const nextPhoto = () => {
    if (selectedAlumni && selectedAlumni.work_photos.length > 0) {
      setCurrentPhotoIndex(prev => 
        prev === selectedAlumni.work_photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (selectedAlumni && selectedAlumni.work_photos.length > 0) {
      setCurrentPhotoIndex(prev => 
        prev === 0 ? selectedAlumni.work_photos.length - 1 : prev - 1
      );
    }
  };

  const openAlumniDetail = (alumni: AlumniGroup) => {
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
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : !groups || groups.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun groupe alumni publié</h3>
              <p className="text-muted-foreground">Les groupes alumni apparaîtront ici une fois publiés depuis le backoffice.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups.map((alumni) => (
                <Card 
                  key={alumni.id} 
                  className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card cursor-pointer"
                  onClick={() => openAlumniDetail(alumni)}
                >
                  {/* Group Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {alumni.group_photo_url ? (
                      <img
                        src={alumni.group_photo_url}
                        alt={`Groupe ${alumni.cohort}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-muted-foreground/40" />
                      </div>
                    )}
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
                      {alumni.project_title}
                    </h3>

                    {/* Members Names */}
                    {alumni.members.length > 0 && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {alumni.members.map(m => m.name).join(", ")}
                      </p>
                    )}

                    {/* Testimonial Preview */}
                    {alumni.testimonial && (
                      <div className="relative bg-muted/50 rounded-lg p-4 mb-4">
                        <Quote className="w-4 h-4 text-primary/40 absolute top-2 left-2" />
                        <p className="text-sm text-muted-foreground italic line-clamp-2 pl-4">
                          {alumni.testimonial}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Voir le projet
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                  {selectedAlumni.project_title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Group Photo */}
                {selectedAlumni.group_photo_url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img
                      src={selectedAlumni.group_photo_url}
                      alt={`Groupe ${selectedAlumni.cohort}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Team Members */}
                {selectedAlumni.members.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      L'équipe
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedAlumni.members.map((member) => (
                        <div key={member.id} className="bg-muted/50 rounded-lg p-4">
                          <p className="font-medium text-foreground">{member.name}</p>
                          {member.position && (
                            <p className="text-sm text-muted-foreground mb-3">{member.position}</p>
                          )}
                          <div className="flex gap-2">
                            {member.linkedin_url && (
                              <a
                                href={member.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Linkedin className="w-4 h-4 text-primary" />
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="w-4 h-4 text-primary" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Testimonial */}
                {selectedAlumni.testimonial && (
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6">
                    <Quote className="w-8 h-8 text-primary/30 mb-2" />
                    <p className="text-foreground italic leading-relaxed">
                      "{selectedAlumni.testimonial}"
                    </p>
                  </div>
                )}

                {/* Project Description */}
                {selectedAlumni.project_description && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">À propos du projet</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAlumni.project_description}
                    </p>
                  </div>
                )}

                {/* Work Photos Gallery */}
                {selectedAlumni.work_photos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Aperçu du travail</h4>
                    <div className="relative">
                      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                        <img
                          src={selectedAlumni.work_photos[currentPhotoIndex].photo_url}
                          alt={selectedAlumni.work_photos[currentPhotoIndex].caption || `Travail ${currentPhotoIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {selectedAlumni.work_photos.length > 1 && (
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

                      <div className="flex justify-center gap-2 mt-4">
                        {selectedAlumni.work_photos.map((_, idx) => (
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

                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {selectedAlumni.work_photos.map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                            idx === currentPhotoIndex ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={photo.photo_url}
                            alt={photo.caption || `Miniature ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Link */}
                {selectedAlumni.project_link && (
                  <Button asChild className="w-full" size="lg">
                    <a
                      href={selectedAlumni.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Accéder au projet
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Alumni;
