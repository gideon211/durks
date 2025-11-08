import { Link } from 'react-router-dom'
import { Phone, Facebook, Instagram, X, MapPin,  } from 'lucide-react'
import Logo from '@/assets/logo.svg'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    // Increase top margin and use a slightly darker background (if not already dark) for better contrast
    <footer className="bg-card border-t border-border mt-16"> 
      <div className="container mx-auto px-4 py-8"> {/* Increased padding */}
        
        {/* Main content */}
        {/* Explicitly define gap and stacking for mobile/desktop */}
        <div className="flex flex-wrap gap-y-8 gap-x-12 justify-between"> 
          
          {/* 1. Brand & Social (Moved to top for visibility) */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 flex items-center justify-center">
                {/* Ensure logo scales correctly */}
                <img src={Logo} alt="Duks Logo" className="h-14 w-14 object-contain" /> 
              </div>
              {/* Optional: Add Brand Name next to Logo */}
              <h2 className="font-heading font-bold text-md">DUKS JUICES</h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs mb-4"> {/* Larger text size for main tagline */}
              Premium bulk fruit juice for businesses, events, and wholesale orders.
            </p>

            {/* Social Media Integration */}
            <div className="flex gap-4">


              <a href="https://www.instagram.com/@duks_juice" aria-label="Follow us on Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Follow us on X (Twitter)" className="text-muted-foreground hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </a>
            </div>
          </div>

          
          <div className='flex flex-wrap gap-x-12 gap-y-8 min-w-[140px]'> {/* Adjusted inner wrap for grouping */}

            {/* 2. Products (Improved Heading and Spacing) */}
            <div className="min-w-[140px]">
              {/* Stronger heading */}
              <h3 className="font-heading font-bold text-base mb-3 text-foreground">Products</h3> 
              <ul className="space-y-2"> {/* Increased vertical spacing */}
                {["pure-juices", "cleanse", "smoothies", "cut-fruits", "gift-packs", "events"].map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/products/${cat}`}
                      // Apply `text-sm` and `block` for better click area
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors block" 
                    >
                      {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Company & Legal Links */}

            
            {/* 4. Contact (Improved Prominence) */}
            <div className="min-w-[160px]">
              {/* Stronger heading */}
              <h3 className="font-heading font-bold text-base mb-3 text-foreground">Contact</h3> 
              <ul className="space-y-3 text-sm"> {/* Increased vertical spacing and size */}
                
                {/* Highlighted Phone Numbers (CTA) */}
                <li>
                  <a
                    href="tel:+233202427880"
                    className="flex items-center gap-2 text-foreground hover:text-primary" // Bolder and primary color hover
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    +233 202 427 880
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+233243587001"
                    className="flex items-center gap-2  text-foreground hover:text-primary"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    +233 240 076 685
                  </a>
                </li>
                
                {/* Address Formatting */}
                <li className="pt-1">
                  <p className="font-semibold mb-1 flex items-center gap-2">
                     <MapPin className="h-4 w-4 text-primary"/>Physical Address:
                  </p>
                  <p className="text-muted-foreground">
                    Madina, Accra Ghana
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        

        {/* --- */}

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} Duks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}