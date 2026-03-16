/**
 * Page Contact - Formulaire de contact et informations.
 * Refactoree pour utiliser le hook useSendContactMessage et les constantes centralisees.
 */

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Instagram, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSendContactMessage } from '@/hooks/useContacts';
import { COMPANY } from '@/config/constants';
import type { CreateContactMessageDTO } from '@/types';
import {PAGE_SEO, SeoHead} from "@/components/SeoHead.tsx";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const sendMessage = useSendContactMessage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);

    const messageData: CreateContactMessageDTO = {
      firstName: (data.get('firstName') as string).trim(),
      lastName: (data.get('lastName') as string).trim(),
      email: (data.get('email') as string).trim(),
      phone: (data.get('phone') as string)?.trim() || null,
      company: (data.get('company') as string)?.trim() || null,
      subject: (data.get('subject') as string)?.trim() || null,
      message: (data.get('message') as string).trim(),
    };

    sendMessage.mutate(messageData, {
      onSuccess: () => {
        setIsSubmitted(true);
        toast({ title: 'Message envoye !', description: 'Nous vous repondrons dans les plus brefs delais.' });
      },
      onError: () => {
        toast({ title: "Erreur lors de l'envoi", description: 'Veuillez reessayer.', variant: 'destructive' });
      },
    });
  };

  return (
    <Layout>
      <SeoHead {...PAGE_SEO.bootcamps} />
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">Contactez-nous</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">Vous avez un projet de formation ? Une question sur nos programmes ? Nous sommes la pour vous accompagner.</p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,400px] gap-16">
            {/* Form */}
            <div className="order-2 lg:order-1">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Envoyez-nous un message</h2>
              {isSubmitted ? (
                <div className="p-8 bg-accent/10 rounded-2xl border border-accent/30 text-center">
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">Message envoye avec succes !</h3>
                  <p className="text-muted-foreground mb-6">Merci pour votre message. Notre equipe vous repondra dans les 24 heures.</p>
                  <Button onClick={() => setIsSubmitted(false)}>Envoyer un autre message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="firstName">Prenom *</Label><Input id="firstName" name="firstName" placeholder="Votre prenom" required /></div>
                    <div className="space-y-2"><Label htmlFor="lastName">Nom *</Label><Input id="lastName" name="lastName" placeholder="Votre nom" required /></div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="email">Email professionnel *</Label><Input id="email" name="email" type="email" placeholder="votre@email.com" required /></div>
                    <div className="space-y-2"><Label htmlFor="phone">Telephone</Label><Input id="phone" name="phone" type="tel" placeholder={COMPANY.phone} /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="company">Entreprise</Label><Input id="company" name="company" placeholder="Nom de votre entreprise" /></div>
                  <div className="space-y-2"><Label htmlFor="subject">Objet *</Label><Input id="subject" name="subject" placeholder="Comment pouvons-nous vous aider ?" required /></div>
                  <div className="space-y-2"><Label htmlFor="message">Message *</Label><Textarea id="message" name="message" placeholder="Decrivez votre projet ou votre demande..." rows={6} required /></div>
                  <Button type="submit" size="lg" disabled={sendMessage.isPending}>
                    {sendMessage.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours...</>) : (<><Send className="h-4 w-4" />Envoyer le message</>)}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-28 space-y-8">
                <div className="p-8 bg-card rounded-2xl border border-border">
                  <h3 className="font-heading text-xl font-bold text-card-foreground mb-6">Informations de contact</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><MapPin className="h-5 w-5 text-primary" /></div>
                      <div><p className="font-medium text-card-foreground">Adresse</p><p className="text-muted-foreground text-sm">{COMPANY.address}</p></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Phone className="h-5 w-5 text-primary" /></div>
                      <div><p className="font-medium text-card-foreground">Telephone</p><a href={`tel:${COMPANY.phoneRaw}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{COMPANY.phone}</a></div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Mail className="h-5 w-5 text-primary" /></div>
                      <div><p className="font-medium text-card-foreground">Email</p><a href={`mailto:${COMPANY.email}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">{COMPANY.email}</a></div>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white" size="lg">
                  <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" />Discuter sur WhatsApp</a>
                </Button>
                <div className="p-8 bg-card rounded-2xl border border-border">
                  <h3 className="font-heading text-lg font-bold text-card-foreground mb-4">Suivez-nous</h3>
                  <div className="flex gap-4">
                    <a href={COMPANY.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Linkedin className="h-5 w-5" /></a>
                    <a href={COMPANY.social.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"><Instagram className="h-5 w-5" /></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Contact;
