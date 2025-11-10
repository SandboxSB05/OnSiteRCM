import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, MapPin, Phone, MousePointerClick } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/RelayLogo.svg";


export function CTAFooter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.open("https://calendly.com/henry-relaycxp/30min", "_blank", "noopener,noreferrer");
    }
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 550, letterSpacing: '-0.02em' }} className="mb-4">
              Turn every project into your next lead
            </h2>
            <p className="text-gray-400 mb-8" style={{ fontSize: '1.125rem' }}>
              Join Relay and start working smarter in the field.
            </p>

            {/* Email capture form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
                <Button 
                  type="submit"
                  className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex-shrink-0"
                >
                  Book a Demo
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </form>
            <div className="mt-3 flex items-center justify-center gap-2 text-emerald-300 text-sm">
              <MousePointerClick className="w-4 h-4 animate-pulse" />
              <span>Opens Calendly in a new tab for live scheduling</span>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Footer links */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-10"
          >
            {/* Company info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/3"
            >
              <div className="mb-4">
                <img src={logo} alt="Relay logo" className="h-40" />
              </div>
              <p className="text-gray-400 leading-relaxed" style={{ fontSize: '0.875rem' }}>
                The communication layer for modern contractors.
              </p>
            </motion.div>

            {/* Actionable columns */}
            <div className="flex-1 grid sm:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900/80 p-6 shadow-[0_15px_45px_-30px_rgba(16,185,129,0.9)]"
              >
                <h4 style={{ fontSize: '0.875rem', fontWeight: 550 }} className="mb-4 text-gray-200 flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Product
                </h4>
                <ul className="space-y-3 text-gray-300" style={{ fontSize: '0.875rem' }}>
                  <li>
                    <a href="#features" className="hover:text-white transition-colors flex items-center gap-2">
                      <span className="inline-flex h-px w-6 bg-emerald-500 opacity-70" />
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#integrations" className="hover:text-white transition-colors flex items-center gap-2">
                      <span className="inline-flex h-px w-6 bg-emerald-500 opacity-70" />
                      Integrations
                    </a>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900/80 p-6 shadow-[0_15px_45px_-30px_rgba(16,185,129,0.35)]"
              >
                <h4 style={{ fontSize: '0.875rem', fontWeight: 550 }} className="mb-4 text-gray-200">
                  Contact
                </h4>
                <ul className="space-y-4 text-gray-300" style={{ fontSize: '0.875rem' }}>
                  <li className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span>henry@relaycxp.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span>(831) 566-8549</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span>Provo, UT</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>
              © 2025 Relay. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-500" style={{ fontSize: '0.875rem' }}>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
