'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { type Group, type User, getUsersByGroupId } from '@/lib/iam-data';

interface DetachGroupModalProps {
  open: boolean;
  onClose: () => void;
  group: Group;
  onDetach: (detachedUserIds: string[]) => void;
}

export function DetachGroupModal({
  open,
  onClose,
  group,
  onDetach,
}: DetachGroupModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const users = getUsersByGroupId(group.id);

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkDetachUsers = () => {
    const allUserIds = users.map(u => u.id);
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onDetach(allUserIds);
      setLoading(false);
      onClose();
      setSelectedUsers([]);
    }, 1000);
  };

  const handleDetach = () => {
    if (selectedUsers.length === 0) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onDetach(selectedUsers);
      setLoading(false);
      onClose();
      // Reset selections
      setSelectedUsers([]);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='border-b pb-4'>
          <DialogTitle className='text-2xl font-semibold'>
            Detach Group from Users
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 pt-6'>
          <div className='space-y-2'>
            <DialogDescription className='text-sm'>
              Before deleting <strong>{group.name}</strong>, you need to detach it
              from the following users.
            </DialogDescription>
            <p className='text-sm text-muted-foreground'>
              To detach, go to <strong>Users</strong>, select a user, click <strong>Edit</strong>, and remove this group.
            </p>
          </div>
          {/* Users Section */}
          {users.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <Label className='text-sm font-medium'>
                    Users ({users.length})
                  </Label>
                </div>
                {/* COMMENTED OUT: Bulk Detach button
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleBulkDetachUsers}
                  disabled={loading}
                >
                  Bulk Detach
                </Button>
                */}
              </div>
              <div className='max-h-[300px] overflow-y-auto space-y-2'>
                {users.map(user => (
                  <Card
                    key={user.id}
                    className='transition-colors hover:bg-muted/50'
                  >
                    <CardContent className='p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{user.name}</div>
                          <div className='text-xs text-muted-foreground mt-1'>
                            {user.email}
                          </div>
                        </div>
                        {/* COMMENTED OUT: Checkbox for selection
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                          onClick={e => e.stopPropagation()}
                        />
                        */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {users.length === 0 && (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No users are assigned to this group
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {/* COMMENTED OUT: Detach CTA button
          <Button
            onClick={handleDetach}
            disabled={loading || selectedUsers.length === 0}
            className='bg-black text-white hover:bg-neutral-800'
          >
            {loading
              ? 'Detaching...'
              : `Detach (${selectedUsers.length})`}
          </Button>
          */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

