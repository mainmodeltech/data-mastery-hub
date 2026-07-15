/**
 * Footer du site public.
 * Utilise les constantes centralisees.
 */

import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram } from 'lucide-react';
import { COMPANY, PUBLIC_NAVIGATION, FOOTER_SERVICES } from '@/config/constants';
import logo from '@/assets/logo.png';

const socialLinks = [
  { name: 'LinkedIn', href: COMPANY.social.linkedin, icon: Linkedin },
  { name: 'Instagram', href: COMPANY.social.instagram, icon: Instagram },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logo} alt={COMPANY.name} className="h-12 w-auto brightness-0 invert mb-4" />
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              {COMPANY.description}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors duration-200"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-3">
              {PUBLIC_NAVIGATION.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-background/70 hover:text-background transition-colors duration-200 text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Nos Services</h3>
            <ul className="space-y-3">
              {FOOTER_SERVICES.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-background/70 hover:text-background transition-colors duration-200 text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-accent" />
                <span className="text-background/70 text-sm">{COMPANY.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <a href={`tel:${COMPANY.phoneRaw}`} className="text-background/70 hover:text-background transition-colors duration-200 text-sm">
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <a href={`mailto:${COMPANY.email}`} className="text-background/70 hover:text-background transition-colors duration-200 text-sm">
                  {COMPANY.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/50 text-sm">
              &copy; {new Date().getFullYear()} {COMPANY.name}. Tous droits reserves.
            </p>
            <p className="text-background/50 text-sm">{COMPANY.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
