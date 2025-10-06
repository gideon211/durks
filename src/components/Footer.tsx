import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import Logo from "@/assets/logo.svg";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={Logo} alt="logo" className="h-8 w-8" />
              </div>
              <span className="font-heading font-bold text-lg"></span>
            </div>
            <p className="text-muted-foreground text-xs">
              Premium bulk fruit juice for businesses, events, and wholesale orders.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-heading font-semibold text-sm mb-2">Products</h3>
            <ul className="space-y-1">
              {["pure-juice", "cleanse", "smoothies", "cut-fruits", "gift-packs", "events"].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/products/${cat}`}
                    className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-sm mb-2">Company</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground text-xs transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-sm mb-2">Contact</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <a href="tel:+233202427880" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Phone className="h-3 w-3" />
                  +233 202 427 880
                </a>
              </li>
              <li>
                <a href="tel:+233243587001" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Phone className="h-3 w-3" />
                  +233 243 587 001
                </a>
              </li>
              <li className="pt-1">
                <p className="font-medium mb-0.5">Physical Address:</p>
                <p>[GOs Address - To be provided]</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-4 pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Duks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
