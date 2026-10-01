/**
 * Accordion FAQ réutilisé sur plusieurs pages (Coaching, Contact, Formations…).
 * Les écrans de référence (docs/design/screens/site/*.dc.html) ne montrent que les
 * questions à l'état replié ; les réponses ci-dessous sont rédigées pour rester
 * cohérentes avec le reste du site (paiement Wave/Orange Money/virement, Dakar…).
 */
import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={item.question} className="border-b border-[#E7E0D4] py-4 first:border-t">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 text-left"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span className="font-heading font-bold text-navy">{item.question}</span>
            <span className="shrink-0 text-xl text-ink-secondary">{openIndex === i ? "−" : "+"}</span>
          </button>
          {openIndex === i && <p className="mt-3 text-sm text-ink-secondary">{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}
