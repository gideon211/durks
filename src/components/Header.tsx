import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import Logo from '../assets/logo.svg'
import { useCartStore } from '@/store/cartStore'

export const Header = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Get cart count from Zustand
  const totalQty = useCartStore((state) => state.totalQty())

  const productCategories = [
    { name: 'Pure Juice', path: '/products/pure-juice' },
    { name: 'Cleanse Juices', path: '/products/cleanse' },
    { name: 'Smoothies', path: '/products/smoothies' },
    { name: 'Cut Fruits', path: '/products/cut-fruits' },
    { name: 'Gift Packs', path: '/products/gift-packs' },
    { name: 'Events', path: '/products/events' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover-lift">
            <img src={Logo} alt="Logo" className="w-24 h-26 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* Products: navigate to /products, skip the hero and scroll to tabs */}
            <Link
              to="/products"
              state={{ skipHero: true, scrollToTabs: true }}
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Products
            </Link>

            <Link
              to="/csr"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              CSR
            </Link>

            <Link
              to="/contact"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search with hover input */}
            <div className="relative group hidden md:flex">
              <Button variant="ghost" size="icon" className="relative z-10">
                <Search className="h-5 w-5" />
              </Button>

              <input
                type="text"
                placeholder="Search products..."
                className="absolute right-0 top-0 z-0 opacity-0 w-0 group-hover:opacity-100 group-hover:w-48 transition-all duration-300 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
              className="hidden md:flex"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/bulk-quote')}
              className="hidden md:flex"
            >
              Get Bulk Quote
            </Button>

            {/* Cart icon with live badge */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cart')}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalQty}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-8">
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-3">
                      Products
                    </h3>
                    <div className="flex flex-col gap-2">
                      {productCategories.map((category) => (
                        <Link
                          key={category.path}
                          to={category.path}
                          state={{ skipHero: true, scrollToTabs: true }}
                          onClick={() => setIsMenuOpen(false)}
                          className="px-4 py-3 rounded-md hover:bg-muted transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      to="/csr"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors font-medium"
                    >
                      Corporate Social Responsibility
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors font-medium"
                    >
                      Contact
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <Button
                      onClick={() => {
                        navigate('/auth')
                        setIsMenuOpen(false)
                      }}
                    >
                      <User className="h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        navigate('/bulk-quote')
                        setIsMenuOpen(false)
                      }}
                    >
                      Get Bulk Quote
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
