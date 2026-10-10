/**
 * Design-system site footer (Lot 0-2, docs/design/README.md §2 — screens/site/Main.dc.html).
 * Colonnes, coordonnées et mentions servies par le backend (contenus `site.nav` et `site.company`).
 */
import { Link } from "react-router-dom";
import { LogoChip } from "@/components/shared/Logo";
import { useSiteContent } from "@/hooks/useSiteContent";

export function SiteFooterNew() {
  const { content: nav } = useSiteContent("site.nav");
  const { content: company } = useSiteContent("site.company");
  const footer = nav?.footer;

  return (
    <footer className="bg-navy-dark px-6 py-16 text-[#C9D4E0] lg:px-20">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3.5">
          <LogoChip className="h-16" />
          {footer && <p className="max-w-xs text-sm leading-relaxed">{footer.about}</p>}
        </div>

        {footer?.columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5">
            <h3 className="font-heading text-sm font-bold text-white">{col.title}</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {col.links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link to={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {footer && company && (
          <div className="flex flex-col gap-2.5">
            <h3 className="font-heading text-sm font-bold text-white">{footer.contactTitle}</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a href={`tel:${company.phoneRaw}`} className="hover:text-white">{company.phone}</a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a>
              </li>
              <li>
                <a href={company.social.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
                {" · "}
                <a href={company.social.instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
              </li>
            </ul>
          </div>
        )}
      </div>

      {footer && company && (
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-[#8FA5BC]">
          © {new Date().getFullYear()} {company.name}. {footer.rights}
        </div>
      )}
    </footer>
  );
}
