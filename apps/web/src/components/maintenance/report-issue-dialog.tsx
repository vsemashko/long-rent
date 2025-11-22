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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { maintenanceApi } from '@/lib/api/maintenance';
import { IssuePriority } from '@/types/maintenance';
import { Loader2, AlertCircle } from 'lucide-react';

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
}

const priorityLabels = {
  [IssuePriority.LOW]: 'Low',
  [IssuePriority.MEDIUM]: 'Medium',
  [IssuePriority.HIGH]: 'High',
  [IssuePriority.URGENT]: 'Urgent',
};

const priorityDescriptions = {
  [IssuePriority.LOW]: 'Minor issue, can wait',
  [IssuePriority.MEDIUM]: 'Normal priority',
  [IssuePriority.HIGH]: 'Important, needs attention soon',
  [IssuePriority.URGENT]: 'Critical, requires immediate attention',
};

export function ReportIssueDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
}: ReportIssueDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>(IssuePriority.MEDIUM);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the issue',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe the issue',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await maintenanceApi.createIssue({
        propertyId,
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      toast({
        title: 'Issue reported',
        description: 'Your maintenance request has been submitted',
      });

      handleClose();
      router.refresh();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to report issue';
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
    setTitle('');
    setDescription('');
    setPriority(IssuePriority.MEDIUM);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Report Maintenance Issue</DialogTitle>
          <DialogDescription>
            Report an issue for {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Leaking faucet in bathroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as IssuePriority)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(IssuePriority).map((p) => (
                  <SelectItem key={p} value={p}>
                    <div className="flex flex-col">
                      <span className="font-medium">{priorityLabels[p]}</span>
                      <span className="text-xs text-muted-foreground">
                        {priorityDescriptions[p]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Be as detailed as possible to help resolve the issue quickly
            </p>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">What happens next?</p>
              <p className="text-blue-700">
                Your landlord will be notified and can update the status as they work on resolving the issue.
              </p>
            </div>
          </div>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Report Issue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
