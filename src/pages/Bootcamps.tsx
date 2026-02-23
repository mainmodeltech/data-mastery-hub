/**
 * Page Bootcamps - Liste des bootcamps et formulaire d'inscription.
 * Refactoree pour utiliser les hooks API et les constantes centralisees.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Calendar, Clock, Users, Award, ArrowRight, CheckCircle, Download, Send, Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePublishedBootcamps } from '@/hooks/useBootcamps';
import { useCreateRegistration } from '@/hooks/useRegistrations';
import { FALLBACK_BOOTCAMPS } from '@/config/constants';
import type { Bootcamp, CreateRegistrationDTO } from '@/types';

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
  firstName: '', lastName: '', email: '', phone: '', company: '', position: '', message: '',
};

const Bootcamps = () => {
  const { toast } = useToast();
  const [selectedBootcamp, setSelectedBootcamp] = useState<Bootcamp | null>(null);
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const { data: bootcamps, isLoading } = usePublishedBootcamps();
  const createRegistration = useCreateRegistration();

  const displayBootcamps: Bootcamp[] =
    bootcamps && bootcamps.length > 0
      ? bootcamps
      : (FALLBACK_BOOTCAMPS.map((b) => ({ ...b, createdAt: '', updatedAt: '' })) as unknown as Bootcamp[]);

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

    const registrationData: CreateRegistrationDTO = {
      bootcampId: selectedBootcamp.id.startsWith('static-') ? null : selectedBootcamp.id,
      bootcampTitle: selectedBootcamp.title,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      position: form.position.trim() || null,
      message: form.message.trim() || null,
    };

    createRegistration.mutate(registrationData, {
      onSuccess: () => {
        setSubmitted(true);
        toast({ title: 'Inscription envoyee !', description: 'Nous vous contacterons dans les 24h pour confirmer votre place.' });
      },
      onError: () => {
        toast({ title: "Erreur lors de l'inscription", description: 'Veuillez reessayer ou nous contacter directement.', variant: 'destructive' });
      },
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">Bootcamps & Formations</h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Des programmes intensifs pour une montee en competences rapide. Formations pratiques, cas reels et certification.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => document.getElementById('bootcamps-list')?.scrollIntoView({ behavior: 'smooth' })}>
                Voir les sessions
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#" download><Download className="h-4 w-4" />Telecharger le catalogue</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bootcamps List */}
      <section id="bootcamps-list" className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-8">
              {displayBootcamps.map((bootcamp, index) => (
                <div
                  key={bootcamp.id}
                  className={`relative p-8 lg:p-10 rounded-2xl border transition-all duration-300 opacity-0 animate-fade-in ${
                    bootcamp.featured ? 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30' : 'bg-card border-border'
                  }`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {bootcamp.featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">Prochaine session</div>
                  )}
                  <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
                    <div>
                      <h3 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-4">{bootcamp.title}</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">{bootcamp.description}</p>
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {bootcamp.duration && (
                          <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Duree</p><p className="text-sm font-medium text-foreground">{bootcamp.duration}</p></div></div>
                        )}
                        {bootcamp.audience && (
                          <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Public cible</p><p className="text-sm font-medium text-foreground">{bootcamp.audience}</p></div></div>
                        )}
                        {bootcamp.prerequisites && (
                          <div className="flex items-center gap-3"><Award className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Prerequis</p><p className="text-sm font-medium text-foreground">{bootcamp.prerequisites}</p></div></div>
                        )}
                        {bootcamp.nextSession && (
                          <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-accent" /><div><p className="text-xs text-muted-foreground">Prochaine session</p><p className="text-sm font-medium text-accent">{bootcamp.nextSession}</p></div></div>
                        )}
                      </div>
                      {bootcamp.benefits && bootcamp.benefits.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-3">Ce que vous apprendrez :</p>
                          <ul className="grid sm:grid-cols-2 gap-2">
                            {bootcamp.benefits.map((benefit) => (
                              <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />{benefit}</li>
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
                        <Button className="w-full" size="lg" onClick={() => openRegistration(bootcamp)}>S'inscrire<ArrowRight className="h-4 w-4" /></Button>
                        <Button asChild variant="outline" className="w-full"><Link to="/contact">En savoir plus</Link></Button>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Besoin d'une formation sur-mesure ?</h2>
            <p className="text-muted-foreground text-lg mb-8">Nous pouvons adapter nos bootcamps a vos besoins specifiques ou creer un programme entierement personnalise.</p>
            <Button asChild size="lg"><Link to="/contact">Discutons de votre projet<ArrowRight className="h-5 w-5" /></Link></Button>
          </div>
        </div>
      </section>

      {/* Registration Dialog */}
      <Dialog open={!!selectedBootcamp} onOpenChange={(open) => !open && setSelectedBootcamp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Inscription au bootcamp</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{selectedBootcamp?.title}</p>
                {selectedBootcamp?.nextSession && (<p className="flex items-center gap-1.5 text-sm"><Calendar className="h-3.5 w-3.5 text-accent" /><span className="text-accent font-medium">{selectedBootcamp.nextSession}</span></p>)}
                {selectedBootcamp?.price && (<p className="text-sm text-muted-foreground">Tarif : <span className="font-semibold text-foreground">{selectedBootcamp.price}</span></p>)}
              </div>
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">Inscription envoyee !</h3>
              <p className="text-muted-foreground mb-6">Merci pour votre interet. Notre equipe vous contactera dans les 24h pour confirmer votre inscription et vous communiquer les details de paiement.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setSelectedBootcamp(null)} variant="outline">Fermer</Button>
                <Button onClick={() => { setSubmitted(false); setForm(initialForm); }}>Nouvelle inscription</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="reg-firstName">Prenom *</Label><Input id="reg-firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Votre prenom" required /></div>
                <div className="space-y-2"><Label htmlFor="reg-lastName">Nom *</Label><Input id="reg-lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Votre nom" required /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="reg-email">Email *</Label><Input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" required /></div>
                <div className="space-y-2"><Label htmlFor="reg-phone">Telephone</Label><Input id="reg-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+221 77 000 00 00" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="reg-company">Entreprise</Label><Input id="reg-company" name="company" value={form.company} onChange={handleChange} placeholder="Nom de votre entreprise" /></div>
                <div className="space-y-2"><Label htmlFor="reg-position">Poste / Fonction</Label><Input id="reg-position" name="position" value={form.position} onChange={handleChange} placeholder="Votre poste actuel" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="reg-message">Message (optionnel)</Label><Textarea id="reg-message" name="message" value={form.message} onChange={handleChange} placeholder="Questions, besoins particuliers..." rows={3} /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedBootcamp(null)}>Annuler</Button>
                <Button type="submit" className="flex-1" disabled={createRegistration.isPending}>
                  {createRegistration.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours...</>) : (<><Send className="h-4 w-4" />Envoyer ma candidature</>)}
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
