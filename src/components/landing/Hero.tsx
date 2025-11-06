import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
          <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full mb-6">
            <span style={{ fontSize: '0.875rem' }}>Trusted by 500+ contractors</span>
          </div>
          
          <h1 className="mb-6" style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Simplify communication between contractors and homeowners
          </h1>
          
          <p className="mb-8 text-muted-foreground mx-auto max-w-2xl" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
            OnSite connects to your CRM and helps you send professional project updates 
            without leaving your workflow. Build trust through transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Book a Demo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-8 justify-center">
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>98%</div>
              <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Client Satisfaction</div>
            </div>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>50K+</div>
              <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Updates Sent</div>
            </div>
            <div>
              <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>24/7</div>
              <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

