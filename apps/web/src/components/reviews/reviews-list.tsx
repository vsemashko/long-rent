'use client';

import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Review } from '@/types/review';

interface ReviewsListProps {
  reviews: Review[];
  showProperty?: boolean;
  emptyMessage?: string;
}

export function ReviewsList({ reviews, showProperty = false, emptyMessage = 'No reviews yet' }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {review.reviewer?.profile.firstName} {review.reviewer?.profile.lastName}
                    </p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {!review.isPublic && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    Private
                  </span>
                )}
              </div>

              {/* Property info */}
              {showProperty && review.contract?.property && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {review.contract.property.title}
                  {review.contract.property.address?.city && (
                    <span className="ml-1">• {review.contract.property.address.city}</span>
                  )}
                </div>
              )}

              {/* Comment */}
              {review.comment && (
                <p className="text-sm whitespace-pre-wrap">{review.comment}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
