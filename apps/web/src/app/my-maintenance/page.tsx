'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wrench, Plus } from 'lucide-react';
import { MaintenanceIssue, IssueStatus } from '@/types/maintenance';
import { maintenanceApi } from '@/lib/api/maintenance';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { IssuesList } from '@/components/maintenance/issues-list';

export const dynamic = 'force-dynamic';

export default function MyMaintenancePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const [issues, setIssues] = useState<MaintenanceIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<IssueStatus | 'all'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchIssues();
  }, [isAuthenticated]);

  const fetchIssues = async () => {
    try {
      const data = await maintenanceApi.getMyIssues();
      setIssues(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load issues',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

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
          <h1 className="text-4xl font-bold mb-2">My Maintenance Requests</h1>
          <p className="text-muted-foreground">
            Track and manage your maintenance issues
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{issues.length}</p>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {issues.filter(i => i.status === IssueStatus.REPORTED).length}
                </p>
                <p className="text-sm text-muted-foreground">Reported</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {issues.filter(i => i.status === IssueStatus.RESOLVED).length}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({issues.length})
          </Button>
          <Button
            variant={filter === IssueStatus.REPORTED ? 'default' : 'outline'}
            onClick={() => setFilter(IssueStatus.REPORTED)}
          >
            Reported ({issues.filter(i => i.status === IssueStatus.REPORTED).length})
          </Button>
          <Button
            variant={filter === IssueStatus.IN_PROGRESS ? 'default' : 'outline'}
            onClick={() => setFilter(IssueStatus.IN_PROGRESS)}
          >
            In Progress ({issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length})
          </Button>
          <Button
            variant={filter === IssueStatus.RESOLVED ? 'default' : 'outline'}
            onClick={() => setFilter(IssueStatus.RESOLVED)}
          >
            Resolved ({issues.filter(i => i.status === IssueStatus.RESOLVED).length})
          </Button>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No issues found</h2>
              <p className="text-muted-foreground mb-4">
                {filter === 'all'
                  ? "You haven't reported any maintenance issues yet"
                  : `No ${filter.toLowerCase().replace('_', ' ')} issues`}
              </p>
              <Button onClick={() => router.push('/my-contracts')}>
                <Plus className="h-4 w-4 mr-2" />
                View My Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <IssuesList
            issues={filteredIssues}
            isLandlord={false}
            onIssueUpdate={fetchIssues}
          />
        )}
      </div>
    </MainLayout>
  );
}
