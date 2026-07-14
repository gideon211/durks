"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Phone,
  Envelope,
  MapPin,
  Clock,
  PaperPlaneTilt,
  WhatsappLogo,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import api from '@/api/axios';

type FormState = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  website: string;
};

const INITIAL_STATE: FormState = {
  name: '',
  email: '',
  company: '',
  subject: '',
  message: '',
  website: '',
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 0.1, 0, 1] },
  },
};

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    items: [
      { href: 'tel:+233202427880' as string, text: '+233 202 427 880' },
      { href: 'tel:+233240076685' as string, text: '+233 240 076 685' },
    ],
  },
  {
    icon: Envelope,
    label: 'Email',
    items: [
      { href: 'mailto:info@duksjuice.com' as string, text: 'info@duksjuice.com' },
    ],
  },
  {
    icon: MapPin,
    label: 'Address',
    items: [{ href: null as string | null, text: 'Accra, Ghana' }],
  },
  {
    icon: WhatsappLogo,
    label: 'WhatsApp',
    items: [
      { href: 'https://wa.me/233202427880' as string, text: 'Chat on WhatsApp' },
    ],
  },
];

const businessHours = [
  { day: 'Mon \u2014 Fri', hours: '8:00 AM \u2014 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM \u2014 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
];

const bezelOuter = 'p-px rounded-2xl bg-gradient-to-b from-black/[0.04] to-transparent dark:from-white/[0.06] dark:to-transparent';
const bezelInner = 'rounded-[calc(1rem-1px)] bg-white dark:bg-card h-full';

const inputBezelOuter = 'p-px rounded-xl bg-black/[0.05] dark:bg-white/[0.08]';
const inputBezelInner = 'rounded-[calc(0.75rem-1px)] bg-white dark:bg-card';

function InfoCard({ icon: Icon, label, items, spanFull }: { icon: React.ElementType; label: string; items: { href: string | null; text: string }[]; spanFull?: boolean }) {
  return (
    <motion.div
      variants={itemVariants}
      className={spanFull ? 'col-span-1 sm:col-span-2' : ''}
    >
      <div className={`${bezelOuter} h-full group`}>
        <div className={`${bezelInner} p-4 md:p-5 lg:p-6 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5`}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon size={18} weight="light" className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em] mb-1">
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) =>
                  item.href ? (
                    <a
                      key={item.text}
                      href={item.href}
                      className="block text-sm font-medium text-foreground hover:text-primary transition-colors duration-300"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <p key={item.text} className="text-sm font-medium text-foreground">
                      {item.text}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Contact() {
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);

  const contactMutation = useMutation({
    mutationFn: () =>
      api.post("/contact", {
        name: form.name,
        email: form.email,
        company: form.company,
        subject: form.subject,
        message: form.message,
      }),
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you soon.");
      setForm(INITIAL_STATE);
    },
    onError: (err) => {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data?: { message?: string } } }).response?.data?.message || "Failed to send message. Please try again."
          : "Failed to send message. Please try again.";
      toast.error(message);
    },
  });

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const canSubmit =
    form.name.trim().length >= 2 &&
    isValidEmail(form.email) &&
    form.subject.trim().length >= 3 &&
    form.message.trim().length >= 10 &&
    !contactMutation.isPending;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.website.trim()) {
      toast.error('Something went wrong. Please try again.');
      return;
    }

    contactMutation.mutate();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative mt-16 overflow-hidden bg-soft-sand">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-secondary/[0.02]" />

          <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground bg-black/[0.03] dark:bg-white/[0.06]"
              >
                <span className="w-1 h-1 rounded-full bg-primary" />
                Get in touch
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mt-6 md:mt-8 font-heading font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight text-foreground text-balance"
              >
                Let&apos;s start a{' '}
                <span className="text-primary">conversation</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-4 md:mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance"
              >
                Whether you need a bulk quote, have questions about our juices, or just want to say hello.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg" className="group rounded-full px-8 py-6 text-base overflow-hidden">
                  <a href="tel:+233202427880" className="inline-flex items-center gap-3">
                    <span>Call now</span>
                    <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <Phone size={14} weight="fill" />
                    </span>
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
                  <a href="mailto:info@duksjuice.com">Email us</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Info + Form */}
        <section className="relative py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 xl:gap-16">
              {/* Left: Bento info */}
              <motion.div
                className="lg:col-span-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.div variants={itemVariants} className="mb-6 md:mb-8 lg:mb-10">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground bg-black/[0.03] dark:bg-white/[0.06]">
                    Contact info
                  </span>
                  <h2 className="mt-4 font-heading font-bold text-2xl md:text-3xl text-foreground text-balance">
                    Ways to reach us
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose the channel that works best for you.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard icon={Phone} label="Phone" items={contactInfo[0].items} />
                  <InfoCard icon={Envelope} label="Email" items={contactInfo[1].items} />
                  <InfoCard icon={MapPin} label="Address" items={contactInfo[2].items} spanFull />

                  <InfoCard icon={WhatsappLogo} label="WhatsApp" items={contactInfo[3].items} />

                  {/* Business Hours */}
                  <motion.div variants={itemVariants}>
                    <div className={`${bezelOuter} h-full`}>
                      <div className={`${bezelInner} p-4 md:p-5 lg:p-6`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Clock size={18} weight="light" className="text-primary" />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">
                            Hours
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          {businessHours.map((bh) => (
                            <div key={bh.day} className="flex justify-between items-center gap-4">
                              <span className="text-xs text-muted-foreground">{bh.day}</span>
                              <span className={`text-xs font-medium tabular-nums ${bh.hours === 'Closed' ? 'text-destructive/70' : 'text-foreground'}`}>
                                {bh.hours}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            <span className="text-foreground font-medium">Tip:</span> For bulk orders, include your quantity and location for a faster quote.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right: Form */}
              <motion.div
                className="lg:col-span-3"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.div variants={itemVariants}>
                  <div className="p-[1.5px] rounded-[1.75rem] bg-gradient-to-b from-black/[0.05] to-transparent dark:from-white/[0.06] dark:to-transparent">
                    <div className="rounded-[calc(1.75rem-1.5px)] bg-white dark:bg-card p-6 md:p-8 lg:p-10 xl:p-12">
                      <div className="mb-6 md:mb-8">
                        <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                          Send a message
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          We typically respond within one business day.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                          value={form.website}
                          onChange={onChange('website')}
                          tabIndex={-1}
                          autoComplete="off"
                          className="hidden"
                          aria-hidden="true"
                        />

                        <div className="grid sm:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium text-foreground">Full name</Label>
                            <div className={inputBezelOuter}>
                              <div className={inputBezelInner}>
                                <Input
                                  id="name"
                                  value={form.name}
                                  onChange={onChange('name')}
                                  placeholder="Your full name"
                                  required
                                  className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                              </div>
                            </div>
                            {form.name.trim() && form.name.trim().length < 2 && (
                              <p className="text-[11px] text-muted-foreground">At least 2 characters.</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
                            <div className={inputBezelOuter}>
                              <div className={inputBezelInner}>
                                <Input
                                  id="email"
                                  type="email"
                                  value={form.email}
                                  onChange={onChange('email')}
                                  placeholder="you@example.com"
                                  required
                                  className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                              </div>
                            </div>
                            {form.email.trim() && !isValidEmail(form.email) && (
                              <p className="text-[11px] text-muted-foreground">Enter a valid email.</p>
                            )}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <Label htmlFor="company" className="text-sm font-medium text-foreground">Company <span className="font-normal text-muted-foreground">(optional)</span></Label>
                            <div className={inputBezelOuter}>
                              <div className={inputBezelInner}>
                                <Input
                                  id="company"
                                  value={form.company}
                                  onChange={onChange('company')}
                                  placeholder="Business name"
                                  className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</Label>
                            <div className={inputBezelOuter}>
                              <div className={inputBezelInner}>
                                <Input
                                  id="subject"
                                  value={form.subject}
                                  onChange={onChange('subject')}
                                  placeholder="e.g. Bulk order quote"
                                  required
                                  className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="message" className="text-sm font-medium text-foreground">Message</Label>
                          <div className={inputBezelOuter}>
                            <div className={inputBezelInner}>
                              <Textarea
                                id="message"
                                value={form.message}
                                onChange={onChange('message')}
                                placeholder="Tell us what you need \u2014 quantity, delivery location, preferred date..."
                                rows={5}
                                required
                                className="min-h-[120px] resize-y border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>
                              {form.message.trim().length < 10
                                ? 'Add a bit more detail for a faster response.'
                                : 'Looks good.'}
                            </span>
                            <span className="tabular-nums">{form.message.length}/1000</span>
                          </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs">
                            By sending this message, you agree we may contact you back via your provided details.
                          </p>

                          <Button
                            type="submit"
                            size="lg"
                            disabled={!canSubmit}
                            className="group rounded-full px-8 py-6 text-sm font-medium overflow-hidden disabled:opacity-40 sm:w-auto w-full"
                          >
                            {contactMutation.isPending ? (
                              <span className="inline-flex items-center gap-3">
                                Sending
                                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-3">
                                <span>Send message</span>
                                <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                  <PaperPlaneTilt size={14} weight="fill" />
                                </span>
                              </span>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative py-16 md:py-24 lg:py-32 bg-soft-sand overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-black/[0.06] dark:via-white/[0.08] to-transparent" />

          <motion.div
            className="container mx-auto px-4 text-center relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="max-w-xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground bg-black/[0.03] dark:bg-white/[0.06]">
                Need immediate help?
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mt-5 md:mt-6 font-heading font-bold text-3xl md:text-4xl text-foreground text-balance"
            >
              Prefer to talk right now?
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-2 md:mt-3 text-sm text-muted-foreground max-w-md mx-auto text-balance"
            >
              Give us a call or send a WhatsApp message. We respond fast.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="group rounded-full px-8 py-6 text-base overflow-hidden">
                <a href="tel:+233202427880" className="inline-flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <Phone size={14} weight="fill" />
                  </span>
                  +233 202 427 880
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="group rounded-full px-8 py-6 text-base overflow-hidden">
                <a href="https://wa.me/233202427880" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <WhatsappLogo size={14} weight="fill" className="text-primary" />
                  </span>
                  WhatsApp
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
