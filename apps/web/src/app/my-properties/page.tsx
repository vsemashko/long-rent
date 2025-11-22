'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { propertiesApi } from '@/lib/api/properties';
import { Property, PropertyStatus } from '@/types/property';
import {
  Loader2,
  Plus,
  MapPin,
  Home,
  Maximize2,
  Edit,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MyPropertiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/my-properties');
      return;
    }

    if (user && user.role !== 'LANDLORD' && user.role !== 'BOTH') {
      router.push('/');
      return;
    }

    fetchProperties();
  }, [isAuthenticated, user]);

  const fetchProperties = async () => {
    try {
      const data = await propertiesApi.getMyProperties();
      setProperties(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your properties',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertiesApi.delete(id);
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
      fetchProperties();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete property',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await propertiesApi.updateStatus(id, newStatus);
      toast({
        title: 'Success',
        description: 'Property status updated successfully',
      });
      // Update local state
      setProperties((prev) =>
        prev.map((prop) =>
          prop.id === id ? { ...prop, status: newStatus as PropertyStatus } : prop
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update property status',
        variant: 'destructive',
      });
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
              Only landlords can access this page.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Properties</h1>
            <p className="text-lg text-muted-foreground">
              Manage your property listings
            </p>
          </div>
          <Link href="/properties/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              List New Property
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No properties yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by creating your first property listing
            </p>
            <Link href="/properties/new">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                List Your First Property
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  {property.photos && property.photos.length > 0 && property.photos[0] ? (
                    <Image
                      src={property.photos[0].url}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                    property.status === 'ACTIVE'
                      ? 'bg-green-500 text-white'
                      : property.status === 'DRAFT'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {property.status}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">
                      {property.address.city}, {property.address.district || property.address.street}
                    </span>
                  </div>

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

                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold">
                        {property.price.toLocaleString()} {property.currency}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">/month</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{property.viewCount || 0} views</span>
                    </div>
                    {(property as any)._count?.applications > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{(property as any)._count.applications} applications</span>
                      </div>
                    )}
                  </div>

                  {/* Status Selector */}
                  <div className="mb-3">
                    <Label htmlFor={`status-${property.id}`} className="text-xs text-muted-foreground mb-1 block">
                      Status
                    </Label>
                    <Select
                      value={property.status}
                      onValueChange={(value) => handleStatusChange(property.id, value)}
                    >
                      <SelectTrigger id={`status-${property.id}`} className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PropertyStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={PropertyStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={PropertyStatus.RENTED}>Rented</SelectItem>
                        <SelectItem value={PropertyStatus.ARCHIVED}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/properties/${property.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
