import { useState } from 'react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function BulkQuote() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Quote request submitted! We\'ll get back to you within 24 hours.');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-soft-sand py-4">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">
              Get Your Bulk Order Now..
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Need a quote for 200 crates? We'll sort it. Fill out the form below and we'll send you a customized quote within 24 hours.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border-2 border-border rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" placeholder="" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" placeholder="" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" placeholder="" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-type">Product Type *</Label>
                  <Input id="product-type" placeholder="e.g., Pure Juice, Smoothies, Mixed Pack" required />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Estimated Quantity *</Label>
                    <Input id="quantity" type="number" placeholder="e.g., 200" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Order Frequency</Label>
                    <Input id="frequency" placeholder="e.g., Weekly, Monthly, One-time" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery">Delivery Location *</Label>
                  <Input id="delivery" placeholder="City or specific address" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Tell us about your event, special packaging needs, branding requirements, delivery schedule preferences, etc."
                    rows={5}
                  />
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Request Quote'}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  We'll review your request and send you a detailed quote within 24 hours.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
