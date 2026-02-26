import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { BootcampsSection } from "@/components/home/BootcampsSection";
import { OrientationTeaser } from "@/components/home/OrientationTeaser";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { B2BSection } from "@/components/home/B2BSection";
import { SessionsSection } from "@/components/home/SessionsSection";

const Index = () => {
    return (
        <Layout>
            <HeroSection />
            <StatsSection />
            <BootcampsSection />
            <OrientationTeaser />
            <TestimonialsSection />
            <B2BSection />
            <SessionsSection />
        </Layout>
    );
};

export default Index;
