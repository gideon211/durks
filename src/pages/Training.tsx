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
    bullets: ["Sourcing & hygiene SOPs", "Batching workflow", "Costing & pricing", "Retail + bulk ops"],
  },
  {
    key: "quality",
    title: "Quality Masterclass",
    badge: "Advanced",
    duration: "2 weeks",
    format: "Lab",
    level: "Intermediate → Advanced",
    bullets: ["Consistency standards", "QC checks & logs", "Cold chain basics", "Packaging consistency"],
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
  const [selectedProgram, setSelectedProgram] = React.useState<ProgramKey>("bootcamp");
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

    if (form.website.trim()) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    const phone = sanitizePhone(form.phone);

    if (!isValidEmail(form.email)) return toast.error("Please enter a valid email address.");
    if (phone.length < 9) return toast.error("Please enter a valid phone number.");
    if (form.goals.trim().length < 10) return toast.error("Please add a short note (at least 10 characters).");

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Rich Hero (less text, more premium look) */}
        <section className="relative overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 bg-gradient-to-b from-soft-sand/70 via-background to-background" />
          <div className="absolute -top-28 -right-28 h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-[30rem] w-[30rem] rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

<div className="relative container mx-auto px-4 py-12 md:py-16">
  <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
    {/* Left */}
    <div className="lg:col-span-7 ">
      {/* Chip */}
      <div className="inline-flex items-center mt-6 md:mt-10 gap-2 rounded-full border bg-background/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
        <Sparkles className="h-4 w-4" />
        DUKS Training • Practical • Premium
      </div>

      {/* Heading */}
      <h1 className="mt-6 md:mt-10 mx-auto font-heading font-bold text-3xl md:text-6xl tracking-tight leading-[1.06]">
       A premium hands-on training program for juice production & growth.
      </h1>

<div
  className={[
    // ✅ mobile: stacked, desktop: 2 columns
    "mt-8 grid gap-6 lg:gap-10",
    "grid-cols-1 lg:grid-cols-12",
    // ✅ align to top (your video is tall)
    "items-start",
  ].join(" ")}
>
  {/* VIDEO */}
  <div className="lg:col-span-7">
    <div className="relative overflow-hidden rounded-2xl ring-1 ring-border shadow-md">
      <video
        className="w-full h-[450px] sm:h-[420px] md:h-[520px] lg:h-[650px] object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/banners/training.mp4" type="video/mp4" />
      </video>

      {/* Premium overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />

      {/* subtle vignette */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  </div>

  {/* RIGHT CARD */}
  <div className="lg:col-span-5">
    <div className="lg:sticky lg:top-24">
      <div className="relative rounded-2xl border bg-card/70 backdrop-blur p-5 md:p-6 shadow-sm">
        <div className="absolute inset-x-6 -top-3 h-6 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-md" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Track</p>
            <h3 className="mt-1 font-heading font-bold text-xl">{selected.title}</h3>
          </div>
          <Badge className="rounded-full">{selected.badge}</Badge>
        </div>

<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
  {[
    { icon: Clock, label: "Duration", value: selected.duration },
    { icon: Users, label: "Format", value: selected.format },
    { icon: GraduationCap, label: "Level", value: selected.level, wide: true },
  ].map((it, idx) => (
    <div
      key={idx}
      className={[
        "rounded-2xl border bg-background/60 p-3",
        it.wide ? "col-span-2 sm:col-span-1" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <it.icon className="h-4 w-4 shrink-0" />
        <span className="text-xs">{it.label}</span>
      </div>
      <div className="mt-1 font-semibold text-sm leading-snug line-clamp-2">
        {it.value}
      </div>
    </div>
  ))}
</div>

        <Separator className="my-4" />

        <div className="space-y-2">
          {selected.bullets.slice(0, 4).map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>

        {/* CTA + Program badges */}
        <div className="mt-5 flex flex-col gap-3">
          <Button className="rounded-xl w-full py-2" onClick={() => openApply(selected.key)}>
            Register
          </Button>

          <div className="grid grid-cols-3 gap-2">
            {PROGRAMS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedProgram(p.key)}
                className={[
                  "rounded-2xl border px-3 py-3 text-xs font-medium transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  p.key === selectedProgram
                    ? "bg-muted/40 border-2"
                    : "hover:bg-muted/20 bg-background/60",
                ].join(" ")}
                aria-label={`Select ${p.title}`}
              >
                {p.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-5 grid sm:grid-cols-2 gap-2">
          <a
            href="tel:+233202427880"
            className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Call</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </a>

          <a
            href="mailto:info@duksjuice.com"
            className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Minimal subtext */}
      <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl">
        Hands-on sessions. Small cohorts. Clear SOPs.
      </p>

      {/* Buttons: no overflow, good mobile */}
      <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-start">
        <Button
          size="md"
          className="rounded-xl w-full sm:w-auto"
          onClick={() => openApply()}
        >
          Register <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button
          size="md"
          variant="outline"
          className="rounded-xl w-full sm:w-auto text-sm px-5"
          onClick={() => {
            toast.message("For enquiries, use the contact buttons below.");
          }}
        >
          Learn more
        </Button>
      </div>

      {/* Quick signals */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
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

 
  </div>
</div>
        </section>

        {/* Tracks (compact, premium cards, minimal copy) */}
        {/* <section className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-heading font-bold text-2xl md:text-4xl">Tracks</h2>
              <p className="text-muted-foreground mt-2">Choose a track. Register in seconds.</p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => openApply()}>
              Register
            </Button>
          </div>

          <div className="mt-6 grid lg:grid-cols-3 gap-5">
            {PROGRAMS.map((p) => {
              const active = p.key === selectedProgram;
              return (
                <Card
                  key={p.key}
                  className={[
                    "rounded-[1.75rem] overflow-hidden transition-all",
                    active ? "border-2 shadow-sm" : "border",
                  ].join(" ")}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg font-heading">{p.title}</CardTitle>
                      <Badge variant={p.badge === "Popular" ? "default" : "secondary"} className="rounded-full">
                        {p.badge}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border bg-muted/20 px-3 py-1">{p.duration}</span>
                      <span className="rounded-full border bg-muted/20 px-3 py-1">{p.format}</span>
                      <span className="rounded-full border bg-muted/20 px-3 py-1">{p.level}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <div className="grid grid-cols-2 gap-2">
                      {p.bullets.slice(0, 4).map((b, i) => (
                        <div key={i} className="rounded-2xl border bg-muted/10 p-3 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                            <span className="text-muted-foreground">{b}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button
                        className="rounded-2xl w-full"
                        onClick={() => {
                          setSelectedProgram(p.key);
                          openApply(p.key);
                        }}
                      >
                        Register
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl w-full"
                        onClick={() => setSelectedProgram(p.key)}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section> */}

        {/* Cohort / Logistics (compact, not salesy) */}
        <section className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-5 gap-6 items-start">
            <Card className="lg:col-span-3 rounded-[1.75rem]">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-xl md:text-2xl">How it works</CardTitle>
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

            <div className="lg:col-span-2 space-y-5">
              <Card className="rounded-[1.75rem]">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-xl">Next cohort</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Start</p>
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

                  <Button size="md" className="rounded-2xl w-full" onClick={() => openApply()}>
                    Join Now
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Team training available (on-site or at our venue).
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem]">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-xl">Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <a
                    href="tel:+233202427880"
                    className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">+233 202 427 880</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>

                  <a
                    href="mailto:info@duksjuice.com"
                    className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium">orderduksjuice@gmail.com</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* APPLY MODAL */}
        <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
          <DialogContent className="sm:max-w-[720px] rounded-[1.75rem] p-0 overflow-hidden">
            {/* Rich header strip */}
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
                          onClick={() => onSet("schedulePreference", opt.key as ApplyForm["schedulePreference"])}
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
                          onClick={() => onSet("experienceLevel", opt.key as ApplyForm["experienceLevel"])}
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
                <p className="text-xs text-muted-foreground">
                  We’ll contact you with the next steps.
                </p>

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
                  <Button type="submit" className="rounded-2xl w-full sm:w-auto" disabled={!canSubmit}>
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