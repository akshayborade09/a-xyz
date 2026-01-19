'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for storage buckets
const availableStorageBuckets = [
  { value: 'storage-bucket1', label: 'storage-bucket1' },
  { value: 'storage-bucket2', label: 'storage-bucket2' },
  { value: 'storage-bucket3', label: 'storage-bucket3' },
];

interface AttachStorageBucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (bucketData: {
    bucket: string;
    accessKey: string;
    secretKey: string;
  }) => void;
}

export function AttachStorageBucketModal({
  isOpen,
  onClose,
  onAttach,
}: AttachStorageBucketModalProps) {
  const [selectedBucket, setSelectedBucket] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBucket('');
      setAccessKey('');
      setSecretKey('');
    }
  }, [isOpen]);

  const handleAttach = () => {
    if (selectedBucket && accessKey && secretKey) {
      onAttach({
        bucket: selectedBucket,
        accessKey,
        secretKey,
      });
      onClose();
    }
  };

  const isFormValid = selectedBucket && accessKey.trim() && secretKey.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Attach Storage Bucket</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Storage Bucket */}
          <div className='space-y-2'>
            <Label htmlFor='storageBucket'>
              Storage Bucket <span className='text-destructive'>*</span>
            </Label>
            <Select value={selectedBucket} onValueChange={setSelectedBucket}>
              <SelectTrigger>
                <SelectValue placeholder='Select storage bucket' />
              </SelectTrigger>
              <SelectContent>
                <div className='px-2 py-1.5 text-sm font-semibold border-b mb-1'>
                  <button
                    type='button'
                    className='w-full text-left hover:text-primary transition-colors'
                    onClick={() => {
                      // Handle create new bucket action
                      console.log('Create new bucket clicked');
                    }}
                  >
                    + Create new
                  </button>
                </div>
                {availableStorageBuckets.map((bucket) => (
                  <SelectItem key={bucket.value} value={bucket.value}>
                    {bucket.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Access Key */}
          <div className='space-y-2'>
            <Label htmlFor='accessKey'>
              Access Key <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='accessKey'
              type='password'
              placeholder='••••••••'
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
            />
          </div>

          {/* Secret Key */}
          <div className='space-y-2'>
            <Label htmlFor='secretKey'>
              Secret Key <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='secretKey'
              type='password'
              placeholder='••••••••'
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAttach}
            disabled={!isFormValid}
            className={isFormValid ? 'bg-black text-white hover:bg-black/90' : ''}
          >
            Attach Bucket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
