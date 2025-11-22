'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  MapPin,
  Home,
  Maximize2,
  DoorOpen,
  Calendar,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Property, PropertyType } from '@/types/property';
import { propertiesApi } from '@/lib/api/properties';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

export const dynamic = 'force-dynamic';

const propertyTypeLabels: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: 'Apartment',
  [PropertyType.HOUSE]: 'House',
  [PropertyType.STUDIO]: 'Studio',
  [PropertyType.ROOM]: 'Room',
  [PropertyType.OTHER]: 'Other',
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      const data = await propertiesApi.getById(params.id as string);
      setProperty(data);
      setIsFavorite(data.isFavorite || false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Property not found',
        variant: 'destructive',
      });
      router.push('/search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to save favorites',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    try {
      const result = await propertiesApi.toggleFavorite(params.id as string);
      setIsFavorite(result.isFavorite);
      toast({
        title: result.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  const nextPhoto = () => {
    if (property?.photos && property.photos.length > 0) {
      const photos = property.photos;
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (property?.photos && property.photos.length > 0) {
      const photos = property.photos;
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? photos.length - 1 : prev - 1
      );
    }
  };

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
    return null;
  }

  const photos = property.photos || [];
  const hasPhotos = photos.length > 0;

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-[500px] rounded-lg overflow-hidden bg-muted">
            {hasPhotos && photos[currentPhotoIndex] ? (
              <>
                <Image
                  src={photos[currentPhotoIndex].url}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevPhoto}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextPhoto}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                      {currentPhotoIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="h-32 w-32 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                    index === currentPhotoIndex
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                    {propertyTypeLabels[property.propertyType]}
                  </span>
                  <h1 className="text-4xl font-bold">{property.title}</h1>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleFavoriteToggle}
                    className={isFavorite ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {property.address.street}, {property.address.city},{' '}
                  {property.address.postalCode}
                </span>
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.area && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Maximize2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{property.area}</div>
                    <div className="text-sm text-muted-foreground">m²</div>
                  </CardContent>
                </Card>
              )}
              {property.rooms && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{property.rooms}</div>
                    <div className="text-sm text-muted-foreground">Rooms</div>
                  </CardContent>
                </Card>
              )}
              {property.bedrooms && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <DoorOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </CardContent>
                </Card>
              )}
              {property.availableFrom && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-semibold">Available From</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(property.availableFrom).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{property.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            {property.features && Object.keys(property.features).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(property.features)
                      .filter(([_, value]) => value === true)
                      .map(([key]) => (
                        <div key={key} className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    {property.price.toLocaleString()} {property.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>

                {property.deposit && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit</span>
                      <span className="font-semibold">
                        {property.deposit.toLocaleString()} {property.currency}
                      </span>
                    </div>
                  </div>
                )}

                {property.utilities && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Utilities</span>
                    <span className="font-semibold">
                      {property.utilities.toLocaleString()} {property.currency}
                    </span>
                  </div>
                )}

                <Button className="w-full" size="lg">
                  Contact Landlord
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Schedule Viewing
                </Button>

                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  {property.viewCount} views
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
