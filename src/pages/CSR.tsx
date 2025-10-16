import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart, Users, ArrowRight } from 'lucide-react';

export default function CSR() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-soft-sand py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-heading font-bold text-4xl md:text-6xl mb-6">
              Corporate Social Responsibility
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              We believe in giving back to our community. Every purchase you make helps us support initiatives that matter.
            </p>
          </div>
        </section>

        {/* Initiatives Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cup Foundation */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 hover-lift hover:border-primary/40 transition-all">
              <div className="w-16 h-16 bg-tropical-pink/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-tropical-pink" />
              </div>
              
              <h2 className="font-heading font-bold text-3xl mb-4">Cup Foundation</h2>
              
              <p className="text-muted-foreground mb-6">
                The Cup Foundation is dedicated to providing clean drinking water and nutrition education 
                to underserved communities across Ghana. Through our juice donation programs, we ensure 
                that children have access to healthy, vitamin-rich beverages.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Impact Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Communities Reached</span>
                    <span className="font-bold text-tropical-pink">25+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Children Served</span>
                    <span className="font-bold text-tropical-pink">5,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Juice Bottles Donated</span>
                    <span className="font-bold text-tropical-pink">50,000+</span>
                  </div>
                </div>
              </div>

              <Link to="/csr/cup-foundation">
                <Button variant="secondary" className="w-full">
                  Learn More <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Project Unforgotten */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 hover-lift hover:border-accent/40 transition-all">
              <div className="w-16 h-16 bg-fresh-lime/10 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-fresh-lime" />
              </div>
              
              <h2 className="font-heading font-bold text-3xl mb-4">Project Unforgotten</h2>
              
              <p className="text-muted-foreground mb-6">
                Project Unforgotten focuses on elderly care and support. We partner with senior living 
                facilities to provide regular deliveries of fresh juice and nutritious fruit packages, 
                ensuring our elders maintain their health and vitality.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Impact Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facilities Partnered</span>
                    <span className="font-bold text-fresh-lime">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elders Served</span>
                    <span className="font-bold text-fresh-lime">800+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Deliveries</span>
                    <span className="font-bold text-fresh-lime">120+</span>
                  </div>
                </div>
              </div>

              <Link to="/csr/project-unforgotten">
                <Button variant="bulk" className="w-full">
                  Learn More <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
              Join Our Mission
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Every bulk order contributes to our CSR initiatives. Together, we can make a difference.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/products">
                <Button variant="hero" size="lg">
                  Shop & Support
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
