// src/pages/Auth.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import { signInUser, signUpUser } from "@/api/authApi";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // track active tab so we can animate titles/subtitles
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    (location.state as any)?.tab === "signup" ? "signup" : "signin"
  );

  // prefill email on the sign-in form after successful signup
  const [prefillEmail, setPrefillEmail] = useState<string>(
    (location.state as any)?.prefillEmail || ""
  );

  // If the route state requested a specific tab (navigated from elsewhere), honour it once.
  useEffect(() => {
    const s = (location.state as any) || {};
    if (s.tab === "signup" || s.tab === "signin") setActiveTab(s.tab);
    if (s.prefillEmail) setPrefillEmail(s.prefillEmail);
    // we intentionally do not clear location.state here; it's fine to let it be
  }, [location.state]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("signin-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signin-password") as HTMLInputElement).value;

    try {
      const data = await signInUser({ email, password });
      login({
        id: data.user?.id || "",
        username: data.user?.username || "",
        fullName: data.user?.fullName || data.user?.username || "",
        email: data.user?.email || "",
        isAdmin: data.role === "admin",
        role: data.role,
        token: data.token,
        refreshToken: data.refreshToken,
      } as any);
      toast.success("Welcome back!");
      navigate("/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("signup-name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("signup-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signup-password") as HTMLInputElement).value;
    const company = (form.elements.namedItem("signup-company") as HTMLInputElement)?.value || "";

    try {
      // Create account on backend
      const data = await signUpUser({ fullName, email, password, company });

      // DO NOT auto-login. Instead:
      toast.success("Account created! Please sign in to continue.");

      // prefill the signin email and switch to the sign-in tab
      setPrefillEmail(email);
      setActiveTab("signin");

      // Optionally, clear the signup form fields by resetting the form element
      form.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 18 },
    enter: { opacity: 1, y: 0, transition: { stiffness: 100, damping: 12 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.18 } },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, x: -6 },
    show: { opacity: 1, x: 0, transition: { duration: 0.45 } },
  };

  useEffect(() => {
    // small visual: scroll to top upon mount
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-transparent via-transparent to-transparent">
      {/* header optionally */}
      {/* <Header /> */}

      {/* Decorative background shapes */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-primary/10 to-pink-50 blur-3xl opacity-60"
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-8%] right-[-12%] w-[28rem] h-[28rem] rounded-full bg-gradient-to-bl from-emerald-50 to-primary/5 blur-3xl opacity-60"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="enter"
        exit="exit"
        className="flex-1 flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: animated heading + microcopy */}
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="wait">
                {activeTab === "signin" ? (
                  <motion.div
                    key="signin-head"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-3"
                  >
                    <motion.h1
                      variants={titleVariants}
                      initial="hidden"
                      animate="show"
                      className="text-3xl md:text-4xl font-heading font-bold mt-[-1rem]"
                    >
                      Welcome back.
                    </motion.h1>

                    <motion.p
                      variants={subtitleVariants}
                      initial="hidden"
                      animate="show"
                      className="text-sm text-muted-foreground max-w-md"
                    >
                      Sign in to resume where you left off — your cart, order history
                      are waiting. Quick tip: Use the email you signed up with.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="mt-4 w-full max-w-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2v6" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 10h8" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 14h12" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 18h6" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold">Signed-in perks</div>
                          <div className="text-xs text-muted-foreground">Quick checkout • Order tracking • Saved carts</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-head"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-3"
                  >
                    <motion.h1
                      variants={titleVariants}
                      initial="hidden"
                      animate="show"
                      className="text-3xl md:text-4xl font-heading font-extrabold"
                    >
                      Create your account.
                    </motion.h1>

                    <motion.p
                      variants={subtitleVariants}
                      initial="hidden"
                      animate="show"
                      className="text-sm text-muted-foreground max-w-md"
                    >
                      Join us and enjoy personalised deals, order history, and easy bulk purchases.
                      It only takes a minute — and you'll get special offers for first orders.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* subtle CTA / trustline */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className=" text-xs text-muted-foreground"
              >
                Secure checkout • 30-day returns
              </motion.div>
            </div>

            {/* Right: card with tabs & forms */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-card border-2 border-border rounded-2xl shadow-xl p-6"
            >
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "signin" | "signup")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent rounded-md p-1">
                  <TabsTrigger value="signin" className={`font-semibold ${activeTab === "signin" ? "bg-primary rounded-md border" : ""}`}>LOG IN</TabsTrigger>
                  <TabsTrigger value="signup" className={`font-semibold ${activeTab === "signup" ? "bg-primary/5 rounded-md border" : ""}`}>SIGN UP</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  {/* Show a small success hint if we've arrived here after signup */}
                  {prefillEmail && activeTab === "signin" && (
                    <div className="mb-3 text-sm text-emerald-600">Account created — please sign in using the email below.</div>
                  )}

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" name="signin-email" type="email" required defaultValue={prefillEmail} />
                    </div>

                    <div className="space-y-2 relative">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input id="signin-password" name="signin-password" type={showSignInPassword ? "text" : "password"} required />
                      <button type="button" onClick={() => setShowSignInPassword(!showSignInPassword)} className="absolute right-3 top-9 text-muted-foreground hover:text-foreground">
                        {showSignInPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</label>
                      </div>

                      <a className="text-sm text-primary hover:underline" href="/forgot-password">Forgot?</a>
                    </div>

                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Logging in..." : "Login In"}
                        </Button>
                      </motion.div>

                      <div className="text-center text-xs text-muted-foreground">
                        Or continue with
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" name="signup-name" type="text" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="signup-email" type="email" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-company">Company (Optional)</Label>
                      <Input id="signup-company" name="signup-company" type="text" />
                    </div>

                    <div className="space-y-2 relative">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" name="signup-password" type={showSignUpPassword ? "text" : "password"} required />
                      <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute right-3 top-9 text-muted-foreground hover:text-foreground">
                        {showSignUpPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </motion.div>

                      <div className="text-center text-xs text-muted-foreground">
                        By creating an account you agree to our <a className="text-primary underline" href="/terms">Terms</a>.
                      </div>

                      <div className="mt-1 text-center">
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="inline-block bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium">
                          New users: Get 10% off your first order
                        </motion.span>
                      </div>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
