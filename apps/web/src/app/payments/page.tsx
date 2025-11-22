'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import { Payment, PaymentStatus, PaymentType } from '@/types/payment';
import { paymentsApi } from '@/lib/api/payments';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.RENT]: 'Rent',
  [PaymentType.DEPOSIT]: 'Deposit',
  [PaymentType.UTILITIES]: 'Utilities',
  [PaymentType.OTHER]: 'Other',
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.PROCESSING]: 'Processing',
  [PaymentStatus.COMPLETED]: 'Completed',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.REFUNDED]: 'Refunded',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [PaymentStatus.PROCESSING]: 'bg-blue-100 text-blue-800 border-blue-300',
  [PaymentStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-300',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800 border-red-300',
  [PaymentStatus.REFUNDED]: 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function PaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchPayments();
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = payments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.type === typeFilter);
    }

    setFilteredPayments(filtered);
  }, [statusFilter, typeFilter, payments]);

  const fetchPayments = async () => {
    try {
      const data = await paymentsApi.getMyPayments();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  const totalPaid = payments
    .filter(p => p.payerId === user?.id && p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalReceived = payments
    .filter(p => p.payeeId === user?.id && p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Payment History</h1>
          <p className="text-muted-foreground">
            Track all your rental payments and transactions
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
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">{totalPaid.toLocaleString()} PLN</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold">{totalReceived.toLocaleString()} PLN</p>
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={PaymentStatus.PROCESSING}>Processing</SelectItem>
                <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mr-2">Type:</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={PaymentType.RENT}>Rent</SelectItem>
                <SelectItem value={PaymentType.DEPOSIT}>Deposit</SelectItem>
                <SelectItem value={PaymentType.UTILITIES}>Utilities</SelectItem>
                <SelectItem value={PaymentType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="text-sm text-muted-foreground ml-auto">
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No payments found</h2>
              <p className="text-muted-foreground">
                {statusFilter === 'all'
                  ? "You don't have any payment records yet"
                  : `No payments with selected filters`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.map((payment) => {
                  const isPayer = payment.payerId === user?.id;
                  const otherParty = isPayer ? payment.payee : payment.payer;

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${isPayer ? 'bg-red-100' : 'bg-green-100'}`}>
                          {isPayer ? (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{TYPE_LABELS[payment.type]}</p>
                            <Badge variant="outline" className={STATUS_COLORS[payment.status]}>
                              {STATUS_LABELS[payment.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isPayer ? 'To' : 'From'}: {otherParty?.profile.firstName}{' '}
                            {otherParty?.profile.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(payment.createdAt).toLocaleDateString()}
                            {payment.processedAt && (
                              <span className="ml-2">
                                • Processed: {new Date(payment.processedAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                          {payment.contract?.property && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Property: {payment.contract.property.title}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-2xl font-bold ${isPayer ? 'text-red-600' : 'text-green-600'}`}>
                          {isPayer ? '-' : '+'}
                          {Number(payment.amount).toLocaleString()} {payment.currency}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
