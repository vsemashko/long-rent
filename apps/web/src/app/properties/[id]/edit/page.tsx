'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { CreatePropertyForm } from '@/components/properties/create-property-form';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { propertiesApi } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const propertyId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/properties/' + propertyId + '/edit');
      return;
    }

    if (user && user.role !== 'LANDLORD' && user.role !== 'BOTH') {
      router.push('/');
      return;
    }

    fetchProperty();
  }, [isAuthenticated, user, propertyId]);

  const fetchProperty = async () => {
    try {
      const data = await propertiesApi.getById(propertyId);

      // Check if user owns this property
      if (data.landlordId !== user?.id) {
        toast({
          title: 'Access Denied',
          description: 'You can only edit your own properties',
          variant: 'destructive',
        });
        router.push('/my-properties');
        return;
      }

      setProperty(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load property',
        variant: 'destructive',
      });
      router.push('/my-properties');
    } finally {
      setIsLoading(false);
    }
  };

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
              Only landlords can edit property listings.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!property) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
            <p className="text-muted-foreground">
              The property you're trying to edit doesn't exist.
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
          <h1 className="text-4xl font-bold mb-2">Edit Property</h1>
          <p className="text-lg text-muted-foreground">
            Update your property listing details
          </p>
        </div>

        <CreatePropertyForm property={property} isEditing={true} />
      </div>
    </MainLayout>
  );
}
