import { Link } from 'react-router-dom';
import { Shield, Instagram, Facebook, Linkedin } from 'lucide-react';

// The platform formerly known as Twitter now uses the "X" mark. Lucide's
// `Twitter` export is still the old bird in this version, so we use a proper
// X glyph instead.
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const footerLinks = {
  Product: ['Features', 'How It Works', 'Pricing', 'Schools', 'Download App'],
  Resources: ['Blog', 'Research', 'Parent Guide', 'DNA 101', 'FAQ'],
  Company: ['About Us', 'Careers', 'Press', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'COPPA Policy', 'Cookie Policy'],
};

export default function Footer() {
  return (
    <footer className="bg-baseIndigo border-t border-glassBorder">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-12 md:py-16">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-vibrantGreen" />
            <span className="font-display text-lg font-semibold text-white">
              fromGreatness
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {[Instagram, XLogo, Facebook, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="text-mediumGray hover:text-vibrantGreen transition-colors"
                onClick={(e) => e.preventDefault()}
                aria-label="Social link"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-body text-sm font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-mediumGray hover:text-lightSilver transition-colors"
                      onClick={(e) => e.preventDefault()}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="border-t border-glassBorder pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-mediumGray">
            &copy; 2025 fromGreatness. All rights reserved.
          </p>
          <p className="text-xs text-mutedSlate">
            Made with care for the next generation.
          </p>
        </div>
      </div>
    </footer>
  );
}
