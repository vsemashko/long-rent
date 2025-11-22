'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyType, CreatePropertyRequest } from '@/types/property';
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';

const STEPS = [
  'Basic Information',
  'Location',
  'Details',
  'Features & Amenities',
  'Photos',
  'Review',
];

const propertyTypes = [
  { value: PropertyType.APARTMENT, label: 'Apartment' },
  { value: PropertyType.HOUSE, label: 'House' },
  { value: PropertyType.STUDIO, label: 'Studio' },
  { value: PropertyType.ROOM, label: 'Room' },
  { value: PropertyType.OTHER, label: 'Other' },
];

const commonAmenities = [
  'WiFi',
  'Washing Machine',
  'Dishwasher',
  'TV',
  'Microwave',
  'Oven',
  'Refrigerator',
  'Air Conditioning',
  'Heating',
  'Security System',
];

interface PhotoPreview {
  id: string;
  file: File;
  preview: string;
}

export function CreatePropertyForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);

  // Form data
  const [formData, setFormData] = useState<Partial<CreatePropertyRequest>>({
    title: '',
    description: '',
    propertyType: PropertyType.APARTMENT,
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Poland',
      district: '',
    },
    price: 0,
    deposit: 0,
    utilities: 0,
    area: 0,
    rooms: 1,
    bedrooms: 1,
    bathrooms: 1,
    floor: 0,
    totalFloors: 0,
    features: {
      furnished: false,
      parking: false,
      balcony: false,
      garden: false,
      elevator: false,
      airConditioning: false,
      heating: false,
      internetIncluded: false,
      petFriendly: false,
      accessible: false,
    },
    amenities: [],
    rules: {
      smokingAllowed: false,
      petsAllowed: false,
      childrenAllowed: true,
      partiesAllowed: false,
      maxOccupants: 2,
    },
    availableFrom: new Date().toISOString().split('T')[0],
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof CreatePropertyRequest] as any),
        [field]: value,
      },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: PhotoPreview[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const current = prev.amenities || [];
      const updated = current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity];
      return { ...prev, amenities: updated };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const property = await propertiesApi.create(formData as CreatePropertyRequest);

      // Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          await propertiesApi.uploadPhoto(property.id, photo.file);
        }
      }

      toast({
        title: 'Success!',
        description: 'Your property has been listed successfully.',
      });

      router.push(`/properties/${property.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create property',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return formData.title && formData.description && formData.propertyType;
      case 1: // Location
        return (
          formData.address?.street &&
          formData.address?.city &&
          formData.address?.postalCode
        );
      case 2: // Details
        return formData.price && formData.price > 0;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`flex-1 ${index !== STEPS.length - 1 ? 'mr-2' : ''}`}
            >
              <div
                className={`h-2 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Basic Information */}
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Spacious 2-bedroom apartment in city center"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select
                  value={formData.propertyType}
                  onValueChange={(value) => updateFormData('propertyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property in detail..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  placeholder="e.g., ul. Nowa 123/45"
                  value={formData.address?.street}
                  onChange={(e) => updateNestedField('address', 'street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Warsaw"
                    value={formData.address?.city}
                    onChange={(e) => updateNestedField('address', 'city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    placeholder="e.g., Mokotów"
                    value={formData.address?.district}
                    onChange={(e) =>
                      updateNestedField('address', 'district', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    placeholder="e.g., 00-001"
                    value={formData.address?.postalCode}
                    onChange={(e) =>
                      updateNestedField('address', 'postalCode', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.address?.country}
                    onChange={(e) => updateNestedField('address', 'country', e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (PLN) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="3000"
                    value={formData.price || ''}
                    onChange={(e) => updateFormData('price', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit">Deposit (PLN)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="3000"
                    value={formData.deposit || ''}
                    onChange={(e) => updateFormData('deposit', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilities">Utilities (PLN/month)</Label>
                <Input
                  id="utilities"
                  type="number"
                  placeholder="500"
                  value={formData.utilities || ''}
                  onChange={(e) => updateFormData('utilities', Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="60"
                    value={formData.area || ''}
                    onChange={(e) => updateFormData('area', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Number of Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    placeholder="3"
                    value={formData.rooms || ''}
                    onChange={(e) => updateFormData('rooms', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="2"
                    value={formData.bedrooms || ''}
                    onChange={(e) => updateFormData('bedrooms', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="1"
                    value={formData.bathrooms || ''}
                    onChange={(e) => updateFormData('bathrooms', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    placeholder="3"
                    value={formData.floor || ''}
                    onChange={(e) => updateFormData('floor', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">Total Floors</Label>
                  <Input
                    id="totalFloors"
                    type="number"
                    placeholder="5"
                    value={formData.totalFloors || ''}
                    onChange={(e) => updateFormData('totalFloors', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => updateFormData('availableFrom', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 3: Features & Amenities */}
          {currentStep === 3 && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold">Features</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(formData.features || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={value as boolean}
                        onChange={(e) =>
                          updateNestedField('features', key, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={key} className="text-sm cursor-pointer capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {commonAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={amenity}
                        checked={formData.amenities?.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={amenity} className="text-sm cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="smokingAllowed"
                      checked={formData.rules?.smokingAllowed}
                      onChange={(e) =>
                        updateNestedField('rules', 'smokingAllowed', e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="smokingAllowed" className="text-sm cursor-pointer">
                      Smoking Allowed
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="petsAllowed"
                      checked={formData.rules?.petsAllowed}
                      onChange={(e) =>
                        updateNestedField('rules', 'petsAllowed', e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="petsAllowed" className="text-sm cursor-pointer">
                      Pets Allowed
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="childrenAllowed"
                      checked={formData.rules?.childrenAllowed}
                      onChange={(e) =>
                        updateNestedField('rules', 'childrenAllowed', e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="childrenAllowed" className="text-sm cursor-pointer">
                      Children Allowed
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="partiesAllowed"
                      checked={formData.rules?.partiesAllowed}
                      onChange={(e) =>
                        updateNestedField('rules', 'partiesAllowed', e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="partiesAllowed" className="text-sm cursor-pointer">
                      Parties Allowed
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxOccupants">Maximum Occupants</Label>
                    <Input
                      id="maxOccupants"
                      type="number"
                      value={formData.rules?.maxOccupants || ''}
                      onChange={(e) =>
                        updateNestedField('rules', 'maxOccupants', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <>
              <div className="space-y-4">
                <Label>Property Photos</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to upload or drag and drop photos
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Title: {formData.title}</p>
                <p className="text-sm text-muted-foreground">
                  Type: {propertyTypes.find((t) => t.value === formData.propertyType)?.label}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.address?.street}, {formData.address?.city},{' '}
                  {formData.address?.postalCode}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Rent: {formData.price} PLN/month
                </p>
                {formData.deposit && (
                  <p className="text-sm text-muted-foreground">
                    Deposit: {formData.deposit} PLN
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <p className="text-sm text-muted-foreground">
                  Area: {formData.area} m² | Rooms: {formData.rooms} | Bedrooms:{' '}
                  {formData.bedrooms}
                </p>
              </div>

              {photos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Photos</h3>
                  <p className="text-sm text-muted-foreground">
                    {photos.length} photo(s) will be uploaded
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={nextStep} disabled={!canProceed()}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Publish Property'}
          </Button>
        )}
      </div>
    </div>
  );
}
