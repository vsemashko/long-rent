'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { reviewsApi } from '@/lib/api/reviews';
import { Star, Loader2 } from 'lucide-react';

interface SubmitReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  revieweeId: string;
  revieweeName: string;
  propertyTitle: string;
}

export function SubmitReviewDialog({
  open,
  onOpenChange,
  contractId,
  revieweeId,
  revieweeName,
  propertyTitle,
}: SubmitReviewDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewsApi.create({
        contractId,
        revieweeId,
        rating,
        comment: comment || undefined,
        isPublic,
      });

      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback',
      });

      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to submit review';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setIsPublic(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review {revieweeName}</DialogTitle>
          <DialogDescription>
            Share your experience for {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} star{rating > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Be honest and respectful in your review
            </p>
          </div>

          {/* Public checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="isPublic"
              className="text-sm cursor-pointer"
            >
              Make this review public
            </Label>
          </div>

          <p className="text-xs text-muted-foreground">
            Public reviews help other users make informed decisions. Private reviews are only
            visible to you and {revieweeName}.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
