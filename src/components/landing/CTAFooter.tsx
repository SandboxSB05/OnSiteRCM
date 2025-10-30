import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/onsite-logo.png";

export function CTAFooter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log("Email submitted:", email);
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
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }} className="mb-4">
              Get started with OnSite today
            </h2>
            <p className="text-gray-400 mb-8" style={{ fontSize: '1.125rem' }}>
              Join hundreds of contractors who are already delivering better client experiences
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
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex-shrink-0"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>

            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>
              Free 14-day trial • No credit card required • Setup in 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer links */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company info */}
            <div>
              <div className="mb-4">
                <img src={logo} alt="OnSite Logo" className="h-14" />
              </div>
              <p className="text-gray-400" style={{ fontSize: '0.875rem' }}>
                The communication layer for modern contractors.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }} className="mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400" style={{ fontSize: '0.875rem' }}>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }} className="mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400" style={{ fontSize: '0.875rem' }}>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }} className="mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400" style={{ fontSize: '0.875rem' }}>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@onsite.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>
              © 2025 OnSite. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-500" style={{ fontSize: '0.875rem' }}>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

