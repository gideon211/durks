import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">🍊</span>
              </div>
              <span className="font-heading font-bold text-xl">Durk's Juice</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Premium bulk fruit juice for businesses, events, and wholesale orders.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products/pure-juice" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pure Juice
                </Link>
              </li>
              <li>
                <Link to="/products/cleanse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cleanse Juices
                </Link>
              </li>
              <li>
                <Link to="/products/smoothies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Smoothies
                </Link>
              </li>
              <li>
                <Link to="/products/cut-fruits" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cut Fruits
                </Link>
              </li>
              <li>
                <Link to="/products/gift-packs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gift Packs
                </Link>
              </li>
              <li>
                <Link to="/products/events" className="text-muted-foreground hover:text-foreground transition-colors">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>


          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+233202427880" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+233 202 427 880</span>
                </a>
              </li>
              <li>
                <a href="tel:+233243587001" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>+233 243 587 001</span>
                </a>
              </li>
              <li className="pt-2 text-sm text-muted-foreground">
                <p className="font-medium mb-1">Physical Address:</p>
                <p className="text-xs">[GOs Address - To be provided]</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Fresh Juice Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
