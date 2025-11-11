import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from '@/assets/hero-mockup.png';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 -z-10"></div>
      
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <a href="#interactive-demo" className="inline-block relative mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full">
            <div className="animate-border rounded-full p-[1px] bg-gradient-to-r from-[#000000] via-[#0066cc] to-[#000000] bg-[length:400%_400%]">
              <div className="px-3 py-1 rounded-full bg-white hover:bg-gray-50 transition-colors">
                <span style={{ fontSize: '0.875rem' }} className="text-gray-800">
                  Experience our interactive demo
                </span>
              </div>
            </div>
          </a>
          
          <h1 className="mb-6" style={{ fontSize: '3.5rem', fontWeight: 550, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Jobsite communication
            <span className="block">simplified.</span>
          </h1>
          
          <p className="mb-8 text-muted-foreground mx-auto max-w-2xl" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
            Relay connects your crews, clients, and CRM with automated updates that keep everyone aligned.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/henry-relaycxp/30min"
              target="_blank"
              rel="noreferrer"
            >
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Book a Demo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <a href="#features">
              <Button variant="outline">
                Learn More
              </Button>
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
