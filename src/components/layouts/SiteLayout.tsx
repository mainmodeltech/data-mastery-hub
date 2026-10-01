/**
 * Design-system SiteLayout (Lot 0+, docs/design/README.md §2 — screens/site/Main.dc.html).
 * Drop-in-compatible shape with the existing @/components/layout/Layout.tsx
 * (not swapped into any page yet — that's later-lot work). Composes new
 * SiteHeaderNew/SiteFooterNew rather than the existing Header.tsx/Footer.tsx.
 */
import type { ReactNode } from "react";

import { SiteHeaderNew } from "./SiteHeaderNew";
import { SiteFooterNew } from "./SiteFooterNew";

export interface SiteLayoutProps {
  children: ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-site-bg">
      <SiteHeaderNew />
      <main className="flex-1">{children}</main>
      <SiteFooterNew />
    </div>
  );
}
