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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { applicationsApi } from '@/lib/api/applications';
import {
  CreateApplicationRequest,
  EmploymentInfo,
  ReferencesInfo,
  AdditionalInfo,
} from '@/types/application';
import { Loader2, Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface ApplyPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle: string;
}

const STEPS = [
  { id: 1, title: 'Cover Letter', description: 'Introduce yourself' },
  { id: 2, title: 'Employment', description: 'Employment details' },
  { id: 3, title: 'References', description: 'Rental history' },
  { id: 4, title: 'Additional Info', description: 'Additional details' },
  { id: 5, title: 'Review', description: 'Review and submit' },
];

export function ApplyPropertyDialog({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
}: ApplyPropertyDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [message, setMessage] = useState('');
  const [moveInDate, setMoveInDate] = useState('');

  const [employmentInfo, setEmploymentInfo] = useState<EmploymentInfo>({
    jobTitle: '',
    employer: '',
    monthlyIncome: undefined,
    employmentDuration: '',
  });

  const [referencesInfo, setReferencesInfo] = useState<ReferencesInfo>({
    previousLandlord: '',
    landlordContact: '',
    yearsRented: undefined,
  });

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({
    hasPets: false,
    petDetails: '',
    isSmoker: false,
    numberOfOccupants: 1,
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const data: CreateApplicationRequest = {
        propertyId,
        message: message || undefined,
        moveInDate: moveInDate || undefined,
        employmentInfo: employmentInfo.jobTitle ? employmentInfo : undefined,
        referencesInfo: referencesInfo.previousLandlord ? referencesInfo : undefined,
        additionalInfo,
      };

      await applicationsApi.create(data);

      toast({
        title: 'Application submitted',
        description: 'Your application has been sent to the landlord',
      });

      onOpenChange(false);

      // Navigate to my applications
      router.push('/my-applications');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to submit application';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setMessage('');
    setMoveInDate('');
    setEmploymentInfo({ jobTitle: '', employer: '', monthlyIncome: undefined, employmentDuration: '' });
    setReferencesInfo({ previousLandlord: '', landlordContact: '', yearsRented: undefined });
    setAdditionalInfo({ hasPets: false, petDetails: '', isSmoker: false, numberOfOccupants: 1 });
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Cover Letter (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you're interested in this property..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tell the landlord about yourself and why you'd be a great tenant
              </p>
            </div>

            <div>
              <Label htmlFor="moveInDate">Desired Move-in Date (Optional)</Label>
              <Input
                id="moveInDate"
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title (Optional)</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Software Engineer"
                value={employmentInfo.jobTitle}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, jobTitle: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="employer">Employer (Optional)</Label>
              <Input
                id="employer"
                placeholder="e.g., Tech Corp"
                value={employmentInfo.employer}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, employer: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="monthlyIncome">Monthly Income (Optional)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="e.g., 8000"
                value={employmentInfo.monthlyIncome || ''}
                onChange={(e) => setEmploymentInfo({
                  ...employmentInfo,
                  monthlyIncome: e.target.value ? parseFloat(e.target.value) : undefined
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">In PLN</p>
            </div>

            <div>
              <Label htmlFor="employmentDuration">Employment Duration (Optional)</Label>
              <Input
                id="employmentDuration"
                placeholder="e.g., 2 years"
                value={employmentInfo.employmentDuration}
                onChange={(e) => setEmploymentInfo({ ...employmentInfo, employmentDuration: e.target.value })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="previousLandlord">Previous Landlord (Optional)</Label>
              <Input
                id="previousLandlord"
                placeholder="Name of previous landlord"
                value={referencesInfo.previousLandlord}
                onChange={(e) => setReferencesInfo({ ...referencesInfo, previousLandlord: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="landlordContact">Landlord Contact (Optional)</Label>
              <Input
                id="landlordContact"
                type="tel"
                placeholder="Phone number or email"
                value={referencesInfo.landlordContact}
                onChange={(e) => setReferencesInfo({ ...referencesInfo, landlordContact: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="yearsRented">Years Rented (Optional)</Label>
              <Input
                id="yearsRented"
                type="number"
                placeholder="e.g., 2"
                value={referencesInfo.yearsRented || ''}
                onChange={(e) => setReferencesInfo({
                  ...referencesInfo,
                  yearsRented: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Providing references can strengthen your application
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPets"
                checked={additionalInfo.hasPets}
                onCheckedChange={(checked) => setAdditionalInfo({
                  ...additionalInfo,
                  hasPets: checked as boolean,
                  petDetails: checked ? additionalInfo.petDetails : ''
                })}
              />
              <Label htmlFor="hasPets" className="cursor-pointer">
                I have pets
              </Label>
            </div>

            {additionalInfo.hasPets && (
              <div>
                <Label htmlFor="petDetails">Pet Details</Label>
                <Textarea
                  id="petDetails"
                  placeholder="Describe your pets (type, breed, size, etc.)"
                  value={additionalInfo.petDetails}
                  onChange={(e) => setAdditionalInfo({ ...additionalInfo, petDetails: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSmoker"
                checked={additionalInfo.isSmoker}
                onCheckedChange={(checked) => setAdditionalInfo({
                  ...additionalInfo,
                  isSmoker: checked as boolean
                })}
              />
              <Label htmlFor="isSmoker" className="cursor-pointer">
                I am a smoker
              </Label>
            </div>

            <div>
              <Label htmlFor="numberOfOccupants">Number of Occupants</Label>
              <Input
                id="numberOfOccupants"
                type="number"
                min="1"
                placeholder="1"
                value={additionalInfo.numberOfOccupants}
                onChange={(e) => setAdditionalInfo({
                  ...additionalInfo,
                  numberOfOccupants: parseInt(e.target.value) || 1
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Including yourself
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Application Summary</h3>

              {message && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cover Letter</p>
                  <p className="text-sm line-clamp-3">{message}</p>
                </div>
              )}

              {moveInDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Move-in Date</p>
                  <p className="text-sm">{new Date(moveInDate).toLocaleDateString()}</p>
                </div>
              )}

              {employmentInfo.jobTitle && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employment</p>
                  <p className="text-sm">
                    {employmentInfo.jobTitle}
                    {employmentInfo.employer && ` at ${employmentInfo.employer}`}
                  </p>
                  {employmentInfo.monthlyIncome && (
                    <p className="text-sm">Income: {employmentInfo.monthlyIncome} PLN/month</p>
                  )}
                </div>
              )}

              {referencesInfo.previousLandlord && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">References</p>
                  <p className="text-sm">{referencesInfo.previousLandlord}</p>
                  {referencesInfo.yearsRented && (
                    <p className="text-sm">Rented for: {referencesInfo.yearsRented} years</p>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Additional Information</p>
                <p className="text-sm">
                  {additionalInfo.numberOfOccupants} occupant{additionalInfo.numberOfOccupants > 1 ? 's' : ''}
                  {additionalInfo.hasPets && ' • Has pets'}
                  {additionalInfo.isSmoker && ' • Smoker'}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              By submitting this application, you agree to share this information with the property landlord.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Apply for {propertyTitle}</DialogTitle>
          <DialogDescription>
            Complete the application form to express your interest in this property
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <p className="text-xs mt-1 hidden sm:block">{step.title}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
