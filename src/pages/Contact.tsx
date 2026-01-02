import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle,
  Linkedin,
  Instagram,
  Send,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Contactez-nous
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Vous avez un projet de formation ? Une question sur nos programmes ? 
              Nous sommes là pour vous accompagner.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,400px] gap-16">
            {/* Form */}
            <div className="order-2 lg:order-1">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Envoyez-nous un message
              </h2>

              {isSubmitted ? (
                <div className="p-8 bg-accent/10 rounded-2xl border border-accent/30 text-center">
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    Message envoyé avec succès !
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Merci pour votre message. Notre équipe vous répondra dans les 24 heures.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)}>
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+221 77 000 00 00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Objet *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Comment pouvons-nous vous aider ?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Décrivez votre projet ou votre demande..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-28 space-y-8">
                <div className="p-8 bg-card rounded-2xl border border-border">
                  <h3 className="font-heading text-xl font-bold text-card-foreground mb-6">
                    Informations de contact
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Adresse</p>
                        <p className="text-muted-foreground text-sm">
                          Dakar, Sénégal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Téléphone</p>
                        <a
                          href="tel:+221770000000"
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          +221 77 000 00 00
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Email</p>
                        <a
                          href="mailto:contact@modeltechnologie.com"
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          contact@modeltechnologie.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <Button
                  asChild
                  className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-primary-foreground"
                  size="lg"
                >
                  <a
                    href="https://wa.me/221770000000"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Discuter sur WhatsApp
                  </a>
                </Button>

                {/* Social Links */}
                <div className="p-8 bg-card rounded-2xl border border-border">
                  <h3 className="font-heading text-lg font-bold text-card-foreground mb-4">
                    Suivez-nous
                  </h3>
                  <div className="flex gap-4">
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
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
