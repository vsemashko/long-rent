import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Shield, FileCheck, Clock, Star, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-6xl">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HomeMore
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto">
              More than renting. More confidence. More comfort. More home.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Poland's first complete platform for long-term rentals. From search to contract signing,
              everything in one secure place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button size="lg" asChild>
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Find Your Home
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/for-landlords">List Your Property</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose HomeMore?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the most comprehensive rental platform to make your experience safe,
              transparent, and hassle-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Verified Users</CardTitle>
                <CardDescription>
                  All tenants and landlords are verified with ID, background checks, and reviews.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Digital Contracts</CardTitle>
                <CardDescription>
                  Legally binding e-signatures (QES) - no need for paper or office visits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Protected rent and deposit payments with escrow management and dispute resolution.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Book property viewings online and get instant confirmations and reminders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>
                  Transparent feedback system helps you make informed decisions about tenants and properties.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Smart Search</CardTitle>
                <CardDescription>
                  Advanced filters, map view, and personalized recommendations to find your perfect match.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Tenants */}
            <div>
              <h3 className="text-2xl font-bold mb-6">For Tenants</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Search & Browse</h4>
                    <p className="text-sm text-muted-foreground">
                      Find properties using advanced filters and map view
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Book Viewing</h4>
                    <p className="text-sm text-muted-foreground">
                      Schedule property visits at convenient times
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Apply & Verify</h4>
                    <p className="text-sm text-muted-foreground">
                      Submit application with verified profile
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Sign & Move In</h4>
                    <p className="text-sm text-muted-foreground">
                      Digital contract signing and secure payment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Landlords */}
            <div>
              <h3 className="text-2xl font-bold mb-6">For Landlords</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">List Property</h4>
                    <p className="text-sm text-muted-foreground">
                      Create detailed listing with photos and amenities
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Screen Tenants</h4>
                    <p className="text-sm text-muted-foreground">
                      Review verified profiles and applications
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Manage Viewings</h4>
                    <p className="text-sm text-muted-foreground">
                      Set availability and track appointments
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Sign & Collect</h4>
                    <p className="text-sm text-muted-foreground">
                      E-sign contracts and receive secure payments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl">
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of satisfied tenants and landlords on HomeMore
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Development Status */}
      <section className="py-8 px-4 bg-muted/50">
        <div className="container max-w-4xl">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              🚧 Platform under development - Phase 1 Sprint 1-2: Frontend Foundation
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
