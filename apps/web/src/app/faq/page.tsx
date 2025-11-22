'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, Home, FileText, Shield, CreditCard, MessageSquare } from 'lucide-react';

const faqCategories = [
  {
    title: 'Getting Started',
    icon: Home,
    questions: [
      {
        q: 'What is HomeMore?',
        a: 'HomeMore is a comprehensive rental platform that connects tenants and landlords in Poland. We provide tools for property search, applications, contracts, payments, and maintenance management all in one place.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button in the top right corner. You can register as a tenant, landlord, or both. Fill in your email, password, and basic information to get started.',
      },
      {
        q: 'Is HomeMore free to use?',
        a: 'Browsing properties and basic features are free. Premium features and transaction processing may have associated fees. Check our pricing page for detailed information.',
      },
    ],
  },
  {
    title: 'For Tenants',
    icon: Search,
    questions: [
      {
        q: 'How do I search for properties?',
        a: 'Use the search page to filter properties by city, price range, property type, number of rooms, and more. You can save your favorite properties and set up search alerts.',
      },
      {
        q: 'How do I apply for a property?',
        a: 'Once you find a property you like, click "Apply Now" on the property detail page. You\'ll fill out an application with your employment information, references, and personal details.',
      },
      {
        q: 'Can I schedule a viewing?',
        a: 'Yes! Each property listing has a "Schedule Viewing" button. Choose from available time slots or request a specific time. The landlord will confirm your appointment.',
      },
      {
        q: 'How do I report maintenance issues?',
        a: 'Go to "My Maintenance" in the navigation menu. Click "Report Issue", select the property, describe the problem, and set the priority. Your landlord will be notified immediately.',
      },
    ],
  },
  {
    title: 'For Landlords',
    icon: FileText,
    questions: [
      {
        q: 'How do I list my property?',
        a: 'After registering as a landlord, click "List Property" in the navigation. Fill in the property details, upload photos, set the rent amount, and publish your listing.',
      },
      {
        q: 'How do I review applications?',
        a: 'Go to "Applications" in the landlord menu. You\'ll see all applications organized by property. Review applicant details, employment info, and references, then accept or reject.',
      },
      {
        q: 'How do I manage maintenance requests?',
        a: 'Access "Maintenance" from the landlord menu. You\'ll see all issues reported for your properties. Update the status (acknowledged, in progress, resolved) as you work on them.',
      },
      {
        q: 'Can I create digital contracts?',
        a: 'Yes! Once you accept an application, you can create a contract from the "Contracts" section. Fill in the terms, and both parties can sign digitally.',
      },
    ],
  },
  {
    title: 'Payments & Contracts',
    icon: CreditCard,
    questions: [
      {
        q: 'How do payments work?',
        a: 'We integrate with Stripe for secure payment processing. Tenants can pay rent, deposits, and utilities through the platform. All transactions are encrypted and secure.',
      },
      {
        q: 'When is rent due?',
        a: 'Rent due dates are specified in your contract. You\'ll receive notifications before payment is due. You can set up recurring payments for convenience.',
      },
      {
        q: 'How do I get my deposit back?',
        a: 'After your lease ends and the final inspection is complete, the landlord initiates the deposit return through the platform. Funds are typically returned within 7-14 days.',
      },
      {
        q: 'Are contracts legally binding?',
        a: 'Yes! Our digital contracts comply with Polish rental law. Both parties\' signatures are collected electronically and the contract is legally enforceable.',
      },
    ],
  },
  {
    title: 'Communication & Reviews',
    icon: MessageSquare,
    questions: [
      {
        q: 'How do I message landlords?',
        a: 'Click the "Message" button on any property listing or go to the "Messages" section. You can chat with landlords in real-time about properties you\'re interested in.',
      },
      {
        q: 'Can I leave reviews?',
        a: 'Yes! After your rental contract ends, you can leave a review for the landlord. Similarly, landlords can review tenants. Reviews help build trust in the community.',
      },
      {
        q: 'Are reviews public?',
        a: 'You can choose to make your review public or private when submitting. Public reviews help other users make informed decisions.',
      },
    ],
  },
  {
    title: 'Security & Privacy',
    icon: Shield,
    questions: [
      {
        q: 'Is my personal information safe?',
        a: 'Yes! We use industry-standard encryption to protect your data. We comply with GDPR and never share your personal information without your consent.',
      },
      {
        q: 'How do you verify users?',
        a: 'We verify email addresses during registration. Identity verification and employment verification can be provided during the application process for added trust.',
      },
      {
        q: 'What should I do if I encounter a scam?',
        a: 'Report it immediately using the "Report" button on the listing or user profile. Contact our support team at support@homemore.pl. Never send money outside the platform.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, you have the right to delete your account and all associated data at any time. Go to Settings > Account > Delete Account. This action is permanent.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <MainLayout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about using HomeMore
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-semibold">{category.title}</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, qIndex) => (
                        <AccordionItem key={qIndex} value={`item-${index}-${qIndex}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-12 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
                <p className="text-muted-foreground mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:support@homemore.pl"
                    className="text-primary hover:underline font-medium"
                  >
                    support@homemore.pl
                  </a>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <a
                    href="/contact"
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Form
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
