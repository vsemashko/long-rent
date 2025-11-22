'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  FileText,
  Briefcase,
  Phone,
  Mail,
  User,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Home,
} from 'lucide-react';
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

interface GroupedApplications {
  [propertyId: string]: {
    propertyTitle: string;
    applications: Application[];
  };
}

export default function LandlordApplicationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const [applications, setApplications] = useState<Application[]>([]);
  const [groupedApplications, setGroupedApplications] = useState<GroupedApplications>({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [landlordNotes, setLandlordNotes] = useState<Record<string, string>>({});
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchApplications();
  }, [isAuthenticated]);

  useEffect(() => {
    const grouped: GroupedApplications = {};

    const filtered = statusFilter === 'all'
      ? applications
      : applications.filter(app => app.status === statusFilter);

    filtered.forEach(app => {
      if (!app.property) return;

      if (!grouped[app.propertyId]) {
        grouped[app.propertyId] = {
          propertyTitle: app.property.title,
          applications: [],
        };
      }

      grouped[app.propertyId].applications.push(app);
    });

    // Sort applications within each property by creation date (FIFO)
    Object.values(grouped).forEach(group => {
      group.applications.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    setGroupedApplications(grouped);
  }, [applications, statusFilter]);

  const fetchApplications = async () => {
    try {
      const data = await applicationsApi.getLandlordApplications();
      setApplications(data);

      // Initialize landlord notes from existing data
      const notes: Record<string, string> = {};
      data.forEach(app => {
        if (app.landlordNotes) {
          notes[app.id] = app.landlordNotes;
        }
      });
      setLandlordNotes(notes);
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

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    notes?: string
  ) => {
    setUpdatingIds(prev => new Set(prev).add(applicationId));

    try {
      await applicationsApi.update(applicationId, {
        status: newStatus,
        landlordNotes: notes,
      });

      toast({
        title: 'Application updated',
        description: `Application status changed to ${STATUS_LABELS[newStatus]}`,
      });

      fetchApplications();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application',
        variant: 'destructive',
      });
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const toggleExpanded = (applicationId: string) => {
    setExpandedApplications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
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

  const totalApplications = applications.length;
  const pendingCount = applications.filter(
    app => app.status === ApplicationStatus.PENDING
  ).length;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Applications</h1>
          <p className="text-muted-foreground">
            Review and manage rental applications for your properties
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Properties with Applications</p>
                  <p className="text-2xl font-bold">{Object.keys(groupedApplications).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
            </SelectContent>
          </Select>
        </div>

        {/* Applications by Property */}
        {Object.keys(groupedApplications).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No applications found</h2>
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'all'
                  ? "You haven't received any applications yet"
                  : `No applications with status: ${STATUS_LABELS[statusFilter as ApplicationStatus]}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedApplications).map(([propertyId, group]) => (
              <Card key={propertyId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{group.propertyTitle}</span>
                    <Badge variant="outline">
                      {group.applications.length} application
                      {group.applications.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.applications.map((application, index) => {
                    const isExpanded = expandedApplications.has(application.id);
                    const isUpdating = updatingIds.has(application.id);
                    const tenant = application.tenant;
                    if (!tenant) return null;

                    return (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        {/* Application Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                              <span className="font-semibold text-primary">#{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {tenant.profile.firstName} {tenant.profile.lastName}
                              </h3>
                              <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {tenant.email}
                                </div>
                                {tenant.profile.phoneNumber && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {tenant.profile.phoneNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={STATUS_COLORS[application.status]}
                            >
                              {STATUS_LABELS[application.status]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(application.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Application Date */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Applied: {new Date(application.createdAt).toLocaleDateString()}
                        </div>

                        {/* Message */}
                        {application.message && (
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Cover Letter</p>
                            <p className="text-sm whitespace-pre-wrap">{application.message}</p>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="space-y-3 pt-2 border-t">
                            {/* Employment Info */}
                            {application.employmentInfo && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase className="h-4 w-4 text-blue-600" />
                                  <p className="text-sm font-medium text-blue-900">
                                    Employment Information
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {application.employmentInfo.jobTitle && (
                                    <div>
                                      <span className="text-muted-foreground">Job Title:</span>
                                      <p className="font-medium">{application.employmentInfo.jobTitle}</p>
                                    </div>
                                  )}
                                  {application.employmentInfo.employer && (
                                    <div>
                                      <span className="text-muted-foreground">Employer:</span>
                                      <p className="font-medium">{application.employmentInfo.employer}</p>
                                    </div>
                                  )}
                                  {application.employmentInfo.monthlyIncome && (
                                    <div>
                                      <span className="text-muted-foreground">Monthly Income:</span>
                                      <p className="font-medium">
                                        {application.employmentInfo.monthlyIncome} PLN
                                      </p>
                                    </div>
                                  )}
                                  {application.employmentInfo.employmentDuration && (
                                    <div>
                                      <span className="text-muted-foreground">Duration:</span>
                                      <p className="font-medium">
                                        {application.employmentInfo.employmentDuration}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* References */}
                            {application.referencesInfo && (
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-purple-600" />
                                  <p className="text-sm font-medium text-purple-900">
                                    References
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {application.referencesInfo.previousLandlord && (
                                    <div>
                                      <span className="text-muted-foreground">Previous Landlord:</span>
                                      <p className="font-medium">
                                        {application.referencesInfo.previousLandlord}
                                      </p>
                                    </div>
                                  )}
                                  {application.referencesInfo.landlordContact && (
                                    <div>
                                      <span className="text-muted-foreground">Contact:</span>
                                      <p className="font-medium">
                                        {application.referencesInfo.landlordContact}
                                      </p>
                                    </div>
                                  )}
                                  {application.referencesInfo.yearsRented && (
                                    <div>
                                      <span className="text-muted-foreground">Years Rented:</span>
                                      <p className="font-medium">
                                        {application.referencesInfo.yearsRented}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Additional Info */}
                            {application.additionalInfo && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium mb-2">Additional Information</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Occupants:</span>
                                    <p className="font-medium">
                                      {application.additionalInfo.numberOfOccupants}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Pets:</span>
                                    <p className="font-medium">
                                      {application.additionalInfo.hasPets ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                  {application.additionalInfo.petDetails && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground">Pet Details:</span>
                                      <p className="font-medium">
                                        {application.additionalInfo.petDetails}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-muted-foreground">Smoker:</span>
                                    <p className="font-medium">
                                      {application.additionalInfo.isSmoker ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Landlord Notes */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Landlord Notes (Private)
                          </label>
                          <Textarea
                            placeholder="Add notes about this applicant..."
                            value={landlordNotes[application.id] || ''}
                            onChange={(e) =>
                              setLandlordNotes(prev => ({
                                ...prev,
                                [application.id]: e.target.value,
                              }))
                            }
                            rows={2}
                            className="resize-none"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={() =>
                              handleStatusUpdate(
                                application.id,
                                ApplicationStatus.UNDER_REVIEW,
                                landlordNotes[application.id]
                              )
                            }
                            disabled={
                              isUpdating ||
                              application.status === ApplicationStatus.UNDER_REVIEW
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Under Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() =>
                              handleStatusUpdate(
                                application.id,
                                ApplicationStatus.ACCEPTED,
                                landlordNotes[application.id]
                              )
                            }
                            disabled={
                              isUpdating ||
                              application.status === ApplicationStatus.ACCEPTED
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() =>
                              handleStatusUpdate(
                                application.id,
                                ApplicationStatus.REJECTED,
                                landlordNotes[application.id]
                              )
                            }
                            disabled={
                              isUpdating ||
                              application.status === ApplicationStatus.REJECTED
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          {isUpdating && (
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Missing Label component import
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={className}>{children}</span>;
}
