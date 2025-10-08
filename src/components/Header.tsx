import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User as UserIcon, Menu, Box, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Logo from "../assets/logo.svg";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "../context/Authcontext";

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  // Reactive cart quantity
  const totalQty = useCartStore((state) => state.totalQty());

  const productCategories = [
    { name: "Pure Juice", path: "/products/pure-juice" },
    { name: "Cleanse Juices", path: "/products/cleanse" },
    { name: "Smoothies", path: "/products/smoothies" },
    { name: "Cut Fruits", path: "/products/cut-fruits" },
    { name: "Gift Packs", path: "/products/gift-packs" },
    { name: "Events", path: "/products/events" },
  ];

  const userInitial = (user?.username ??  "U").charAt(0).toUpperCase();

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
            <Link to="/products" state={{ skipHero: true, scrollToTabs: true }} className="font-medium text-foreground hover:text-primary transition-colors">Products</Link>
            <Link to="/csr" className="font-medium text-foreground hover:text-primary transition-colors">CSR</Link>
            <Link to="/contact" className="font-medium text-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <div className="relative group hidden md:flex">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <input
                type="text"
                placeholder="Search products..."
                className="absolute right-0 top-0 opacity-0 w-0 group-hover:opacity-100 group-hover:w-48 transition-all duration-300 border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Profile */}
            {user ? (
              <div className="hidden md:flex items-center gap-2 relative group">
                <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-sm uppercase hover:scale-[1.03] transition">
                  {userInitial}
                </button>

                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 absolute right-0 mt-2 w-44 bg-card border border-border rounded shadow-lg z-50">
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <Box className="h-4 w-4" />
                    <span className="text-sm">My Orders</span>
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/') }}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                <UserIcon className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}

            <Button variant="secondary" size="sm" onClick={() => navigate('/bulk-quote')} className="hidden md:flex">
              Get Bulk
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative">
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
                <Button variant="ghost" size="icon" className="lg:hidden relative">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-8 px-4">
                  {/* Profile */}
                  <div className="flex items-center gap-4">
                    {user ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-semibold text-lg uppercase">{userInitial}</div>
                        <div>
                          <div className="font-semibold">{user.username ?? user.username}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </>
                    ) : (
                      <p></p>
                    )}
                  </div>

                  {/* Simplified Products link (just goes to /products) */}
                  <div>

                  </div>

                  {/* My Orders & About Us */}
                  <div className="flex flex-col gap-3">
                    <button><Link to="/products" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left flex items-center gap-3 font-medium">
                      Products
                    </Link></button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (!user) {
                          navigate('/orders');
                        } else {
                          navigate('/orders');
                        }
                      }}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left flex items-center gap-3 font-medium"
                    >
                      
                      My Orders
                    </button>

                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left flex items-center gap-3 font-medium"
                    >

                      About Us
                    </Link>
                  </div>

                  {/* Other links */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <Link to="/csr" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-md hover:bg-muted transition-colors font-medium">CSR</Link>
                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-md hover:bg-muted transition-colors font-medium">Contact</Link>

                    {user && (
                      <>
                        <button
                          onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                          className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left flex items-center gap-3"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <Button
                      onClick={() => {
                        navigate('/bulk-quote');
                        setIsMenuOpen(false);
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
  );
};
