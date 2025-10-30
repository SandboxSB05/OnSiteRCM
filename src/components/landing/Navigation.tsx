import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/onsite-logo.png";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="OnSite Logo" className="h-16" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#integrations" className="text-muted-foreground hover:text-foreground transition-colors">
              Integrations
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                Book a Demo
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#integrations" className="block text-muted-foreground hover:text-foreground transition-colors">
              Integrations
            </a>
            <a href="#testimonials" className="block text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </a>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login">
                <Button variant="ghost" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

