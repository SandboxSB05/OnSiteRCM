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
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
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
            
            <p className="mb-8 text-muted-foreground" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
              OnSite connects to your CRM and helps you send professional project updates 
              without leaving your workflow. Build trust through transparency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="mt-12 flex items-center gap-8">
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

          {/* Right content - App mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-2/3">
              {/* Mobile app mockup */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200">
                <img
                  src={heroImage}
                  alt="OnSite Mobile App Interface"
                  className="w-full rounded-xl"
                />
              </div>

              {/* Floating update card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -right-4 -bottom-4 bg-white rounded-2xl shadow-xl p-4 max-w-xs border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span style={{ fontSize: '1.25rem' }}>✓</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Update Sent!</div>
                    <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                      Kitchen renovation progress shared with client
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

