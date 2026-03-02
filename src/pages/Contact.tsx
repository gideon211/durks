import React from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type FormState = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  website: string; // honeypot
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

export default function Contact() {
  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot (bots fill hidden fields)
    if (form.website.trim()) {
      toast.error('Something went wrong. Please try again.');
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (form.message.trim().length < 10) {
      toast.error('Message is too short. Please add more details.');
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ TODO: Connect to your backend endpoint
      // Example:
      // const res = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: form.name,
      //     email: form.email,
      //     company: form.company,
      //     subject: form.subject,
      //     message: form.message,
      //   }),
      // });
      // if (!res.ok) throw new Error('Failed');

      await new Promise((r) => setTimeout(r, 600)); // nice UX delay (remove when API is live)

      toast.success("Message sent! We'll get back to you soon.");
      setForm(INITIAL_STATE);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative mt-10 overflow-hidden">
          {/* soft background */}
          <div className="absolute inset-0 bg-soft-sand" />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-2xl" />

          <div className="relative container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                <CheckCircle2 className="h-4 w-4" />
                Quick responses during business hours
              </div>

              <h1 className="mt-6 font-heading font-bold text-3xl md:text-6xl tracking-tight">
                Get in Touch
              </h1>

              <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Need a quote for bulk supply? Have questions about delivery and pricing? Send a message and we’ll respond
                promptly.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="rounded-xl">
                  <a href="tel:+233202427880">
                    Call now <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl">
                  <a href="mailto:info@duksjuice.com">Email us</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Left: Info */}
            <aside className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-heading font-bold text-xl mb-4">Contact Information</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">Phone</p>
                      <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                        <a
                          href="tel:+233202427880"
                          className="block hover:text-foreground transition-colors"
                        >
                          +233 202 427 880
                        </a>
                        <a
                          href="tel:+233240076685"
                          className="block hover:text-foreground transition-colors"
                        >
                          +233 240 076 685
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">Email</p>
                      <a
                        href="mailto:info@duksjuice.com"
                        className="mt-1 block text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
                      >
                        info@duksjuice.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">Address</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {/* Replace with real address */}
                        Accra, Ghana (Exact location to be provided)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/40 border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-heading font-semibold text-lg">Business Hours</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Tip: For bulk orders, include your quantity (e.g., number of crates) and delivery location for a faster
                  quote.
                </p>
              </div>
            </aside>

            {/* Right: Form */}
            <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl">Send us a Message</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    We usually reply within 1 business day.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot */}
                <input
                  value={form.website}
                  onChange={onChange('website')}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={onChange('name')}
                      placeholder="Your full name"
                      required
                    />
                    {form.name.trim() && form.name.trim().length < 2 && (
                      <p className="text-xs text-muted-foreground">Name should be at least 2 characters.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={onChange('email')}
                      placeholder="you@example.com"
                      required
                    />
                    {form.email.trim() && !isValidEmail(form.email) && (
                      <p className="text-xs text-muted-foreground">Please enter a valid email.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={onChange('company')}
                    placeholder="Business name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={onChange('subject')}
                    placeholder="e.g., Bulk order quote"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={onChange('message')}
                    placeholder="Tell us what you need (quantity, delivery location, preferred date)..."
                    rows={6}
                    required
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

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    By sending this message, you agree we may contact you back via email or phone.
                  </p>

                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-xl sm:w-auto w-full"
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}