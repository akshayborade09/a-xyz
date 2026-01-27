'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateBucketApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateBucketApiKeyModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateBucketApiKeyModalProps) {
  const [region, setRegion] = useState('');
  const [storageClass, setStorageClass] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setRegion('');
    setStorageClass('');
    setLoading(false);
    onOpenChange(false);
  };

  const handleCreate = () => {
    if (!region || !storageClass) {
      toast({
        title: 'Validation Error',
        description: 'Please select both Region and Storage Class.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'API Key Created',
        description: 'Your bucket API key has been created successfully.',
      });
      setLoading(false);
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    }, 1000);
  };

  const isValid = region && storageClass;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-black">
            Create Bucket API Key
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Region Field */}
          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm font-medium">
              Region
            </Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger id="region">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-Bangalore-1">In-Bangalore-1</SelectItem>
                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                <SelectItem value="ap-southeast-1">
                  Asia Pacific (Singapore)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Storage Class Field */}
          <div className="space-y-2">
            <Label htmlFor="storage-class" className="text-sm font-medium">
              Storage Class
            </Label>
            <Select value={storageClass} onValueChange={setStorageClass}>
              <SelectTrigger id="storage-class">
                <SelectValue placeholder="Select Storage Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="infrequent-access">
                  Infrequent Access
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid || loading}
            size="sm"
            className="bg-black text-white hover:bg-neutral-800"
          >
            {loading ? 'Creating...' : 'Create Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
