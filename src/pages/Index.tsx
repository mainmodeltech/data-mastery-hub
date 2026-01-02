import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ValueProposition } from "@/components/home/ValueProposition";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ReferencesSection } from "@/components/home/ReferencesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ValueProposition />
      <ServicesSection />
      <ReferencesSection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
