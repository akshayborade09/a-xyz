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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { getDatabaseBackups } from '@/lib/data';

interface RestoreDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: {
    id: string;
    name: string;
    dbEngine: string;
    engineVersion: string;
  };
  onRestore: (backupId: string) => void;
}

export function RestoreDatabaseModal({
  isOpen,
  onClose,
  database,
  onRestore,
}: RestoreDatabaseModalProps) {
  const [selectedBackup, setSelectedBackup] = useState('');
  const [backups, setBackups] = useState<any[]>([]);

  // Load backups when modal opens
  useEffect(() => {
    if (isOpen && database) {
      const availableBackups = getDatabaseBackups(database.id);
      setBackups(availableBackups);
      setSelectedBackup('');
    }
  }, [isOpen, database]);

  const handleRestore = () => {
    if (selectedBackup) {
      onRestore(selectedBackup);
      onClose();
      setSelectedBackup('');
    }
  };

  const handleClose = () => {
    setSelectedBackup('');
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Restore Database from Backup</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Database Information Section */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium text-muted-foreground'>
              Database Information
            </Label>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Name</span>
                <span className='text-sm font-medium'>{database.name}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Engine</span>
                <span className='text-sm font-medium'>
                  {database.dbEngine} {database.engineVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Select Backup Dropdown */}
          <div className='space-y-2'>
            <Label htmlFor='backup-select' className='text-sm font-medium'>
              Select Backup <span className='text-destructive'>*</span>
            </Label>
            <Select value={selectedBackup} onValueChange={setSelectedBackup}>
              <SelectTrigger id='backup-select'>
                <SelectValue placeholder='Choose a backup to restore' />
              </SelectTrigger>
              <SelectContent>
                {backups.length === 0 ? (
                  <div className='px-2 py-6 text-center text-sm text-muted-foreground'>
                    No backups available
                  </div>
                ) : (
                  backups.map((backup) => (
                    <SelectItem key={backup.id} value={backup.id}>
                      <div className='flex flex-col items-start'>
                        <span className='font-medium'>{backup.name}</span>
                        <span className='text-xs text-muted-foreground'>
                          {formatDate(backup.createdOn)} • {backup.size}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Informational Text */}
          <p className='text-sm text-muted-foreground'>
            Restoring will replace the current database with the selected backup point.
            Any data created after the backup will be lost.
          </p>

          {/* Warning Message */}
          <div className='flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md'>
            <AlertTriangle className='h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5' />
            <div className='text-sm text-amber-900'>
              <span className='font-semibold'>Warning:</span> This action will restore
              your database to the selected backup point. Any data created after the
              backup will be lost.
            </div>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            disabled={!selectedBackup}
            className='bg-black text-white hover:bg-black/90 disabled:bg-gray-300 disabled:text-gray-500'
          >
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
