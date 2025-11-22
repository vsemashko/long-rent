'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { PropertyCard } from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { Property, PropertyType, PropertySearchFilters } from '@/types/property';
import { propertiesApi } from '@/lib/api/properties';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

const propertyTypes = [
  { value: PropertyType.APARTMENT, label: 'Apartment' },
  { value: PropertyType.HOUSE, label: 'House' },
  { value: PropertyType.STUDIO, label: 'Studio' },
  { value: PropertyType.ROOM, label: 'Room' },
  { value: PropertyType.OTHER, label: 'Other' },
];

export default function SearchPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<PropertySearchFilters>({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    propertyType: [],
    minRooms: undefined,
    maxRooms: undefined,
    minArea: undefined,
    maxArea: undefined,
  });

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await propertiesApi.search({
        ...filters,
        page,
        limit: 12,
      });

      setProperties(response.properties);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchProperties();
  };

  const handlePropertyTypeToggle = (type: PropertyType) => {
    setFilters((prev) => {
      const current = prev.propertyType || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, propertyType: updated };
    });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Perfect Home</h1>
          <p className="text-lg text-muted-foreground">
            Search through {total.toLocaleString()} available properties
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                  >
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* City */}
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="e.g., Warsaw"
                    value={filters.city || ''}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range (PLN/month)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <div className="space-y-2">
                    {propertyTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={type.value}
                          checked={filters.propertyType?.includes(type.value)}
                          onChange={() => handlePropertyTypeToggle(type.value)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={type.value} className="text-sm cursor-pointer">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div className="space-y-2">
                  <Label>Number of Rooms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minRooms || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minRooms: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxRooms || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxRooms: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <Label>Area (m²)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minArea || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minArea: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxArea || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxArea: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Search Button */}
                <Button onClick={handleSearch} className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="lg:hidden mb-4 w-full"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Results */}
            {!isLoading && properties.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {total > 12 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {page} of {Math.ceil(total / 12)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(total / 12)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No results */}
            {!isLoading && properties.length === 0 && (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
