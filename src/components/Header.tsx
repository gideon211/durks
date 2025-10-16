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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const totalQty = useCartStore((state) => state.totalQty?.() || 0);
  const userInitial = (user?.username ?? "U").charAt(0).toUpperCase();

  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      className={`fixed top-0 z-50 w-full border-b transition-all duration-500 px-4 ${
        scrolled
          ? "bg-card border-border shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={Logo}
              alt="Logo"
              className="w-20 h-auto object-contain"
              loading="lazy"
            />
          </Link>

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
              to="/about"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => toast("Search feature coming soon")}
              className="hidden md:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

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

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="hidden md:flex w-9 h-9 rounded-full bg-muted items-center justify-center font-semibold text-sm uppercase hover:scale-105 transition"
                    disabled={isLoggingOut}
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
                    className="cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
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
                className=" md:flex"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Log In</span>
              </Button>
            )}

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
                  <div className="flex items-center gap-4">
                    {user ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-semibold text-lg uppercase">
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

                  <div className="flex flex-col gap-3">
                    <Link
                      to="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left font-medium"
                    >
                      Home
                    </Link>
                    <Link
                      to="/products"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left font-medium"
                    >
                      Shop
                    </Link>
                    {user && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/orders");
                        }}
                        className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left font-medium"
                      >
                        My Orders
                      </button>
                    )}
                    <Link
                      to="/about"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors text-left font-medium"
                    >
                      About
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 rounded-md hover:bg-muted transition-colors font-medium"
                    >
                      Contact
                    </Link>

                    {user && (
                      <button
                        onClick={async () => {
                          setIsLoggingOut(true);
                          await logout();
                          setIsLoggingOut(false);
                          setIsMenuOpen(false);
                          navigate("/auth");
                        }}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors rounded-md"
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
                  </div>

                  {user?.role === "admin" && (
                    <div className="pt-4 border-t border-border">
                      <Button
                        onClick={() => {
                          navigate("/admin");
                          setIsMenuOpen(false);
                        }}
                        className="w-full"
                      >
                        Admin Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;