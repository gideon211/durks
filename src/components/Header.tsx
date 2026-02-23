import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  LogOut,
  Loader2,
  Package,
  LayoutDashboard,
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

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userInitial = (user?.username ?? "U").charAt(0).toUpperCase();

  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prefer selecting a value (not calling a function) if possible.
  // Keeping your existing API: state.distinctItems()
  const distinctCount = useCartStore((state) => state.distinctItems());

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10);
        ticking = false;
      });
    };

    handleScroll(); // set initial state
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast("Logging out...");
      await logout();
      setIsMenuOpen(false);
      navigate("/auth");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinkClass = useMemo(() => {
    return ({ isActive }: { isActive: boolean }) =>
      [
        "relative font-medium transition-colors",
        "text-black hover:text-foreground",
        "after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-primary after:transition-transform after:duration-300",
        isActive ? "text-foreground after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
      ].join(" ");
  }, []);

  const mobileLinkClass =
    "px-4 py-3 rounded-lg hover:bg-muted/70 transition-colors font-medium text-foreground/90 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <header
      className={[
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "bg-background/70 backdrop-blur-xl shadow-sm"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 py-2" aria-label="Go to home">
          <img
            src={Logo}
            alt="Logo"
            className="w-24 md:w-28 h-auto object-contain"
            loading="lazy"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/cart")}
            className="relative"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {distinctCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center border border-background">
                {distinctCount > 9 ? "9+" : distinctCount}
              </span>
            )}
          </Button>

          {/* User menu (desktop) */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={[
                    "flex w-9 h-9 rounded-full bg-muted items-center justify-center font-semibold text-sm uppercase",
                    "hover:scale-110 hover:shadow-md transition-all duration-200 flex-shrink-0",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  ].join(" ")}
                  disabled={isLoggingOut}
                  aria-label="User menu"
                >
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : userInitial}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-4 py-2 flex flex-col gap-1">
                  <div className="font-semibold truncate">{user.username}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>

                {user.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    className="cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-100 transition-colors"
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
              className="hidden md:flex"
            >
              <User className="h-4 w-4 mr-2" />
              Log In
            </Button>
          )}

          {/* Mobile menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[80vw] sm:w-[60vw] max-w-sm bg-card border-l border-border"
            >
              <div className="flex flex-col gap-6 mt-4">
                {/* Top area */}
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Menu</div>
                </div>

                {/* User info */}
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-muted flex items-center justify-center font-bold text-base sm:text-lg uppercase flex-shrink-0">
                      {userInitial}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <div className="font-semibold truncate">{user.username}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                  </div>
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


                {/* Mobile nav links */}
                <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass}>
                    Home
                  </Link>

                  <Link
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    Shop
                  </Link>

                  {user && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/orders");
                      }}
                      className={[
                        mobileLinkClass,
                        "text-left flex items-center gap-2",
                      ].join(" ")}
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </button>
                  )}

                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className={mobileLinkClass}
                  >
                    Contact
                  </Link>

                  {/* Admin */}
                  {user?.role === "admin" && (
                    <Button
                      onClick={() => {
                        navigate("/admin");
                        setIsMenuOpen(false);
                      }}
                      className="w-full mt-2"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  )}

                  {/* Logout */}
                  {user && (
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={[
                        "w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg",
                        "hover:bg-muted/70 transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "text-red-600",
                      ].join(" ")}
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {isLoggingOut ? "Signing out..." : "Sign Out"}
                      </span>
                    </button>
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