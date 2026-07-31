"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";
import { signInUser, signUpUser } from "@/api/authApi";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Leaf,
  Truck,
  Heart,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

const YELLOW_DOT = "bg-[hsl(48_100%_50%)]";

const INPUT_FOCUS =
  "focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/[0.12] focus-visible:ring-offset-0";
const NEUTRAL_FOCUS =
  "focus-visible:ring-foreground/20 focus-visible:ring-offset-0";

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    searchParams?.get("tab") === "signup" ? "signup" : "signin",
  );

  const [prefillEmail, setPrefillEmail] = useState<string>(
    searchParams?.get("prefillEmail") || "",
  );

  useEffect(() => {
    const tab = searchParams?.get("tab");
    const email = searchParams?.get("prefillEmail");
    if (tab === "signup" || tab === "signin") setActiveTab(tab);
    if (email) setPrefillEmail(email);
  }, [searchParams]);

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string; rememberMe: boolean }) => signInUser({ email, password }),
    onSuccess: (data, variables) => {
      login({
        id: data.user?.id || "",
        username: data.user?.username || "",
        fullName: data.user?.fullName || data.user?.username || "",
        email: data.user?.email || "",
        isAdmin: data.role === "admin",
        role: data.role,
        token: data.token,
        refreshToken: data.refreshToken,
      }, variables.rememberMe);
      toast.success("Welcome back!");
      router.push("/");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e.response?.data?.message || "Failed to sign in");
    },
  });

  const signUpMutation = useMutation({
    mutationFn: ({ fullName, email, password, company }: { fullName: string; email: string; password: string; company: string }) =>
      signUpUser({ fullName, email, password, company }),
    onSuccess: (_data, variables) => {
      toast.success("Account created! Please sign in to continue.");
      setPrefillEmail(variables.email);
      setActiveTab("signin");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e.response?.data?.message || "Failed to create account");
    },
  });

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("signin-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signin-password") as HTMLInputElement).value;
    signInMutation.mutate({ email, password, rememberMe });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("signup-name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("signup-email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("signup-password") as HTMLInputElement).value;
    const company = (form.elements.namedItem("signup-company") as HTMLInputElement)?.value || "";
    signUpMutation.mutate({ fullName, email, password, company });
    form.reset();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.18 } },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const subtitleVariants: Variants = {
    hidden: { opacity: 0, x: -6 },
    show: { opacity: 1, x: 0, transition: { duration: 0.45 } },
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const panelChips = [
    { icon: Leaf, label: "No added sugar" },
    { icon: Truck, label: "Accra-wide delivery" },
    { icon: Heart, label: "Family recipes" },
  ];

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-white text-foreground lg:h-auto lg:min-h-[100dvh] lg:flex-row">
      <div
        aria-hidden
        className="auth-grain pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
      />

      {/* Left panel — desktop only */}
      <aside className="relative hidden shrink-0 overflow-hidden bg-neutral-900 lg:block lg:w-[46%]">
        <Image
          src="/images/auth-panel.jpg"
          alt="A fresh Duks Juice drink, cold-pressed and ready to enjoy"
          fill
          priority
          sizes="(min-width: 1024px) 46vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
          <div className="mb-4 flex items-center gap-2">
            <span className={`${YELLOW_DOT} h-2 w-2 rounded-full`} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
              Fresh. Pressed. Daily.
            </span>
          </div>
          <h2 className="max-w-sm font-heading text-3xl font-bold leading-tight tracking-tight text-white text-balance xl:text-4xl">
            Real fruit, pressed fresh every morning.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Fresh natural juices made daily in Accra from real fruit, with no
            added sugar or preservatives. Ideal for families, events and
            wholesale orders.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {panelChips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-[hsl(48_100%_70%)]" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-5 py-4 sm:px-10 sm:py-6 lg:px-14 lg:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_50%_18%,rgba(255,196,0,0.08),transparent_70%)]"
        />

        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
          <div className="flex items-center justify-end lg:hidden">
            <img
              src="/images/logo.svg"
              alt="Duks Juice"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        <div className="m-auto flex w-full max-w-md flex-col py-6 sm:py-10">
          <AnimatePresence mode="wait">
            {activeTab === "signin" ? (
              <motion.div
                key="signin-head"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="mb-5 sm:mb-7"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`${YELLOW_DOT} h-1.5 w-1.5 rounded-full`} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Member access
                  </span>
                </div>
                <motion.h1
                  variants={titleVariants}
                  initial="hidden"
                  animate="show"
                  className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl"
                >
                  Welcome back.
                </motion.h1>
                <motion.p
                  variants={subtitleVariants}
                  initial="hidden"
                  animate="show"
                  className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground"
                >
                  Sign in to pick up where you left off — your cart, orders, and
                  saved items are waiting.
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-head"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="mb-5 sm:mb-7"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`${YELLOW_DOT} h-1.5 w-1.5 rounded-full`} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Join Duks Juice
                  </span>
                </div>
                <motion.h1
                  variants={titleVariants}
                  initial="hidden"
                  animate="show"
                  className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl"
                >
                  Create your account.
                </motion.h1>
                <motion.p
                  variants={subtitleVariants}
                  initial="hidden"
                  animate="show"
                  className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground"
                >
                  Join for personalised deals, faster checkout, and easy bulk
                  purchases.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="enter"
            className="rounded-2xl border border-foreground/[0.07] bg-white/80 p-5 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl bg-foreground/[0.045] p-1">
                <TabsTrigger
                  value="signin"
                  className={`rounded-lg py-2 text-sm font-semibold sm:py-2.5 ${NEUTRAL_FOCUS}`}
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className={`rounded-lg py-2 text-sm font-semibold sm:py-2.5 ${NEUTRAL_FOCUS}`}
                >
                  Create account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                {prefillEmail && activeTab === "signin" && (
                  <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-700">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    Account created — please sign in using the email below.
                  </div>
                )}

                <form onSubmit={handleSignIn} className="mt-3 space-y-4 sm:space-y-5">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signin-email"
                      className="text-[13px] font-medium text-foreground/80"
                    >
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      defaultValue={prefillEmail}
                      className={`h-11 rounded-lg bg-white px-3.5 ${INPUT_FOCUS}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signin-password"
                      className="text-[13px] font-medium text-foreground/80"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="signin-password"
                        type={showSignInPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className={`h-11 rounded-lg bg-white px-3.5 pr-11 ${INPUT_FOCUS}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        aria-label={showSignInPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showSignInPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="remember"
                      className="flex cursor-pointer select-none items-center gap-2.5"
                    >
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(v) => setRememberMe(v === true)}
                        className={`border-foreground/25 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground ${NEUTRAL_FOCUS}`}
                      />
                      <span className="text-sm text-muted-foreground">Remember me</span>
                    </label>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-foreground font-semibold text-background hover:bg-foreground/90"
                      disabled={signInMutation.isPending}
                    >
                      {signInMutation.isPending ? "Signing in…" : "Sign in"}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="mt-3 space-y-4 sm:space-y-5">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-name"
                      className="text-[13px] font-medium text-foreground/80"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="signup-name"
                      type="text"
                      required
                      placeholder="Ama Osei"
                      className={`h-11 rounded-lg bg-white px-3.5 ${INPUT_FOCUS}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-email"
                      className="text-[13px] font-medium text-foreground/80"
                    >
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className={`h-11 rounded-lg bg-white px-3.5 ${INPUT_FOCUS}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-company"
                      className="text-[13px] font-medium text-foreground/80"
                    >
                      Company{" "}
                      <span className="font-normal text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="signup-company"
                      name="signup-company"
                      type="text"
                      placeholder="Your business or organisation"
                      className={`h-11 rounded-lg bg-white px-3.5 ${INPUT_FOCUS}`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-password"
                      className="text-[13px] font-medium text-foreground/80"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className={`h-11 rounded-lg bg-white px-3.5 pr-11 ${INPUT_FOCUS}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showSignUpPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-foreground font-semibold text-background hover:bg-foreground/90"
                      disabled={signUpMutation.isPending}
                    >
                      {signUpMutation.isPending ? "Creating account…" : "Create account"}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>
            </Tabs>
          </motion.div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground sm:mt-6">
            <LockKeyhole className="h-3.5 w-3.5" />
            Secure checkout
            <span className="text-foreground/20">•</span>
            30-day returns
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground/70">
          <span>© {new Date().getFullYear()} Duks Juice</span>
          <span>Madina, Accra</span>
        </div>
      </main>
    </div>
  );
}
