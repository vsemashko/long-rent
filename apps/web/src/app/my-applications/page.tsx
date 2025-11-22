'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, MapPin, Calendar, FileText, Home, AlertCircle } from 'lucide-react';
import { Application, ApplicationStatus } from '@/types/application';
import { applicationsApi } from '@/lib/api/applications';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Pending',
  [ApplicationStatus.UNDER_REVIEW]: 'Under Review',
  [ApplicationStatus.ACCEPTED]: 'Accepted',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.WITHDRAWN]: 'Withdrawn',
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [ApplicationStatus.UNDER_REVIEW]: 'bg-blue-100 text-blue-800 border-blue-300',
  [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-800 border-green-300',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-300',
  [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [withdrawingIds, setWithdrawingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchApplications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.status === statusFilter)
      );
    }
  }, [statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      const data = await applicationsApi.getMyApplications();
      setApplications(data);
      setFilteredApplications(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    setWithdrawingIds(prev => new Set(prev).add(applicationId));

    try {
      await applicationsApi.withdraw(applicationId);
      toast({
        title: 'Application withdrawn',
        description: 'Your application has been withdrawn',
      });
      fetchApplications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to withdraw application',
        variant: 'destructive',
      });
    } finally {
      setWithdrawingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const handleViewProperty = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
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

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track your rental applications and their status
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Label className="text-sm font-medium">Filter by status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={ApplicationStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={ApplicationStatus.UNDER_REVIEW}>Under Review</SelectItem>
              <SelectItem value={ApplicationStatus.ACCEPTED}>Accepted</SelectItem>
              <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
              <SelectItem value={ApplicationStatus.WITHDRAWN}>Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No applications found</h2>
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'all'
                  ? "You haven't submitted any applications yet"
                  : `No applications with status: ${STATUS_LABELS[statusFilter as ApplicationStatus]}`}
              </p>
              <Button onClick={() => router.push('/search')}>
                Browse Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((application) => {
              const property = application.property;
              if (!property) return null;

              const photo = property.photos?.[0];
              const isWithdrawing = withdrawingIds.has(application.id);
              const canWithdraw = application.status === ApplicationStatus.PENDING ||
                                 application.status === ApplicationStatus.UNDER_REVIEW;

              return (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Property Image */}
                      <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {photo ? (
                          <Image
                            src={photo.url}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Application Details */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              {property.title}
                            </h3>
                            <div className="flex items-center text-muted-foreground text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {property.address?.street}, {property.address?.city}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[application.status]}
                          >
                            {STATUS_LABELS[application.status]}
                          </Badge>
                        </div>

                        {/* Price */}
                        <div className="text-2xl font-bold">
                          {property.price?.toLocaleString()} {property.currency || 'PLN'}
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            / month
                          </span>
                        </div>

                        {/* Application Info */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              Applied: {new Date(application.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {application.reviewedAt && (
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Message Preview */}
                        {application.message && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm line-clamp-2">{application.message}</p>
                          </div>
                        )}

                        {/* Landlord Notes */}
                        {application.landlordNotes && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-900 mb-1">
                                  Landlord Notes
                                </p>
                                <p className="text-sm text-blue-800">
                                  {application.landlordNotes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => handleViewProperty(property.id)}
                          >
                            View Property
                          </Button>
                          {canWithdraw && (
                            <Button
                              variant="destructive"
                              onClick={() => handleWithdraw(application.id)}
                              disabled={isWithdrawing}
                            >
                              {isWithdrawing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Withdrawing...
                                </>
                              ) : (
                                'Withdraw Application'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Missing Label component import - let's add it as inline component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}
