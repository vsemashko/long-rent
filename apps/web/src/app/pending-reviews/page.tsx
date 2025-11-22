'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Calendar, Home } from 'lucide-react';
import { PendingReview } from '@/types/review';
import { reviewsApi } from '@/lib/api/reviews';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { SubmitReviewDialog } from '@/components/reviews/submit-review-dialog';

export const dynamic = 'force-dynamic';

export default function PendingReviewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchPendingReviews();
  }, [isAuthenticated]);

  const fetchPendingReviews = async () => {
    try {
      const data = await reviewsApi.getPendingReviews();
      setPendingReviews(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pending reviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClick = (review: PendingReview) => {
    setSelectedReview(review);
    setReviewDialogOpen(true);
  };

  const handleDialogClose = () => {
    setReviewDialogOpen(false);
    setSelectedReview(null);
    fetchPendingReviews(); // Refresh the list
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
          <h1 className="text-4xl font-bold mb-2">Pending Reviews</h1>
          <p className="text-muted-foreground">
            Leave reviews for your completed rentals
          </p>
        </div>

        {pendingReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No pending reviews</h2>
              <p className="text-muted-foreground mb-4">
                You've reviewed all your completed rentals
              </p>
              <Button onClick={() => router.push('/my-contracts')}>
                View My Contracts
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingReviews.map((review) => (
              <Card key={review.contractId}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Property Icon */}
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg flex-shrink-0">
                      <Home className="h-8 w-8 text-primary" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold">{review.property.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {review.property.address?.street}, {review.property.address?.city}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Ended: {new Date(review.contractEndDate).toLocaleDateString()}
                        </div>
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {review.contractStatus}
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">
                          Review for:{' '}
                          <span className="font-semibold">
                            {review.otherParty.profile.firstName}{' '}
                            {review.otherParty.profile.lastName}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Share your experience to help the community
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center">
                      <Button
                        onClick={() => handleReviewClick(review)}
                        className="w-full md:w-auto"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Leave Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedReview && (
        <SubmitReviewDialog
          open={reviewDialogOpen}
          onOpenChange={handleDialogClose}
          contractId={selectedReview.contractId}
          revieweeId={selectedReview.otherParty.id}
          revieweeName={`${selectedReview.otherParty.profile.firstName} ${selectedReview.otherParty.profile.lastName}`}
          propertyTitle={selectedReview.property.title}
        />
      )}
    </MainLayout>
  );
}
