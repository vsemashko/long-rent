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
import { Loader2, FileText, Home, Calendar, DollarSign, User } from 'lucide-react';
import { Contract, ContractStatus } from '@/types/contract';
import { contractsApi } from '@/lib/api/contracts';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Draft',
  [ContractStatus.PENDING_SIGNATURE]: 'Pending Signature',
  [ContractStatus.SIGNED]: 'Signed',
  [ContractStatus.ACTIVE]: 'Active',
  [ContractStatus.COMPLETED]: 'Completed',
  [ContractStatus.TERMINATED]: 'Terminated',
};

const STATUS_COLORS: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'bg-gray-100 text-gray-800 border-gray-300',
  [ContractStatus.PENDING_SIGNATURE]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [ContractStatus.SIGNED]: 'bg-blue-100 text-blue-800 border-blue-300',
  [ContractStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-300',
  [ContractStatus.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-300',
  [ContractStatus.TERMINATED]: 'bg-red-100 text-red-800 border-red-300',
};

export default function MyContractsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchContracts();
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = contracts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      if (roleFilter === 'landlord') {
        filtered = filtered.filter(contract => contract.landlordId === user?.id);
      } else if (roleFilter === 'tenant') {
        filtered = filtered.filter(contract => contract.tenantId === user?.id);
      }
    }

    setFilteredContracts(filtered);
  }, [statusFilter, roleFilter, contracts, user]);

  const fetchContracts = async () => {
    try {
      const data = await contractsApi.getMyContracts();
      setContracts(data);
      setFilteredContracts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch contracts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContract = (contractId: string) => {
    router.push(`/contracts/${contractId}`);
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

  const activeCount = contracts.filter(c => c.status === ContractStatus.ACTIVE).length;
  const pendingCount = contracts.filter(
    c => c.status === ContractStatus.PENDING_SIGNATURE || c.status === ContractStatus.SIGNED
  ).length;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Contracts</h1>
          <p className="text-muted-foreground">
            Manage your rental contracts and agreements
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
                  <p className="text-sm text-muted-foreground">Total Contracts</p>
                  <p className="text-2xl font-bold">{contracts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div>
            <label className="text-sm font-medium mr-2">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={ContractStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={ContractStatus.PENDING_SIGNATURE}>Pending Signature</SelectItem>
                <SelectItem value={ContractStatus.SIGNED}>Signed</SelectItem>
                <SelectItem value={ContractStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={ContractStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={ContractStatus.TERMINATED}>Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mr-2">Role:</label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="landlord">As Landlord</SelectItem>
                <SelectItem value="tenant">As Tenant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm text-muted-foreground ml-auto">
            {filteredContracts.length} contract{filteredContracts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Contracts List */}
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No contracts found</h2>
              <p className="text-muted-foreground mb-4">
                {statusFilter === 'all'
                  ? "You don't have any contracts yet"
                  : `No contracts with selected filters`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredContracts.map((contract) => {
              const property = contract.property;
              const isLandlord = contract.landlordId === user?.id;
              const otherParty = isLandlord ? contract.tenant : contract.landlord;
              const photo = property?.photos?.[0];

              return (
                <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Property Image */}
                      <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {photo ? (
                          <Image
                            src={photo.url}
                            alt={property?.title || 'Property'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Contract Details */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              {property?.title || 'Property'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {isLandlord ? 'Tenant' : 'Landlord'}: {otherParty?.profile.firstName}{' '}
                              {otherParty?.profile.lastName}
                            </p>
                          </div>
                          <Badge variant="outline" className={STATUS_COLORS[contract.status]}>
                            {STATUS_LABELS[contract.status]}
                          </Badge>
                        </div>

                        {/* Contract Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Monthly Rent</p>
                            <p className="font-semibold flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {contract.rentAmount.toLocaleString()} PLN
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Deposit</p>
                            <p className="font-semibold">
                              {contract.depositAmount.toLocaleString()} PLN
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                            <p className="font-semibold flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(contract.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {contract.endDate ? 'End Date' : 'Duration'}
                            </p>
                            <p className="font-semibold">
                              {contract.endDate
                                ? new Date(contract.endDate).toLocaleDateString()
                                : 'Indefinite'}
                            </p>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {isLandlord ? 'You are the Landlord' : 'You are the Tenant'}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <Button onClick={() => handleViewContract(contract.id)}>
                            View Contract
                          </Button>
                          {contract.status === ContractStatus.PENDING_SIGNATURE && (
                            <Button variant="outline" onClick={() => handleViewContract(contract.id)}>
                              Sign Contract
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
