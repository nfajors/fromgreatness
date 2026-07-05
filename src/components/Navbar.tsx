import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'The Science', href: '#science' },
  { label: 'Domains', href: '#domains' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(10,12,27,0.9)] backdrop-blur-[20px]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1200px] px-5 md:px-10 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-vibrantGreen" />
            <span className="font-display text-xl font-semibold text-white">
              fromGreatness
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-sm text-lightSilver hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/auth" className="text-sm text-lightSilver hover:text-white transition-colors">
              Sign In
            </Link>
            <button
              onClick={() => scrollToSection('#pricing')}
              className="glass-btn !py-2 !px-5 !text-sm"
            >
              Start Free
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[rgba(10,12,27,0.98)] backdrop-blur-xl flex flex-col items-center justify-center gap-8">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-8 h-8" />
          </button>
          {navLinks.map((link, i) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="font-display text-2xl text-white hover:text-vibrantGreen transition-colors"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {link.label}
            </button>
          ))}
          <div className="flex flex-col items-center gap-4 mt-4">
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="text-lightSilver hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => scrollToSection('#pricing')}
              className="glass-btn"
            >
              Start Free
            </button>
          </div>
        </div>
      )}
    </>
  );
}
