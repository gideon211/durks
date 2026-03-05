import React from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Clock,
  Users,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

type ProgramKey = "bootcamp" | "quality" | "retail";

type Program = {
  key: ProgramKey;
  title: string;
  badge: string;
  duration: string;
  format: string;
  level: string;
  bullets: string[];
};

type ApplyForm = {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  program: ProgramKey;
  schedulePreference: "weekday" | "weekend" | "either";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  goals: string;
  website: string; // honeypot
};

const PROGRAMS: Program[] = [
  {
    key: "bootcamp",
    title: "Juice Business Bootcamp",
    badge: "Popular",
    duration: "4 weeks",
    format: "In-person",
    level: "Beginner → Intermediate",
    bullets: [
      "Sourcing & hygiene SOPs",
      "Batching workflow",
      "Costing & pricing",
      "Retail + bulk ops",
    ],
  },
  {
    key: "quality",
    title: "Quality Masterclass",
    badge: "Advanced",
    duration: "2 weeks",
    format: "Lab",
    level: "Intermediate → Advanced",
    bullets: [
      "Consistency standards",
      "QC checks & logs",
      "Cold chain basics",
      "Packaging consistency",
    ],
  },
  {
    key: "retail",
    title: "Retail & Bulk Team Training",
    badge: "Teams",
    duration: "3 days",
    format: "Workshop",
    level: "All levels",
    bullets: ["Staff SOPs", "Bulk fulfillment", "Customer care", "Efficiency + upsell"],
  },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function sanitizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export default function Training() {
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [selectedProgram, setSelectedProgram] =
    React.useState<ProgramKey>("bootcamp");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [form, setForm] = React.useState<ApplyForm>({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    program: "bootcamp",
    schedulePreference: "either",
    experienceLevel: "beginner",
    goals: "",
    website: "",
  });

  const selected = React.useMemo(
    () => PROGRAMS.find((p) => p.key === selectedProgram) ?? PROGRAMS[0],
    [selectedProgram]
  );

  const openApply = (programKey?: ProgramKey) => {
    const next = programKey ?? selectedProgram;
    setSelectedProgram(next);
    setForm((prev) => ({ ...prev, program: next }));
    setApplyOpen(true);
  };

  const onChange =
    <K extends keyof ApplyForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onSet =
    <K extends keyof ApplyForm>(key: K, value: ApplyForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key === "program") setSelectedProgram(value as ProgramKey);
    };

  const canSubmit =
    form.fullName.trim().length >= 2 &&
    sanitizePhone(form.phone).length >= 9 &&
    isValidEmail(form.email) &&
    form.location.trim().length >= 2 &&
    form.goals.trim().length >= 10 &&
    !isSubmitting;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // honeypot
    if (form.website.trim()) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    const phone = sanitizePhone(form.phone);

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (phone.length < 9) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    if (form.goals.trim().length < 10) {
      toast.error("Please add a short note (at least 10 characters).");
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ TODO: connect to backend
      // await fetch("/api/training/apply", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...form, phone }),
      // });

      await new Promise((r) => setTimeout(r, 650));

      toast.success("Application received! We’ll contact you soon.");
      setApplyOpen(false);
      setForm((prev) => ({
        ...prev,
        fullName: "",
        phone: "",
        email: "",
        location: "",
        schedulePreference: "either",
        experienceLevel: "beginner",
        goals: "",
        website: "",
      }));
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const COMING_SOON = true;

  const handlecomingsoon = () => {
    if(COMING_SOON) {
        toast.message("Training registration is coming soon");
        return true;

    }

    return false;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 ">
        {/* HERO (polished desktop: open, not choked) */}
        <section className="relative overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 bg-gradient-to-b from-soft-sand/70 via-background to-background" />
          <div className="absolute -top-28 -right-28 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-[34rem] w-[34rem] rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Wider container on desktop so it breathes */}
<div className="relative mx-auto w-full max-w-[1240px] px-4 md:px-6 py-10 md:py-14 lg:py-16 mt-12">

  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

    {/* TEXT COLUMN */}
    <div className="lg:col-span-6 flex flex-col">

      {/* Chip */}
      <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur font-semibold">
        <Sparkles className="h-4 w-4" />
        DUKS Training • Practical • Premium
      </div>

      {/* Heading */}
      <h1 className="mt-5 font-heading font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight leading-[1.06]">
        A premium hands-on training program for juice production & growth.
      </h1>

      {/* Subtext */}
      <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-xl">
        Hands-on sessions. Small cohorts. Clear SOPs.
      </p>

      {/* VIDEO (mobile position) */}
      <div className="mt-6 order-2 lg:hidden">
        <div className="relative overflow-hidden rounded-md ring-1 ring-border shadow-md">

          {/* blurred fill */}
          <video
            className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-40"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/banners/training.mp4" type="video/mp4" />
          </video>

          {/* foreground portrait */}
          <video
            className="relative z-10 mx-auto h-[420px] w-auto object-contain"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/banners/training.mp4" type="video/mp4" />
          </video>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          size="md"
          className="rounded-2xl w-full sm:w-auto"
          onClick={() => {
            if (handlecomingsoon()) return;
            openApply();
            }}
            disabled={COMING_SOON}
        >
          Register <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button
          size="md"
          variant="outline"
          className="rounded-2xl w-full sm:w-auto"
          disabled={COMING_SOON}
            onClick={() => {
            if (handlecomingsoon()) return;
            openApply();
            }}
        >
          Learn more
        </Button>
      </div>

      {/* Signals */}
      <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: ShieldCheck, label: "Hygiene SOPs" },
          { icon: Zap, label: "Hands-on" },
          { icon: Users, label: "Small cohorts" },
          { icon: GraduationCap, label: "Practical" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border bg-card/60 backdrop-blur p-3 md:p-4 flex items-center gap-3"
          >
            <item.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* VIDEO (desktop position) */}
    <div className="hidden lg:block lg:col-span-6">
      <div className="relative overflow-hidden rounded-md ring-1 ring-border shadow-md">

        {/* blurred fill */}
        <video
          className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-40"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/banners/training.mp4" type="video/mp4" />
        </video>

        {/* foreground portrait */}
        <video
          className="relative z-10 mx-auto h-[640px] w-auto object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/banners/training.mp4" type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
      </div>
    </div>

  </div>
</div>
        </section>

        {/* Cohort / Logistics (unchanged, already clean) */}
        <section className="container mx-auto px-4 pb-12 mt-10">
          <div className="grid lg:grid-cols-5 gap-6 items-start">
            <Card className="lg:col-span-3 rounded-[1.75rem]">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-xl md:text-2xl">
                  How it works
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  A clean structure: learn, practice, and leave with SOPs.
                </p>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { title: "Session style", desc: "Practical demos + guided practice" },
                    { title: "Cohort size", desc: "Small groups for real support" },
                    { title: "Materials", desc: "Templates + checklists included" },
                    { title: "Outcome", desc: "Repeatable daily workflow" },
                  ].map((it, idx) => (
                    <div key={idx} className="rounded-[1.25rem] border bg-muted/10 p-4">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-sm">{it.title}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-5" />

                <div className="rounded-[1.5rem] border bg-soft-sand/40 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Focus areas</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Hygiene SOPs, consistency, packaging discipline, and operations that scale.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

<Card className="rounded-[1.75rem]">
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between gap-3">
      <CardTitle className="font-heading text-xl">Next cohort</CardTitle>

      {/* Optional: show selected program badge */}
      <Badge className="rounded-full">{selected.badge}</Badge>
    </div>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Meta row: Duration / Format / Level */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {[
        { icon: Clock, label: "Duration", value: selected.duration },
        { icon: Users, label: "Format", value: selected.format },
        { icon: GraduationCap, label: "Level", value: selected.level, wide: true },
      ].map((it, idx) => (
        <div
          key={idx}
          className={[
            "rounded-2xl border bg-muted/10 p-3",
            it.wide ? "col-span-2 sm:col-span-1" : "",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <it.icon className="h-4 w-4 shrink-0" />
            <span className="text-xs">{it.label}</span>
          </div>
          <div className="mt-1 text-sm font-semibold leading-snug line-clamp-2">
            {it.value}
          </div>
        </div>
      ))}
    </div>

    {/* Date / schedule / location */}
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="font-medium">Start Date</p>
          <p className="text-sm text-muted-foreground">To be announced</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-secondary mt-0.5" />
        <div>
          <p className="font-medium">Schedule</p>
          <p className="text-sm text-muted-foreground">Weekday & weekend options</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-accent mt-0.5" />
        <div>
          <p className="font-medium">Location</p>
          <p className="text-sm text-muted-foreground">Accra (shared after registration)</p>
        </div>
      </div>
    </div>

    <Separator />

    {/* Fee section */}
    <div className="rounded-2xl border bg-soft-sand/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Fee</p>
          <p className="text-lg font-heading font-bold leading-tight">
            {/* Put your real price here */}
            coming soon!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Includes materials + certificate
          </p>
        </div>

        {/* Optional: quick payment note */}
        <Badge variant="secondary" className="rounded-full h-fit text-xs">
          Limited
        </Badge>
      </div>
    </div>

    <Button size="md" className="rounded-2xl w-full" onClick={() => {
        if (handlecomingsoon()) return;
        openApply();
        }} disabled={COMING_SOON}>
      Join Now
    </Button>

    <p className="text-xs text-muted-foreground">
      Team training available (on-site or at our venue).
    </p>
  </CardContent>
</Card>
          </div>
        </section>

        {/* APPLY MODAL */}
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogContent className="sm:max-w-[720px] rounded-[1.75rem] p-0 overflow-hidden">
            <div className="relative px-6 pt-6 pb-5 bg-gradient-to-b from-soft-sand/70 via-background to-background">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-heading">Register</DialogTitle>
                <DialogDescription className="text-sm">
                  Choose a track and submit your details.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="rounded-full">{selected.badge}</Badge>
                <Badge variant="secondary" className="rounded-full">
                  {selected.duration}
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {selected.format}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleApplySubmit} className="px-6 pb-6">
              {/* honeypot */}
              <input
                value={form.website}
                onChange={onChange("website")}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={form.fullName} onChange={onChange("fullName")} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={onChange("phone")} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={onChange("email")} required />
                  {form.email.trim() && !isValidEmail(form.email) && (
                    <p className="text-xs text-muted-foreground">Enter a valid email.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={onChange("location")} required />
                </div>

                {/* Program selector */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Track</Label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {PROGRAMS.map((p) => {
                      const active = form.program === p.key;
                      return (
                        <button
                          type="button"
                          key={p.key}
                          onClick={() => onSet("program", p.key)}
                          className={[
                            "text-left rounded-2xl border px-4 py-3 transition-all",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            active ? "border-2 bg-muted/30" : "bg-background hover:bg-muted/20",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-sm">{p.title}</span>
                            <Badge
                              variant={p.badge === "Popular" ? "default" : "secondary"}
                              className="rounded-full"
                            >
                              {p.badge}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {p.duration} • {p.format}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "weekday", label: "Weekday" },
                      { key: "weekend", label: "Weekend" },
                      { key: "either", label: "Either" },
                    ].map((opt) => {
                      const active = form.schedulePreference === opt.key;
                      return (
                        <button
                          type="button"
                          key={opt.key}
                          disabled={COMING_SOON}
                            onClick={() => {
                                if (handlecomingsoon()) return;
                                openApply();
                            }}
                          className={[
                            "rounded-xl border px-3 py-2 text-sm transition-colors",
                            active ? "bg-muted/40 border-2" : "hover:bg-muted/20",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label>Level</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "beginner", label: "Beginner" },
                      { key: "intermediate", label: "Intermediate" },
                      { key: "advanced", label: "Advanced" },
                    ].map((opt) => {
                      const active = form.experienceLevel === opt.key;
                      return (
                        <button
                          type="button"
                          key={opt.key}
                            disabled={COMING_SOON}
                          onClick={() => {
                            if (handlecomingsoon()) return;
                            openApply();
                          }}
                          className={[
                            "rounded-xl border px-3 py-2 text-sm transition-colors",
                            active ? "bg-muted/40 border-2" : "hover:bg-muted/20",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="goals">Note</Label>
                  <Textarea
                    id="goals"
                    value={form.goals}
                    onChange={onChange("goals")}
                    rows={5}
                    placeholder="Short note about what you want to learn."
                    required
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{form.goals.trim().length < 10 ? "At least 10 characters." : "OK"}</span>
                    <span>{form.goals.length}/1000</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">We’ll contact you with the next steps.</p>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl w-full sm:w-auto"
                    onClick={() => setApplyOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-2xl w-full sm:w-auto"
                      onClick={() => {
                            if (handlecomingsoon()) return;
                            openApply();
                        }}
                    disabled={COMING_SOON}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}