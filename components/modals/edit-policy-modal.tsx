'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import {
  type Policy,
  type PolicyAccessRule,
  type PolicyType,
  type CRUDOperation,
  type Effect,
  policyTypeOptions,
  crudOperationOptions,
  effectOptions,
} from '@/lib/iam-data';

interface EditPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy;
  onSuccess: () => void;
}

export function EditPolicyModal({
  open,
  onOpenChange,
  policy,
  onSuccess,
}: EditPolicyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<PolicyAccessRule[]>([]);

  useEffect(() => {
    if (open && policy) {
      setName(policy.name);
      setDescription(policy.description);
      setRules([...policy.rules]);
    }
  }, [open, policy]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleAddRule = () => {
    const newRule: PolicyAccessRule = {
      id: `rule-${Date.now()}`,
      effect: 'Allow',
      operation: 'Read',
      policyType: 'VM',
      resourceName: '*',
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const handleUpdateRule = (
    ruleId: string,
    field: keyof PolicyAccessRule,
    value: string
  ) => {
    setRules(
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    );
  };

  const handleSave = () => {
    // Validate
    if (!name.trim()) return;
    if (rules.length === 0) return;

    // Mock update
    console.log('Updating policy:', {
      policyId: policy.id,
      name,
      description,
      rules,
    });

    // Simulate API call
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 500);
  };

  const getEffectBadgeVariant = (effect: Effect) => {
    return effect === 'Allow' ? 'default' : 'destructive';
  };

  const isValid = name.trim() && rules.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Edit Policy
          </DialogTitle>
          <p className='text-sm text-muted-foreground pt-2'>
            Modify policy details and access rules
          </p>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium'>
              Policy Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='Enter policy name'
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description' className='text-sm font-medium'>
              Description
            </Label>
            <Textarea
              id='description'
              placeholder='Enter policy description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label className='text-sm font-medium'>
                  Access Rules <span className='text-destructive'>*</span>
                </Label>
                <p className='text-xs text-muted-foreground'>
                  Define access permissions for this policy
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleAddRule}
                className='gap-1'
              >
                <Plus className='h-4 w-4' />
                Add Rule
              </Button>
            </div>

            {rules.length === 0 ? (
              <div className='text-center py-8 border rounded-md bg-muted/20'>
                <p className='text-sm text-muted-foreground'>
                  No rules defined. Click "Add Rule" to create one.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {rules.map((rule, index) => (
                  <div
                    key={rule.id}
                    className='border rounded-lg p-4 bg-card space-y-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-muted-foreground'>
                        Rule {index + 1}
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteRule(rule.id)}
                        className='h-8 w-8 p-0 text-muted-foreground hover:text-red-600'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Effect
                        </Label>
                        <Select
                          value={rule.effect}
                          onValueChange={value =>
                            handleUpdateRule(rule.id, 'effect', value)
                          }
                        >
                          <SelectTrigger className='h-9'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {effectOptions.map(effect => (
                              <SelectItem key={effect} value={effect}>
                                <Badge
                                  variant={getEffectBadgeVariant(effect)}
                                  className='text-xs'
                                >
                                  {effect}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Operation
                        </Label>
                        <Select
                          value={rule.operation}
                          onValueChange={value =>
                            handleUpdateRule(rule.id, 'operation', value)
                          }
                        >
                          <SelectTrigger className='h-9'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {crudOperationOptions.map(op => (
                              <SelectItem key={op} value={op}>
                                {op}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Resource Type
                        </Label>
                        <Select
                          value={rule.policyType}
                          onValueChange={value =>
                            handleUpdateRule(rule.id, 'policyType', value)
                          }
                        >
                          <SelectTrigger className='h-9'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {policyTypeOptions.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-xs text-muted-foreground'>
                          Resource Name
                        </Label>
                        <Input
                          placeholder='e.g., vm-* or *'
                          value={rule.resourceName}
                          onChange={e =>
                            handleUpdateRule(
                              rule.id,
                              'resourceName',
                              e.target.value
                            )
                          }
                          className='h-9'
                        />
                      </div>
                    </div>

                    {/* Rule Preview */}
                    <div className='pt-2 border-t'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span>Preview:</span>
                        <Badge
                          variant={getEffectBadgeVariant(rule.effect)}
                          className='text-xs'
                        >
                          {rule.effect}
                        </Badge>
                        <span className='font-medium'>{rule.operation}</span>
                        <span>on</span>
                        <span className='font-medium'>{rule.policyType}</span>
                        <span>resources matching</span>
                        <code className='bg-muted px-1.5 py-0.5 rounded text-xs'>
                          {rule.resourceName || '*'}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='flex items-center justify-end gap-2'>
          <Button variant='outline' onClick={handleClose} size='sm'>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            size='sm'
            className='bg-black text-white hover:bg-neutral-800'
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

