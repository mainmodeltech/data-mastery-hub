/**
 * Design-system site footer (Lot 0+, docs/design/README.md §2 — screens/site/Main.dc.html).
 * Net-new, separate from @/components/layout/Footer.tsx (kept unchanged).
 */
const COLUMNS = [
  {
    title: "Navigation",
    links: ["Formations", "Coaching", "Entreprises", "Alumni"],
  },
  {
    title: "Ressources",
    links: ["Blog", "Quiz d'orientation", "Téléchargements"],
  },
  {
    title: "Contact",
    links: ["Dakar, Sénégal", "+221 78 631 04 32", "contact@model-technologie.com"],
  },
];

export function SiteFooterNew() {
  return (
    <footer className="bg-navy-dark px-6 py-16 text-[#C9D4E0] lg:px-20">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white font-heading text-lg font-extrabold text-navy">
            M
          </span>
          <p className="font-heading text-sm font-bold text-white">Model Technologie</p>
          <p className="max-w-xs text-sm">
            École de data analytics à Dakar — formations Power BI, Python, SQL et Excel Finance.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-bold text-white">{col.title}</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {col.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-xs text-[#8FA5BC]">
        © {new Date().getFullYear()} Model Technologie. Tous droits réservés.
      </div>
    </footer>
  );
}
