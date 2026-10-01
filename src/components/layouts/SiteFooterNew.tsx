/**
 * Design-system site footer (Lot 0-2, docs/design/README.md §2 — screens/site/Main.dc.html).
 * Contenu exact de la référence (identique sur tous les écrans .dc.html).
 */
import { Link } from "react-router-dom";
import { COMPANY } from "@/config/constants";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Formations",
    links: [
      { label: "Cohortes", href: "/formations" },
      { label: "Coaching 1:1", href: "/coaching" },
      { label: "Entreprises", href: "/entreprises" },
      { label: "Quiz d'orientation", href: "/orientation" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/ressources" },
      { label: "Alumni", href: "/alumni" },
      { label: "FAQ", href: "/contact" },
      { label: "À propos", href: "/a-propos" },
      { label: "Devenir partenaire", href: "/partenaires" },
    ],
  },
];

export function SiteFooterNew() {
  return (
    <footer className="bg-navy-dark px-6 py-16 text-[#C9D4E0] lg:px-20">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3.5">
          <span className="font-heading text-xl font-bold text-white">Model Technologie</span>
          <p className="max-w-xs text-sm leading-relaxed">
            Formations data pour professionnels et entreprises. Dakar, Sénégal.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5">
            <h3 className="font-heading text-sm font-bold text-white">{col.title}</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-2.5">
          <h3 className="font-heading text-sm font-bold text-white">Contact</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <a href={`tel:${COMPANY.phoneRaw}`} className="hover:text-white">{COMPANY.phone}</a>
            </li>
            <li>
              <a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a>
            </li>
            <li>
              <a href={COMPANY.social.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
              {" · "}
              <a href={COMPANY.social.instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-xs text-[#8FA5BC]">
        © {new Date().getFullYear()} Model Technologie. Tous droits réservés.
      </div>
    </footer>
  );
}
