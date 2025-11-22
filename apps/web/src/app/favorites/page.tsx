'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { PropertyCard } from '@/components/properties/property-card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { propertiesApi } from '@/lib/api/properties';
import { Property } from '@/types/property';
import { Loader2, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function FavoritesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/favorites');
      return;
    }

    fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const data = await propertiesApi.getFavorites();
      setProperties(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your favorites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = (propertyId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // Remove from list if unfavorited
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
          <p className="text-lg text-muted-foreground">
            Properties you've saved for later
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground">
              Start browsing properties and save your favorites
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
