'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { CreatePropertyForm } from '@/components/properties/create-property-form';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewPropertyPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/properties/new');
      return;
    }

    if (user && user.role !== 'LANDLORD' && user.role !== 'BOTH') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (user.role !== 'LANDLORD' && user.role !== 'BOTH') {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              Only landlords can create property listings.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">List Your Property</h1>
          <p className="text-lg text-muted-foreground">
            Fill in the details below to create a new property listing
          </p>
        </div>

        <CreatePropertyForm />
      </div>
    </MainLayout>
  );
}
