'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Quick select storage options
const storageQuickSelect = [
  { label: '20GB', value: 20 },
  { label: '100GB', value: 100 },
  { label: '500GB', value: 500 },
  { label: '1TB', value: 1024 },
];

// Utility function to parse storage string to number (e.g., "100 GB" -> 100, "1 TB SSD" -> 1024)
const parseStorageToGB = (storageString: string): number => {
  const normalized = storageString.trim().toUpperCase();
  
  // Handle TB (convert to GB)
  if (normalized.includes('TB')) {
    const tbMatch = normalized.match(/(\d+(?:\.\d+)?)\s*TB/i);
    if (tbMatch) {
      return Math.round(parseFloat(tbMatch[1]) * 1024);
    }
  }
  
  // Handle GB
  const gbMatch = normalized.match(/(\d+(?:\.\d+)?)\s*GB/i);
  if (gbMatch) {
    return Math.round(parseFloat(gbMatch[1]));
  }
  
  // Fallback: try to extract any number
  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    return Math.round(parseFloat(numberMatch[1]));
  }
  
  return 100; // Default fallback
};

interface UpdateDatabaseStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: {
    id: string;
    name: string;
    storage: string;
  };
  onUpdate: (newStorageSize: number) => void;
}

export function UpdateDatabaseStorageModal({
  isOpen,
  onClose,
  database,
  onUpdate,
}: UpdateDatabaseStorageModalProps) {
  const currentStorageGB = parseStorageToGB(database.storage);
  const [storageSize, setStorageSize] = useState(currentStorageGB);
  const [customStorageInput, setCustomStorageInput] = useState('');

  // Reset to current storage when modal opens
  useEffect(() => {
    if (isOpen) {
      const parsed = parseStorageToGB(database.storage);
      setStorageSize(parsed);
      setCustomStorageInput('');
    }
  }, [isOpen, database.storage]);

  // Calculate storage price (₹1.80 per GB per month)
  const storagePrice = (storageSize * 1.8).toFixed(2);
  const currentStoragePrice = (currentStorageGB * 1.8).toFixed(2);
  const additionalCost = ((storageSize - currentStorageGB) * 1.8).toFixed(2);

  const handleStorageQuickSelect = (value: number) => {
    if (value >= currentStorageGB) {
      setStorageSize(value);
      setCustomStorageInput('');
    }
  };

  const handleCustomStorageApply = () => {
    const value = parseInt(customStorageInput);
    if (!isNaN(value) && value >= currentStorageGB && value <= 2048) {
      setStorageSize(value);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    if (newValue >= currentStorageGB) {
      setStorageSize(newValue);
      setCustomStorageInput('');
    }
  };

  const handleSubmit = () => {
    if (storageSize >= currentStorageGB) {
      onUpdate(storageSize);
      onClose();
    }
  };

  const isStorageUpgraded = storageSize > currentStorageGB;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Update Storage</DialogTitle>
          <DialogDescription>
            Upgrade storage for <strong>{database.name}</strong>. Current storage: <strong>{database.storage}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Current Storage Info */}
          <div className='p-4 bg-muted/30 rounded-lg border'>
            <div className='flex items-center justify-between'>
              <div>
                <Label className='text-sm text-muted-foreground'>Current Storage</Label>
                <div className='text-lg font-semibold mt-1'>{database.storage}</div>
              </div>
              <div className='text-right'>
                <Label className='text-sm text-muted-foreground'>Current Cost</Label>
                <div className='text-lg font-semibold mt-1'>₹{currentStoragePrice}/mo</div>
              </div>
            </div>
          </div>

          {/* Select Storage */}
          <div>
            <div className='mb-4'>
              <h3 className='text-base font-semibold mb-2'>Select New Storage Size</h3>
              <p className='text-sm text-muted-foreground'>
                You can only upgrade storage. The minimum size is {currentStorageGB} GB (current storage).
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <Label className='mb-3 block text-sm font-medium'>
                  Size (GB) *
                </Label>
                <div className='flex gap-2 mb-4 flex-wrap'>
                  <div className='text-sm font-medium'>Quick Select</div>
                  {storageQuickSelect.map(option => {
                    const isDisabled = option.value < currentStorageGB;
                    const isSelected = storageSize === option.value;
                    return (
                      <Button
                        key={option.value}
                        type='button'
                        variant={isSelected ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => handleStorageQuickSelect(option.value)}
                        disabled={isDisabled}
                        className='rounded-full'
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                  <div className='flex items-center gap-2'>
                    <Input
                      type='number'
                      placeholder='Custom'
                      value={customStorageInput}
                      onChange={e => setCustomStorageInput(e.target.value)}
                      className='w-24 h-9'
                      min={currentStorageGB}
                      max={2048}
                    />
                    <span className='text-sm text-muted-foreground'>GB</span>
                  </div>
                  {customStorageInput && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleCustomStorageApply}
                    >
                      Apply
                    </Button>
                  )}
                </div>

                <Slider
                  value={[storageSize]}
                  onValueChange={handleSliderChange}
                  min={currentStorageGB}
                  max={2048}
                  step={1}
                  className='mb-2'
                />
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>{currentStorageGB} GB (Current)</span>
                  <span>2048 GB</span>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 bg-muted/30 rounded-lg'>
                <div className='text-sm font-medium'>
                  {storageSize} GB Selected
                </div>
                <div className='text-right'>
                  <div className='text-base font-semibold'>
                    ₹{storagePrice}/mo
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ₹{(parseFloat(storagePrice) / 730).toFixed(2)}/hour
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Cost Info */}
          {isStorageUpgraded && (
            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-sm font-semibold text-blue-900'>Additional Monthly Cost</Label>
                  <p className='text-xs text-blue-700 mt-1'>
                    You will be charged an additional ₹{additionalCost}/month for {storageSize - currentStorageGB} GB of extra storage.
                  </p>
                </div>
                <div className='text-right'>
                  <div className='text-lg font-bold text-blue-900'>
                    +₹{additionalCost}/mo
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isStorageUpgraded && (
            <div className='p-4 bg-muted/50 rounded-lg border'>
              <p className='text-sm text-muted-foreground'>
                Storage size must be greater than current storage ({currentStorageGB} GB) to upgrade.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isStorageUpgraded}
            className={isStorageUpgraded ? 'bg-black text-white hover:bg-black/90' : ''}
          >
            Update Storage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

