'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Home, Maximize2, DoorOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property, PropertyType } from '@/types/property';
import { propertiesApi } from '@/lib/api/properties';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string, isFavorite: boolean) => void;
}

const propertyTypeIcons: Record<PropertyType, any> = {
  [PropertyType.APARTMENT]: Home,
  [PropertyType.HOUSE]: Home,
  [PropertyType.STUDIO]: Home,
  [PropertyType.ROOM]: DoorOpen,
  [PropertyType.OTHER]: Home,
};

const propertyTypeLabels: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: 'Apartment',
  [PropertyType.HOUSE]: 'House',
  [PropertyType.STUDIO]: 'Studio',
  [PropertyType.ROOM]: 'Room',
  [PropertyType.OTHER]: 'Other',
};

export function PropertyCard({ property, onFavoriteToggle }: PropertyCardProps) {
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const mainPhoto = property.photos?.[0];
  const Icon = propertyTypeIcons[property.propertyType];

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to save favorites',
        variant: 'destructive',
      });
      return;
    }

    setIsTogglingFavorite(true);
    try {
      const result = await propertiesApi.toggleFavorite(property.id);
      setIsFavorite(result.isFavorite);
      onFavoriteToggle?.(property.id, result.isFavorite);

      toast({
        title: result.isFavorite ? 'Added to favorites' : 'Removed from favorites',
        description: result.isFavorite
          ? 'Property saved to your favorites'
          : 'Property removed from favorites',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* Image */}
        <div className="relative h-48 bg-muted">
          {mainPhoto ? (
            <Image
              src={mainPhoto.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 rounded-full bg-background/80 hover:bg-background ${
              isFavorite ? 'text-red-500' : ''
            }`}
            onClick={handleFavoriteToggle}
            disabled={isTogglingFavorite}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>

          {/* Property type badge */}
          <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {propertyTypeLabels[property.propertyType]}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>

          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">
              {property.address.city}, {property.address.district || property.address.street}
            </span>
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {property.area && (
              <div className="flex items-center gap-1">
                <Maximize2 className="h-4 w-4" />
                <span>{property.area} m²</span>
              </div>
            )}
            {property.rooms && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>{property.rooms} rooms</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold">
                {property.price.toLocaleString()} {property.currency}
              </span>
              <span className="text-sm text-muted-foreground ml-1">/month</span>
            </div>
          </div>

          {/* Deposit */}
          {property.deposit && (
            <div className="text-xs text-muted-foreground mt-1">
              Deposit: {property.deposit.toLocaleString()} {property.currency}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
