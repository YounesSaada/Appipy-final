import hero1 from "../assets/hero1.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-900 border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src={hero1} 
              alt="Appipy" 
              className="h-12 md:h-14 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#what-is-appipy" className="text-blue-50 hover:text-yellow-400 transition-colors">
              What is Appipy
            </a>
            <a href="#how-it-works" className="text-blue-50 hover:text-yellow-400 transition-colors">
              How It Works
            </a>
            <a href="#future-addons" className="text-blue-50 hover:text-yellow-400 transition-colors">
              Future Add-ons
            </a>
            <a href="#pilot-program" className="text-blue-50 hover:text-yellow-400 transition-colors">
              Pilot Program
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-blue-50 hover:text-yellow-400 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-700">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <a
              href="#what-is-appipy"
              className="block py-2 text-blue-50 hover:text-yellow-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              What is Appipy
            </a>
            <a
              href="#how-it-works"
              className="block py-2 text-blue-50 hover:text-yellow-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#future-addons"
              className="block py-2 text-blue-50 hover:text-yellow-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Future Add-ons
            </a>
            <a
              href="#pilot-program"
              className="block py-2 text-blue-50 hover:text-yellow-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pilot Program
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}