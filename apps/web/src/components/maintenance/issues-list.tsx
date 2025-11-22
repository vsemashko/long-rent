'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MaintenanceIssue, IssueStatus, IssuePriority } from '@/types/maintenance';
import { maintenanceApi } from '@/lib/api/maintenance';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  Calendar,
  MapPin,
  Loader2,
} from 'lucide-react';

interface IssuesListProps {
  issues: MaintenanceIssue[];
  isLandlord?: boolean;
  onIssueUpdate?: () => void;
  emptyMessage?: string;
}

const statusConfig = {
  [IssueStatus.REPORTED]: {
    label: 'Reported',
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  [IssueStatus.ACKNOWLEDGED]: {
    label: 'Acknowledged',
    icon: Eye,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  [IssueStatus.IN_PROGRESS]: {
    label: 'In Progress',
    icon: Clock,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  [IssueStatus.RESOLVED]: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  [IssueStatus.CLOSED]: {
    label: 'Closed',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
  },
};

const priorityConfig = {
  [IssuePriority.LOW]: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-700',
  },
  [IssuePriority.MEDIUM]: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700',
  },
  [IssuePriority.HIGH]: {
    label: 'High',
    color: 'bg-orange-100 text-orange-700',
  },
  [IssuePriority.URGENT]: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700',
  },
};

export function IssuesList({ issues, isLandlord = false, onIssueUpdate, emptyMessage = 'No issues reported' }: IssuesListProps) {
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (issueId: string, newStatus: IssueStatus) => {
    setUpdatingId(issueId);

    try {
      await maintenanceApi.update(issueId, { status: newStatus });

      toast({
        title: 'Status updated',
        description: `Issue status changed to ${statusConfig[newStatus].label}`,
      });

      onIssueUpdate?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update status';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => {
        const StatusIcon = statusConfig[issue.status].icon;
        const isUpdating = updatingId === issue.id;

        return (
          <Card key={issue.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{issue.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={statusConfig[issue.status].color}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[issue.status].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={priorityConfig[issue.priority].color}
                      >
                        {priorityConfig[issue.priority].label} Priority
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                {issue.property && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {issue.property.title}
                    {issue.property.address?.city && (
                      <span className="ml-1">• {issue.property.address.city}</span>
                    )}
                  </div>
                )}

                {/* Reporter Info */}
                {isLandlord && issue.reporter && (
                  <div className="text-sm text-muted-foreground">
                    Reported by: {issue.reporter.profile.firstName} {issue.reporter.profile.lastName}
                  </div>
                )}

                {/* Description */}
                <p className="text-sm whitespace-pre-wrap">{issue.description}</p>

                {/* Landlord Notes */}
                {issue.notes && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Landlord Notes:</p>
                    <p className="text-sm text-blue-700">{issue.notes}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Reported {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                  {issue.resolvedAt && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolved {new Date(issue.resolvedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Landlord Actions */}
                {isLandlord && issue.status !== IssueStatus.CLOSED && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Select
                      value={issue.status}
                      onValueChange={(value) => handleStatusUpdate(issue.id, value as IssueStatus)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-[200px]">
                        {isUpdating ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </div>
                        ) : (
                          <SelectValue placeholder="Update status" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center">
                              <config.icon className="h-4 w-4 mr-2" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
