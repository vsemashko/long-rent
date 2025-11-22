'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Calendar,
  MapPin,
  Home,
  Clock,
  X,
} from 'lucide-react';
import { Viewing, ViewingStatus } from '@/types/viewing';
import { viewingsApi } from '@/lib/api/viewings';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const statusColors: Record<ViewingStatus, string> = {
  [ViewingStatus.SCHEDULED]: 'bg-blue-500',
  [ViewingStatus.COMPLETED]: 'bg-green-500',
  [ViewingStatus.CANCELLED]: 'bg-red-500',
  [ViewingStatus.NO_SHOW]: 'bg-gray-500',
};

const statusLabels: Record<ViewingStatus, string> = {
  [ViewingStatus.SCHEDULED]: 'Scheduled',
  [ViewingStatus.COMPLETED]: 'Completed',
  [ViewingStatus.CANCELLED]: 'Cancelled',
  [ViewingStatus.NO_SHOW]: 'No Show',
};

export default function MyViewingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchViewings();
  }, [isAuthenticated]);

  const fetchViewings = async () => {
    try {
      const data = await viewingsApi.getUserViewings();
      setViewings(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load viewings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelViewing = async (viewingId: string) => {
    try {
      await viewingsApi.cancel(viewingId);
      toast({
        title: 'Viewing cancelled',
        description: 'The viewing has been cancelled',
      });
      fetchViewings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel viewing',
        variant: 'destructive',
      });
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

  const upcomingViewings = viewings.filter(
    (v) => v.status === ViewingStatus.SCHEDULED && new Date(v.scheduledAt) > new Date()
  );
  const pastViewings = viewings.filter(
    (v) => v.status !== ViewingStatus.SCHEDULED || new Date(v.scheduledAt) <= new Date()
  );

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Viewings</h1>
          <p className="text-muted-foreground">
            Manage your property viewing appointments
          </p>
        </div>

        {viewings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No viewings scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Start browsing properties to schedule your first viewing
              </p>
              <Button onClick={() => router.push('/search')}>
                Browse Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Viewings */}
            {upcomingViewings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Upcoming Viewings</h2>
                <div className="grid gap-4">
                  {upcomingViewings.map((viewing) => (
                    <ViewingCard
                      key={viewing.id}
                      viewing={viewing}
                      onCancel={handleCancelViewing}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Viewings */}
            {pastViewings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Past Viewings</h2>
                <div className="grid gap-4">
                  {pastViewings.map((viewing) => (
                    <ViewingCard
                      key={viewing.id}
                      viewing={viewing}
                      onCancel={handleCancelViewing}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

interface ViewingCardProps {
  viewing: Viewing;
  onCancel: (id: string) => void;
  isPast?: boolean;
}

function ViewingCard({ viewing, onCancel, isPast = false }: ViewingCardProps) {
  const router = useRouter();
  const scheduledDate = new Date(viewing.scheduledAt);
  const photo = viewing.property?.photos?.[0];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Property Image */}
        <div
          className="relative h-48 md:h-auto md:w-48 flex-shrink-0 cursor-pointer"
          onClick={() => router.push(`/properties/${viewing.propertyId}`)}
        >
          {photo ? (
            <Image
              src={photo.url}
              alt={viewing.property?.title || 'Property'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Home className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Viewing Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3
                className="text-xl font-bold mb-2 cursor-pointer hover:text-primary"
                onClick={() => router.push(`/properties/${viewing.propertyId}`)}
              >
                {viewing.property?.title}
              </h3>
              <div className="flex items-center text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {viewing.property?.address.street}, {viewing.property?.address.city}
                </span>
              </div>
            </div>
            <Badge className={statusColors[viewing.status]}>
              {statusLabels[viewing.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>{format(scheduledDate, 'PPP')}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>{format(scheduledDate, 'p')}</span>
            </div>
          </div>

          {viewing.notes && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Notes:</strong> {viewing.notes}
              </p>
            </div>
          )}

          {!isPast && viewing.status === ViewingStatus.SCHEDULED && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/properties/${viewing.propertyId}`)}
              >
                View Property
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(viewing.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel Viewing
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
