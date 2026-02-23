import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap, ExternalLink, Users, Calendar, Linkedin, Mail,
  ChevronLeft, ChevronRight, Code, Wrench
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ProjectMember = {
  id: string;
  alumni: {
    id: string;
    name: string;
    current_title: string | null;
    current_position: string | null;
    linkedin_url: string | null;
    photo_url: string | null;
  };
};

type ProjectScreenshot = {
  id: string;
  photo_url: string;
  caption: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  tools_technologies: string[] | null;
  access_link: string | null;
  cover_image_url: string | null;
  cohort: string | null;
  year: number | null;
  members: ProjectMember[];
  screenshots: ProjectScreenshot[];
};

type AlumniPerson = {
  id: string;
  name: string;
  current_title: string | null;
  current_position: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  cohort: string | null;
};

const Alumni = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects-public"],
    queryFn: async () => {
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("year", { ascending: false });
      if (error) throw error;
      if (!projectsData || projectsData.length === 0) return [];

      const projectIds = projectsData.map(p => p.id);
      const [membersRes, shotsRes] = await Promise.all([
        supabase.from("project_members").select("*, alumni:alumni_id(id, name, current_title, current_position, linkedin_url, photo_url)").in("project_id", projectIds).order("display_order"),
        supabase.from("project_screenshots").select("*").in("project_id", projectIds).order("display_order"),
      ]);

      return projectsData.map(p => ({
        ...p,
        members: (membersRes.data || []).filter(m => m.project_id === p.id) as ProjectMember[],
        screenshots: (shotsRes.data || []).filter(s => s.project_id === p.id) as ProjectScreenshot[],
      })) as Project[];
    },
  });

  const { data: alumniList, isLoading: loadingAlumni } = useQuery({
    queryKey: ["alumni-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni")
        .select("id, name, current_title, current_position, linkedin_url, photo_url, cohort")
        .eq("published", true)
        .order("display_order");
      if (error) throw error;
      return (data || []) as AlumniPerson[];
    },
  });

  const nextPhoto = () => {
    if (selectedProject && selectedProject.screenshots.length > 0) {
      setCurrentPhotoIndex(prev => prev === selectedProject.screenshots.length - 1 ? 0 : prev + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedProject && selectedProject.screenshots.length > 0) {
      setCurrentPhotoIndex(prev => prev === 0 ? selectedProject.screenshots.length - 1 : prev - 1);
    }
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setCurrentPhotoIndex(0);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nos Alumni & Projets</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Découvrez nos alumni et leurs réalisations
          </h1>
          <p className="text-lg text-muted-foreground">
            Nos apprenants qui ont terminé les bootcamps et les projets innovants qu'ils ont réalisés.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="projects">Projets</TabsTrigger>
              <TabsTrigger value="alumni">Alumni</TabsTrigger>
            </TabsList>

            {/* PROJECTS TAB */}
            <TabsContent value="projects">
              {loadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[4/3] rounded-xl" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : !projects || projects.length === 0 ? (
                <div className="text-center py-20">
                  <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Aucun projet publié</h3>
                  <p className="text-muted-foreground">Les projets apparaîtront ici une fois publiés.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                    <Card
                      key={project.id}
                      className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card cursor-pointer"
                      onClick={() => openProjectDetail(project)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {project.cover_image_url ? (
                          <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : project.screenshots.length > 0 ? (
                          <img src={project.screenshots[0].photo_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Code className="w-16 h-16 text-muted-foreground/40" />
                          </div>
                        )}
                        {project.cohort && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-primary text-primary-foreground"><Calendar className="w-3 h-3 mr-1" />{project.cohort}</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{project.members.length} membre{project.members.length > 1 ? "s" : ""}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                        {project.members.length > 0 && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {project.members.map(m => m.alumni?.name).filter(Boolean).join(", ")}
                          </p>
                        )}
                        {project.tools_technologies && project.tools_technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {project.tools_technologies.slice(0, 4).map(t => (
                              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                            ))}
                            {project.tools_technologies.length > 4 && <Badge variant="outline" className="text-xs">+{project.tools_technologies.length - 4}</Badge>}
                          </div>
                        )}
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Voir le projet <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ALUMNI TAB */}
            <TabsContent value="alumni">
              {loadingAlumni ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                      <Skeleton className="h-5 w-3/4 mx-auto" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : !alumniList || alumniList.length === 0 ? (
                <div className="text-center py-20">
                  <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Aucun alumni publié</h3>
                  <p className="text-muted-foreground">Les alumni apparaîtront ici une fois publiés.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {alumniList.map((person) => (
                    <div key={person.id} className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-all">
                      {person.photo_url ? (
                        <img src={person.photo_url} alt={person.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <h4 className="font-semibold text-foreground mb-1">{person.name}</h4>
                      {person.current_title && <p className="text-sm text-primary font-medium">{person.current_title}</p>}
                      {person.current_position && <p className="text-sm text-muted-foreground">{person.current_position}</p>}
                      {person.cohort && <Badge variant="secondary" className="mt-3">{person.cohort}</Badge>}
                      {person.linkedin_url && (
                        <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3">
                          <Linkedin className="w-4 h-4" /> LinkedIn
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {selectedProject.cohort && <Badge variant="secondary"><Calendar className="w-3 h-3 mr-1" />{selectedProject.cohort}</Badge>}
                  {selectedProject.tools_technologies?.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
                </div>
                <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                {selectedProject.description && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">À propos du projet</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedProject.description}</p>
                  </div>
                )}

                {/* Tools */}
                {selectedProject.tools_technologies && selectedProject.tools_technologies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Wrench className="w-5 h-5 text-primary" />Outils & Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tools_technologies.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Team */}
                {selectedProject.members.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />L'équipe</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedProject.members.map((member) => (
                        <div key={member.id} className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
                          {member.alumni?.photo_url ? (
                            <img src={member.alumni.photo_url} alt={member.alumni.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{member.alumni?.name}</p>
                            {member.alumni?.current_position && <p className="text-xs text-muted-foreground">{member.alumni.current_position}</p>}
                          </div>
                          {member.alumni?.linkedin_url && (
                            <a href={member.alumni.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors" onClick={e => e.stopPropagation()}>
                              <Linkedin className="w-4 h-4 text-primary" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screenshots Gallery */}
                {selectedProject.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Captures d'écran</h4>
                    <div className="relative">
                      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                        <img src={selectedProject.screenshots[currentPhotoIndex].photo_url} alt={selectedProject.screenshots[currentPhotoIndex].caption || `Capture ${currentPhotoIndex + 1}`} className="w-full h-full object-cover" />
                      </div>
                      {selectedProject.screenshots.length > 1 && (
                        <>
                          <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                          <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors"><ChevronRight className="w-5 h-5" /></button>
                        </>
                      )}
                      {selectedProject.screenshots.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {selectedProject.screenshots.map((s, idx) => (
                            <button key={idx} onClick={() => setCurrentPhotoIndex(idx)} className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${idx === currentPhotoIndex ? "border-primary" : "border-transparent"}`}>
                              <img src={s.photo_url} alt={s.caption || `Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Access link */}
                {selectedProject.access_link && (
                  <Button asChild className="w-full" size="lg">
                    <a href={selectedProject.access_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />Accéder au projet
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
