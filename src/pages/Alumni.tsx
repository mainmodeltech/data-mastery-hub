/**
 * Page Alumni - Projets Demo Day et profils des alumni.
 * Refactoree pour utiliser les hooks API.
 */

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap, ExternalLink, Users, Calendar, Linkedin,
  ChevronLeft, ChevronRight, Code, Wrench,
} from 'lucide-react';
import { usePublishedProjects } from '@/hooks/useProjects';
import { usePublishedAlumni } from '@/hooks/useAlumni';
import type { Project } from '@/types';

const Alumni = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: projects, isLoading: loadingProjects } = usePublishedProjects();
  const { data: alumniList, isLoading: loadingAlumni } = usePublishedAlumni();

  const nextPhoto = () => {
    if (selectedProject && selectedProject.screenshots.length > 0) {
      setCurrentPhotoIndex((prev) => prev === selectedProject.screenshots.length - 1 ? 0 : prev + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedProject && selectedProject.screenshots.length > 0) {
      setCurrentPhotoIndex((prev) => prev === 0 ? selectedProject.screenshots.length - 1 : prev - 1);
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Decouvrez nos alumni et leurs realisations</h1>
          <p className="text-lg text-muted-foreground">Nos apprenants qui ont termine les bootcamps et les projets innovants qu'ils ont realises.</p>
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
                  {[...Array(3)].map((_, i) => (<div key={i} className="space-y-4"><Skeleton className="aspect-[4/3] rounded-xl" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>))}
                </div>
              ) : !projects || projects.length === 0 ? (
                <div className="text-center py-20"><Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold text-foreground mb-2">Aucun projet publie</h3><p className="text-muted-foreground">Les projets apparaitront ici une fois publies.</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                    <Card key={project.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card cursor-pointer" onClick={() => openProjectDetail(project)}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {project.coverImageUrl ? (
                          <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : project.screenshots.length > 0 ? (
                          <img src={project.screenshots[0].photoUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Code className="w-16 h-16 text-muted-foreground/40" /></div>
                        )}
                        {project.cohort && (<div className="absolute top-4 left-4"><Badge className="bg-primary text-primary-foreground"><Calendar className="w-3 h-3 mr-1" />{project.cohort}</Badge></div>)}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">{project.members.length} membre{project.members.length > 1 ? 's' : ''}</span></div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                        {project.members.length > 0 && (<p className="text-sm text-muted-foreground mb-3">{project.members.map((m) => m.alumni?.name).filter(Boolean).join(', ')}</p>)}
                        {project.toolsTechnologies && project.toolsTechnologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {project.toolsTechnologies.slice(0, 4).map((t) => (<Badge key={t} variant="outline" className="text-xs">{t}</Badge>))}
                            {project.toolsTechnologies.length > 4 && (<Badge variant="outline" className="text-xs">+{project.toolsTechnologies.length - 4}</Badge>)}
                          </div>
                        )}
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">Voir le projet <ExternalLink className="w-4 h-4 ml-2" /></Button>
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
                  {[...Array(4)].map((_, i) => (<div key={i} className="space-y-3"><Skeleton className="w-20 h-20 rounded-full mx-auto" /><Skeleton className="h-5 w-3/4 mx-auto" /><Skeleton className="h-4 w-1/2 mx-auto" /></div>))}
                </div>
              ) : !alumniList || alumniList.length === 0 ? (
                <div className="text-center py-20"><GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold text-foreground mb-2">Aucun alumni publie</h3><p className="text-muted-foreground">Les alumni apparaitront ici une fois publies.</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {alumniList.map((person) => (
                    <div key={person.id} className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-all">
                      {person.photoUrl ? (
                        <img src={person.photoUrl} alt={person.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" loading="lazy" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><GraduationCap className="w-8 h-8 text-primary" /></div>
                      )}
                      <h4 className="font-semibold text-foreground mb-1">{person.name}</h4>
                      {person.currentTitle && <p className="text-sm text-primary font-medium">{person.currentTitle}</p>}
                      {person.currentPosition && <p className="text-sm text-muted-foreground">{person.currentPosition}</p>}
                      {person.cohort && <Badge variant="secondary" className="mt-3">{person.cohort}</Badge>}
                      {person.linkedinUrl && (<a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"><Linkedin className="w-4 h-4" /> LinkedIn</a>)}
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
                  {selectedProject.cohort && (<Badge variant="secondary"><Calendar className="w-3 h-3 mr-1" />{selectedProject.cohort}</Badge>)}
                  {selectedProject.toolsTechnologies?.map((t) => (<Badge key={t} variant="outline">{t}</Badge>))}
                </div>
                <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {selectedProject.description && (<div><h4 className="font-semibold text-foreground mb-2">A propos du projet</h4><p className="text-muted-foreground leading-relaxed">{selectedProject.description}</p></div>)}
                {selectedProject.toolsTechnologies && selectedProject.toolsTechnologies.length > 0 && (
                  <div><h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Wrench className="w-5 h-5 text-primary" />Outils & Technologies</h4><div className="flex flex-wrap gap-2">{selectedProject.toolsTechnologies.map((t) => (<Badge key={t} variant="secondary">{t}</Badge>))}</div></div>
                )}
                {selectedProject.members.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />L'equipe</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedProject.members.map((member) => (
                        <div key={member.id} className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
                          {member.alumni?.photoUrl ? (<img src={member.alumni.photoUrl} alt={member.alumni.name} className="w-10 h-10 rounded-full object-cover" />) : (<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-primary" /></div>)}
                          <div className="flex-1 min-w-0"><p className="font-medium text-foreground text-sm">{member.alumni?.name}</p>{member.alumni?.currentPosition && <p className="text-xs text-muted-foreground">{member.alumni.currentPosition}</p>}</div>
                          {member.alumni?.linkedinUrl && (<a href={member.alumni.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors" onClick={(e) => e.stopPropagation()}><Linkedin className="w-4 h-4 text-primary" /></a>)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProject.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Captures d'ecran</h4>
                    <div className="relative">
                      <div className="aspect-video rounded-xl overflow-hidden bg-muted"><img src={selectedProject.screenshots[currentPhotoIndex].photoUrl} alt={selectedProject.screenshots[currentPhotoIndex].caption || `Capture ${currentPhotoIndex + 1}`} className="w-full h-full object-cover" /></div>
                      {selectedProject.screenshots.length > 1 && (
                        <>
                          <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                          <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors"><ChevronRight className="w-5 h-5" /></button>
                        </>
                      )}
                      {selectedProject.screenshots.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {selectedProject.screenshots.map((s, idx) => (
                            <button key={idx} onClick={() => setCurrentPhotoIndex(idx)} className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${idx === currentPhotoIndex ? 'border-primary' : 'border-transparent'}`}>
                              <img src={s.photoUrl} alt={s.caption || `Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedProject.accessLink && (<Button asChild className="w-full" size="lg"><a href={selectedProject.accessLink} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 mr-2" />Acceder au projet</a></Button>)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Alumni;
