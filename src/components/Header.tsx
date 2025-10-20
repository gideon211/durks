import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  LogOut,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/context/Authcontext";
import Logo from "@/assets/logo.svg";

/**
 * Header Component
 * ----------------
 * Displays the top navigation bar for desktop and mobile.
 * Features:
 * - Logo linking to home page
 * - Navigation links for desktop
 * - Search button (placeholder toast)
 * - Cart icon with dynamic quantity badge
 * - User menu with dropdown (My Orders, Admin Dashboard, Log Out)
 * - Mobile slide-in menu using Sheet component
 * - Responsive design: desktop vs mobile layouts
 * - Scroll detection for sticky header background
 */
const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const totalQty = useCartStore((state) => state.totalQty?.() || 0);

  // Derive first letter of username for user icon
  const userInitial = (user?.username ?? "U").charAt(0).toUpperCase();

  // Track header scroll state to apply background/shadow
  const [scrolled, setScrolled] = useState(false);

  // Track logout loading state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Track mobile menu open/close state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  /**
   * Scroll Effect
   * -------------
   * Updates `scrolled` state when user scrolls past 10px
   * Adds/removes background and shadow from header
   */
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Handle Logout
   * -------------
   * Logs out the user and navigates to the login page
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast("Logging out...");
      await logout();
      navigate("/auth");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-500 px-2 ${
        scrolled
          ? "bg-card border-border shadow-sm" // background on scroll
          : "bg-transparent border-transparent" // transparent on top
      }`}
    >
      {/* Container ensures proper horizontal spacing */}
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-0">

        {/* Logo linking to home */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Logo"
            className="w-20 h-auto object-contain"
            loading="lazy"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            to="/"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Shop
          </Link>

          <Link
            to="/contact"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Right section: search, cart, user */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Search button (placeholder toast) */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => toast("Search feature coming soon")}
            className="hidden md:flex"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart icon with dynamic quantity badge */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/cart")}
            className="relative"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalQty > 9 ? "9+" : totalQty}
              </span>
            )}
          </Button>

          {/* User menu dropdown (desktop) */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex w-9 h-9 rounded-full bg-muted items-center justify-center font-semibold text-sm uppercase hover:scale-110 hover:shadow-md transition-transform transition-shadow duration-200"
                  disabled={isLoggingOut}
                  aria-label="User Menu"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    userInitial
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
                </DropdownMenuItem>

                {/* Admin dashboard link for admin role */}
                {user.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    className="cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
              className="md:flex"
            >
              <User className="h-4 w-4 mr-2" />
              Log In
            </Button>
          )}

          {/* Mobile menu (Sheet) */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[60vw] max-w-sm bg-card border-l border-border"
            >
              <div className="flex flex-col gap-6 mt-4">
                {/* User info */}
                <div className="flex items-center gap-4">
                  {user ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-semibold text-lg uppercase hover:scale-110 hover:shadow-md transition-transform duration-200">
                        {userInitial}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {user.username?.split(" ")[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/auth");
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Log In
                    </Button>
                  )}
                </div>

                {/* Mobile navigation links */}
                <nav className="flex flex-col gap-3">
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-md hover:bg-muted hover:scale-105 transition-transform transition-colors duration-150 font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-md hover:bg-muted hover:scale-105 transition-transform transition-colors duration-150 font-medium"
                  >
                    Shop
                  </Link>
                  {user && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/orders");
                      }}
                      className="px-4 py-3 rounded-md hover:bg-muted hover:scale-105 transition-transform transition-colors duration-150 text-left font-medium"
                    >
                      My Orders
                    </button>
                  )}

                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-md hover:bg-muted hover:scale-105 transition-transform transition-colors duration-150 font-medium"
                  >
                    Contact
                  </Link>

                  {/* Logout button */}
                  {user && (
                    <button
                    onClick={async () => {
                        setIsLoggingOut(true);         // show spinner
                        await delay(2000);             // wait 2 seconds
                        await logout();                // perform logout
                        setIsLoggingOut(false);        // hide spinner
                        setIsMenuOpen(false);          // close mobile menu
                        navigate("/auth");             // redirect to login
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted hover:scale-105 transition-transform transition-colors rounded-md"
                    >
                    {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    <span className="text-sm">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                    </button>
                  )}

                  {/* Admin dashboard button for mobile */}
                  {user?.role === "admin" && (
                    <Button
                      onClick={() => {
                        navigate("/admin");
                        setIsMenuOpen(false);
                      }}
                      className="w-full mt-2 hover:scale-105 transition-transform duration-150"
                    >
                      Admin Dashboard
                    </Button>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
