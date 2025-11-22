'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Viewing, ViewingStatus } from '@/types/viewing';
import { viewingsApi } from '@/lib/api/viewings';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';

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

export default function LandlordViewingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchViewings();
  }, [isAuthenticated]);

  const fetchViewings = async () => {
    try {
      const data = await viewingsApi.getLandlordViewings();
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

  const handleStatusUpdate = async (viewingId: string, newStatus: ViewingStatus) => {
    try {
      await viewingsApi.update(viewingId, { status: newStatus });
      toast({
        title: 'Status updated',
        description: `Viewing marked as ${statusLabels[newStatus].toLowerCase()}`,
      });
      fetchViewings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update viewing status',
        variant: 'destructive',
      });
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

  const filteredViewings = viewings.filter((v) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') {
      return v.status === ViewingStatus.SCHEDULED && new Date(v.scheduledAt) > new Date();
    }
    return v.status === filterStatus;
  });

  const upcomingCount = viewings.filter(
    (v) => v.status === ViewingStatus.SCHEDULED && new Date(v.scheduledAt) > new Date()
  ).length;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Viewings</h1>
          <p className="text-muted-foreground">
            View and manage all property viewing requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{viewings.length}</div>
              <div className="text-sm text-muted-foreground">Total Viewings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{upcomingCount}</div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">
                {viewings.filter((v) => v.status === ViewingStatus.COMPLETED).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">
                {viewings.filter((v) => v.status === ViewingStatus.CANCELLED).length}
              </div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Viewings</h2>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Viewings</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Viewings List */}
        {filteredViewings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No viewings found</h3>
              <p className="text-muted-foreground">
                {filterStatus === 'all'
                  ? 'You have no viewing requests yet'
                  : 'No viewings match the selected filter'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredViewings.map((viewing) => (
              <LandlordViewingCard
                key={viewing.id}
                viewing={viewing}
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancelViewing}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

interface LandlordViewingCardProps {
  viewing: Viewing;
  onStatusUpdate: (id: string, status: ViewingStatus) => void;
  onCancel: (id: string) => void;
}

function LandlordViewingCard({
  viewing,
  onStatusUpdate,
  onCancel,
}: LandlordViewingCardProps) {
  const router = useRouter();
  const scheduledDate = new Date(viewing.scheduledAt);
  const isPast = scheduledDate < new Date();
  const isScheduled = viewing.status === ViewingStatus.SCHEDULED;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle
              className="cursor-pointer hover:text-primary"
              onClick={() => router.push(`/properties/${viewing.propertyId}`)}
            >
              {viewing.property?.title}
            </CardTitle>
            <div className="flex items-center text-muted-foreground mt-1">
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Viewing Details */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-2">Viewing Details</h4>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>{format(scheduledDate, 'PPP')}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>{format(scheduledDate, 'p')}</span>
            </div>
            {viewing.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground">
                  <strong>Notes:</strong> {viewing.notes}
                </p>
              </div>
            )}
          </div>

          {/* Tenant Information */}
          <div className="space-y-3">
            <h4 className="font-semibold mb-2">Tenant Information</h4>
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-primary" />
              <span>
                {viewing.tenant?.profile.firstName} {viewing.tenant?.profile.lastName}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              <span>{viewing.tenant?.email}</span>
            </div>
            {viewing.tenant?.profile.phoneNumber && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span>{viewing.tenant.profile.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isScheduled && !isPast && (
          <div className="flex gap-2 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => onStatusUpdate(viewing.id, ViewingStatus.COMPLETED)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Completed
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-600 hover:bg-gray-50"
              onClick={() => onStatusUpdate(viewing.id, ViewingStatus.NO_SHOW)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Mark No Show
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(viewing.id)}
            >
              Cancel Viewing
            </Button>
          </div>
        )}

        {isScheduled && isPast && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              This viewing is in the past. Update its status:
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => onStatusUpdate(viewing.id, ViewingStatus.COMPLETED)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-600 hover:bg-gray-50"
                onClick={() => onStatusUpdate(viewing.id, ViewingStatus.NO_SHOW)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                No Show
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
