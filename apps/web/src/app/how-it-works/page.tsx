'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Search,
  Home,
  FileText,
  Key,
  Shield,
  CreditCard,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Upload,
  Eye,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const tenantSteps = [
  {
    icon: Search,
    title: '1. Search & Discover',
    description:
      'Browse thousands of verified properties across Poland. Use advanced filters to find your perfect home based on location, price, size, and amenities.',
  },
  {
    icon: Eye,
    title: '2. View & Compare',
    description:
      'Explore detailed property listings with high-quality photos, virtual tours, and comprehensive information. Save your favorites for easy comparison.',
  },
  {
    icon: Calendar,
    title: '3. Schedule Viewings',
    description:
      'Book property viewings directly through the platform. Choose convenient time slots and communicate with landlords via secure messaging.',
  },
  {
    icon: FileText,
    title: '4. Apply Online',
    description:
      'Submit your rental application digitally with required documents. Track application status in real-time and receive updates instantly.',
  },
  {
    icon: Shield,
    title: '5. Verify & Sign',
    description:
      'Complete identity verification and e-sign your rental contract securely. All agreements are legally binding and stored safely.',
  },
  {
    icon: Key,
    title: '6. Move In',
    description:
      'Coordinate move-in details, complete the inventory check, and receive your keys. Start your new chapter with peace of mind.',
  },
];

const landlordSteps = [
  {
    icon: Upload,
    title: '1. Create Listing',
    description:
      'List your property in minutes with our easy-to-use form. Add photos, descriptions, amenities, and set your rental terms.',
  },
  {
    icon: Eye,
    title: '2. Get Visibility',
    description:
      'Your property appears in search results for verified tenants. Track views, favorites, and engagement analytics in real-time.',
  },
  {
    icon: Users,
    title: '3. Review Applications',
    description:
      'Receive applications from pre-screened tenants. Review profiles, employment history, and references all in one place.',
  },
  {
    icon: Calendar,
    title: '4. Schedule Viewings',
    description:
      'Manage your availability calendar and accept viewing requests. Coordinate multiple viewings efficiently.',
  },
  {
    icon: FileText,
    title: '5. Sign Contract',
    description:
      'Generate legally-compliant rental contracts automatically. Both parties e-sign securely with full legal validity.',
  },
  {
    icon: CreditCard,
    title: '6. Receive Payments',
    description:
      'Get paid securely through the platform. Automated rent collection, deposit management, and payment tracking.',
  },
];

const benefits = [
  {
    icon: Shield,
    title: 'Verified Users',
    description: 'All users undergo identity verification for a safe community',
  },
  {
    icon: FileText,
    title: 'Legal Contracts',
    description: 'Professionally drafted, legally-compliant rental agreements',
  },
  {
    icon: MessageSquare,
    title: 'Secure Messaging',
    description: 'Communicate safely within the platform with message history',
  },
  {
    icon: CreditCard,
    title: 'Safe Payments',
    description: 'Secure payment processing with buyer and seller protection',
  },
  {
    icon: CheckCircle2,
    title: 'Quality Assured',
    description: 'Properties verified and landlords background-checked',
  },
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Streamlined viewing and move-in coordination',
  },
];

export default function HowItWorksPage() {
  return (
    <MainLayout>
      <div className="container py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">How HomeMore Works</h1>
          <p className="text-xl text-muted-foreground">
            Your complete guide to finding or renting out properties in Poland
          </p>
        </div>

        {/* For Tenants Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">For Tenants</h2>
            <p className="text-lg text-muted-foreground">
              Find your perfect home in 6 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenantSteps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/search">
              <Button size="lg">Start Your Search</Button>
            </Link>
          </div>
        </section>

        {/* For Landlords Section */}
        <section className="bg-muted/30 -mx-4 px-4 py-16 rounded-lg">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">For Landlords</h2>
              <p className="text-lg text-muted-foreground">
                List your property and find great tenants
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {landlordSteps.map((step, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/properties/new">
                <Button size="lg">List Your Property</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose HomeMore?</h2>
            <p className="text-lg text-muted-foreground">
              Built with trust, security, and convenience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 rounded-lg border bg-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of happy tenants and landlords across Poland
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Create Account
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Browse Properties
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
