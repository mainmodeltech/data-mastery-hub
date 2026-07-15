import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { BootcampsSection } from "@/components/home/BootcampsSection";
import { HumanProofSection } from "@/components/home/HumanProofSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ReferencesSection } from "@/components/home/ReferencesSection";
import { B2BSection } from "@/components/home/B2BSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { SeoHead, PAGE_SEO } from "@/components/SeoHead";

// Structure volontairement resserrée (6 blocs, contre 8 avant) — voir
// docs/redesign-diagnostic.md. OrientationTeaser et SessionsSection ont été
// retirés de l'accueil : redondants avec le hero (lien quiz) et le catalogue
// (durée/prix déjà affichés sur chaque carte formation).
const Index = () => {
    return (
        <Layout>
            <SeoHead {...PAGE_SEO.home} />
            <HeroSection />
            <StatsSection />
            <BootcampsSection />
            <HumanProofSection />
            <ReferencesSection />
            <B2BSection />
            <TestimonialsSection />
            <FinalCtaSection />
        </Layout>
    );
};

export default Index;
