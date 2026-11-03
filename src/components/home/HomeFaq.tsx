/**
 * HomeFaq — les questions fréquentes de l'accueil, en tuiles pleines (pas de filets) : chaque question est un bloc de sable qui prend l'accent
 * de la marque en s'ouvrant. Les `<details name="…">` natifs donnent l'accordéon exclusif, le clavier et les lecteurs d'écran sans script.
 */
import type { FaqItem } from "@/components/shared/FaqAccordion";

interface Props {
  items: FaqItem[];
}

export function HomeFaq({ items }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          name="home-faq"
          className="group rounded-2xl bg-surface-sand px-6 py-5 text-navy open:bg-navy open:text-white"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-bold [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xl leading-none text-white group-open:bg-cta"
              aria-hidden="true"
            >
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/90">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
