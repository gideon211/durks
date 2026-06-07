import React from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, ArrowRight, Send, MessageCircle } from 'lucide-react';
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
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    color: 'bg-primary/10 text-primary',
    items: [
      { href: 'tel:+233202427880', text: '+233 202 427 880' },
      { href: 'tel:+233240076685', text: '+233 240 076 685' },
    ],
  },
  {
    icon: Mail,
    label: 'Email',
    color: 'bg-secondary/10 text-secondary',
    items: [
      { href: 'mailto:info@duksjuice.com', text: 'info@duksjuice.com' },
    ],
  },
  {
    icon: MapPin,
    label: 'Address',
    color: 'bg-accent/10 text-accent',
    items: [
      { text: 'Accra, Ghana', href: null },
    ],
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    color: 'bg-[#25D366]/10 text-[#25D366]',
    items: [
      { href: 'https://wa.me/233202427880', text: 'Chat on WhatsApp' },
    ],
  },
];

const businessHours = [
  { day: 'Monday — Friday', hours: '8:00 AM — 6:00 PM' },
  { day: 'Saturday', hours: '9:00 AM — 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
];

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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative mt-16 overflow-hidden bg-soft-sand">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/8 blur-3xl" />

          <div className="relative container mx-auto px-4 py-20 md:py-28">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2 text-sm font-medium text-primary"
              >
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Quick responses during business hours
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mt-6 font-heading font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground"
              >
                Let's start a{' '}
                <span className="text-primary">conversation</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Whether you need a bulk quote, have questions about our juices, or just want to say hello — we're all ears.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl">
                  <a href="tel:+233202427880">
                    Call now <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <a href="mailto:info@duksjuice.com">Email us</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Info + Form */}
        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Left Column */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="space-y-8"
              >
                <motion.div variants={itemVariants}>
                  <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                    Contact Information
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Reach out through any of the channels below.
                  </p>
                </motion.div>

                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <motion.div
                      key={info.label}
                      variants={itemVariants}
                      className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                    >
                      <div className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="font-semibold text-sm text-muted-foreground">{info.label}</p>
                        <div className="mt-0.5 space-y-0.5">
                          {info.items.map((item) =>
                            item.href ? (
                              <a
                                key={item.text}
                                href={item.href}
                                className="block text-foreground font-medium hover:text-primary transition-colors"
                              >
                                {item.text}
                              </a>
                            ) : (
                              <p key={item.text} className="text-foreground font-medium">
                                {item.text}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/30 p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg">Business Hours</h3>
                  </div>

                  <div className="space-y-3">
                    {businessHours.map((bh) => (
                      <div
                        key={bh.day}
                        className="flex justify-between items-center gap-4 text-sm"
                      >
                        <span className="text-muted-foreground">{bh.day}</span>
                        <span className={`font-medium ${bh.hours === 'Closed' ? 'text-destructive' : 'text-foreground'}`}>
                          {bh.hours}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Tip:</strong> For bulk orders, include your quantity and delivery location for a faster quote.
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Form */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
                >
                  <div className="mb-6">
                    <h2 className="font-heading font-bold text-2xl">Send us a Message</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Fill out the form and we'll get back to you within 1 business day.
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

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={onChange('name')}
                          placeholder="Your full name"
                          required
                          className="h-11"
                        />
                        {form.name.trim() && form.name.trim().length < 2 && (
                          <p className="text-xs text-muted-foreground">Name should be at least 2 characters.</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={onChange('email')}
                          placeholder="you@example.com"
                          required
                          className="h-11"
                        />
                        {form.email.trim() && !isValidEmail(form.email) && (
                          <p className="text-xs text-muted-foreground">Please enter a valid email.</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="company" className="text-sm font-medium">Company <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input
                          id="company"
                          value={form.company}
                          onChange={onChange('company')}
                          placeholder="Business name"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                        <Input
                          id="subject"
                          value={form.subject}
                          onChange={onChange('subject')}
                          placeholder="e.g., Bulk order quote"
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={onChange('message')}
                        placeholder="Tell us what you need — quantity, delivery location, preferred date..."
                        rows={5}
                        required
                        className="min-h-[120px] resize-y"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {form.message.trim().length < 10
                            ? 'Add a bit more detail for a faster response.'
                            : 'Looks good.'}
                        </span>
                        <span>{form.message.length}/1000</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        By sending this message, you agree we may contact you back via email or phone.
                      </p>

                      <Button
                        type="submit"
                        size="lg"
                        className="rounded-full sm:w-auto w-full gap-2"
                        disabled={!canSubmit}
                      >
                        {contactMutation.isPending ? (
                          'Sending...'
                        ) : (
                          <>
                            Send Message <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative py-16 md:py-20 bg-soft-sand overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

          <motion.div
            className="container mx-auto px-4 text-center relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="font-heading font-bold text-2xl md:text-3xl text-foreground"
            >
              Prefer to talk right now?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-3 text-muted-foreground max-w-xl mx-auto"
            >
              Give us a call or send a WhatsApp message. We're here to help.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="rounded-full shadow-lg">
                <a href="tel:+233202427880">
                  <Phone className="mr-2 h-4 w-4" />
                  +233 202 427 880
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <a href="https://wa.me/233202427880" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
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
