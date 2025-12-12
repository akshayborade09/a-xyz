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
import { Shield } from 'lucide-react';
import {
  type Policy,
  getRolesByPolicyId,
} from '@/lib/iam-data';

interface DetachPolicyModalProps {
  open: boolean;
  onClose: () => void;
  policy: Policy;
  onDetach: (detachedRoleIds: string[]) => void;
}

export function DetachPolicyModal({
  open,
  onClose,
  policy,
  onDetach,
}: DetachPolicyModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const roles = getRolesByPolicyId(policy.id);

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map(r => r.id));
    }
  };

  const handleBulkDetachRoles = () => {
    const allRoleIds = roles.map(r => r.id);
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onDetach(allRoleIds);
      setLoading(false);
      onClose();
      setSelectedRoles([]);
    }, 1000);
  };

  const handleDetach = () => {
    if (selectedRoles.length === 0) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onDetach(selectedRoles);
      setLoading(false);
      onClose();
      setSelectedRoles([]);
    }, 1000);
  };

  const handleClose = () => {
    setSelectedRoles([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Detach Policy from Roles</DialogTitle>
          <DialogDescription>
            Before deleting <strong>{policy.name}</strong>, you need to detach it
            from the following roles.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Roles Section */}
          {roles.length > 0 && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                  <Label className='text-sm font-medium'>
                    Roles ({roles.length})
                  </Label>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleSelectAll}
                    disabled={loading}
                  >
                    {selectedRoles.length === roles.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleBulkDetachRoles}
                    disabled={loading}
                  >
                    Detach All
                  </Button>
                </div>
              </div>
              <div className='max-h-[300px] overflow-y-auto border rounded-md'>
                {roles.map((role, index) => (
                  <div
                    key={role.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                      selectedRoles.includes(role.id)
                        ? 'bg-primary/5'
                        : 'hover:bg-muted/50'
                    } ${index !== roles.length - 1 ? 'border-b' : ''}`}
                    onClick={() => toggleRole(role.id)}
                  >
                    <Checkbox
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-sm truncate'>
                        {role.name}
                      </div>
                      <div className='text-xs text-muted-foreground truncate'>
                        {role.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {roles.length === 0 && (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No roles are using this policy
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDetach}
            disabled={loading || selectedRoles.length === 0}
            className='bg-black text-white hover:bg-neutral-800'
          >
            {loading
              ? 'Detaching...'
              : `Detach (${selectedRoles.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
