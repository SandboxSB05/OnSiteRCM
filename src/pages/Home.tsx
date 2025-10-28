import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Integrations } from "@/components/landing/Integrations";
import { CTAFooter } from "@/components/landing/CTAFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Integrations />
      </main>
      <CTAFooter />
    </div>
  );
}
