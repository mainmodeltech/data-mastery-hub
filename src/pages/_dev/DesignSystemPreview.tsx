/**
 * Dev-only visual check for Lot 0 (tokens + shared components + layouts).
 * Mounted behind import.meta.env.DEV in App.tsx at /_dev/design-system — absent
 * from production builds. Compare against docs/design/screens/site/Main.dc.html
 * and docs/design/screens/app/App-Apprenant.dc.html.
 */
import { BookOpen, CalendarDays, GraduationCap, LayoutDashboard } from "lucide-react";

import { Button, Pill, ProgressBar, Card, SectionHeader } from "@/components/shared";
import { SiteLayout } from "@/components/layouts/SiteLayout";
import { AppLayout, type AppNavItem } from "@/components/layouts/AppLayout";

const DEMO_NAV: AppNavItem[] = [
  { href: "/_dev/design-system", label: "Mon espace", icon: LayoutDashboard, exact: true },
  { href: "/_dev/design-system/formations", label: "Mes formations", icon: BookOpen },
  { href: "/_dev/design-system/calendrier", label: "Calendrier & lives", icon: CalendarDays },
  { href: "/_dev/design-system/certificats", label: "Certificats", icon: GraduationCap },
];

function ComponentsShowcase() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
      <SectionHeader
        eyebrow="LOT 0 — APERÇU"
        title="Composants partagés"
        description="Button, Pill, ProgressBar, Card, SectionHeader — tokens navy/cta/radii du nouveau design system."
      />

      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-lg font-bold text-navy">Button</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Candidater</Button>
          <Button variant="navy">Rejoindre</Button>
          <Button variant="outline">Former mon équipe</Button>
          <Button variant="primary" shape="rounded">Continuer la leçon</Button>
          <Button variant="outline" shape="rounded">Voir le programme</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-lg font-bold text-navy">Pill</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Pill variant="info">En cours</Pill>
          <Pill variant="success">Certifiée</Pill>
          <Pill variant="warning">Avant le 15</Pill>
          <Pill variant="error">Nouveau</Pill>
          <Pill variant="neutral">À venir</Pill>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-lg font-bold text-navy">ProgressBar</h3>
        <div className="flex max-w-sm flex-col gap-4">
          <ProgressBar value={64} aria-label="Progression du cours" />
          <div className="rounded-hero bg-navy p-6">
            <ProgressBar value={40} variant="accent-on-navy" aria-label="Progression (sur fond navy)" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-lg font-bold text-navy">Card</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card radius="stat" className="p-6">
            <p className="text-sm text-ink-secondary">Heures suivies</p>
            <p className="font-heading text-2xl font-extrabold text-navy">42h</p>
          </Card>
          <Card variant="sand" radius="card" className="p-6">
            <p className="text-sm text-ink-secondary">Score moyen quiz</p>
            <p className="font-heading text-2xl font-extrabold text-navy">87%</p>
          </Card>
          <Card variant="navy" radius="hero" shadow className="p-6">
            <p className="text-sm text-cta-on-navy">Prochaine session</p>
            <p className="font-heading text-2xl font-extrabold text-white">12 janv.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DesignSystemPreview() {
  return (
    <SiteLayout>
      <ComponentsShowcase />

      <div className="border-t border-[#E7E0D4]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <SectionHeader eyebrow="LOT 0 — APERÇU" title="AppLayout" align="left" />
        </div>
        <div className="h-[640px] overflow-hidden">
          <AppLayout
            navItems={DEMO_NAV}
            greeting="Bonjour, Awa 👋"
            helpSlot={
              <div className="flex flex-col gap-2 text-white">
                <p className="font-heading text-sm font-bold">Besoin d'aide ?</p>
                <p className="text-xs text-[#C9D4E0]">Écrivez à votre formateur.</p>
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Card radius="stat" className="p-6">
                <p className="text-sm text-ink-secondary">Mes formations</p>
                <p className="font-heading text-2xl font-extrabold text-navy">3 en cours</p>
              </Card>
              <Card radius="stat" className="p-6">
                <p className="text-sm text-ink-secondary">Certificats</p>
                <p className="font-heading text-2xl font-extrabold text-navy">1 obtenu</p>
              </Card>
            </div>
          </AppLayout>
        </div>
      </div>
    </SiteLayout>
  );
}
