'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyPhoto } from '@/types/property';
import { X, Upload, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortablePhotoItemProps {
  photo: PropertyPhoto;
  onDelete: (photoId: string) => void;
}

function SortablePhotoItem({ photo, onDelete }: SortablePhotoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Photo Preview */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <Image src={photo.url} alt={photo.caption || 'Property photo'} fill className="object-cover" />
      </div>

      {/* Photo Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{photo.caption || 'Untitled'}</p>
        <p className="text-xs text-muted-foreground">Order: {photo.order + 1}</p>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(photo.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface PhotoGalleryManagerProps {
  propertyId: string;
  initialPhotos: PropertyPhoto[];
  onPhotosChange?: (photos: PropertyPhoto[]) => void;
}

export function PhotoGalleryManager({
  propertyId,
  initialPhotos,
  onPhotosChange,
}: PhotoGalleryManagerProps) {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<PropertyPhoto[]>(
    [...initialPhotos].sort((a, b) => a.order - b.order)
  );
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex).map((photo, index) => ({
        ...photo,
        order: index,
      }));

      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);

      try {
        await propertiesApi.reorderPhotos(
          propertyId,
          newPhotos.map((p) => ({ id: p.id, order: p.order }))
        );

        toast({
          title: 'Success',
          description: 'Photo order updated',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update photo order',
          variant: 'destructive',
        });
        // Revert on error
        setPhotos(initialPhotos);
        onPhotosChange?.(initialPhotos);
      }
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await propertiesApi.deletePhoto(propertyId, photoId);

      const newPhotos = photos
        .filter((p) => p.id !== photoId)
        .map((photo, index) => ({ ...photo, order: index }));

      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);

      toast({
        title: 'Success',
        description: 'Photo deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        await propertiesApi.uploadPhoto(propertyId, file);
      }

      // Refetch property to get updated photos
      const property = await propertiesApi.getById(propertyId);
      const sortedPhotos = (property.photos || []).sort((a, b) => a.order - b.order);
      setPhotos(sortedPhotos);
      onPhotosChange?.(sortedPhotos);

      toast({
        title: 'Success',
        description: `${files.length} photo(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload photos',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photo Gallery</h3>
        <div>
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Add Photos'}
          </Button>
        </div>
      </div>

      {/* Photo List */}
      {photos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No photos yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Add Photos" to upload images
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {photos.map((photo) => (
                <SortablePhotoItem key={photo.id} photo={photo} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-xs text-muted-foreground">
        Drag photos to reorder them. The first photo will be the cover image.
      </p>
    </div>
  );
}
