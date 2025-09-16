'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2, Info, X } from 'lucide-react';
import {
  type MKSNodePool,
} from '@/lib/mks-data';
import { mockSubnets } from '@/lib/cluster-creation-data';
import { useToast } from '@/hooks/use-toast';

// Instance flavors with pricing (matching cluster creation)
const instanceFlavors = [
  { id: 'cpu-1x-4gb', name: 'CPU-1x-4GB', vcpus: 1, memory: 4, pricePerHour: 3 },
  { id: 'cpu-2x-8gb', name: 'CPU-2x-8GB', vcpus: 2, memory: 8, pricePerHour: 6 },
  { id: 'cpu-4x-16gb', name: 'CPU-4x-16GB', vcpus: 4, memory: 16, pricePerHour: 13 },
  { id: 'cpu-8x-32gb', name: 'CPU-8x-32GB', vcpus: 8, memory: 32, pricePerHour: 25 },
  { id: 'cpu-16x-64gb', name: 'CPU-16x-64GB', vcpus: 16, memory: 64, pricePerHour: 49 },
  { id: 'cpu-32x-128gb', name: 'CPU-32x-128GB', vcpus: 32, memory: 128, pricePerHour: 97 },
];

// Mock security groups data
const mockSecurityGroups = [
  { id: 'sg-default', name: 'default', description: 'Default security group' },
  {
    id: 'sg-web',
    name: 'web-servers',
    description: 'Security group for web servers',
  },
  {
    id: 'sg-db',
    name: 'database',
    description: 'Security group for database servers',
  },
];

interface Taint {
  key: string;
  value: string;
  effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
}

interface KeyValuePair {
  key: string;
  value: string;
}

interface NewNodePool {
  name: string;
  flavor: string;
  desiredCount: number;
  minCount: number;
  maxCount: number;
  diskSize: number;
  subnetId: string;
  securityGroupId?: string;
  taints: Taint[];
  labels: KeyValuePair[];
  tags: KeyValuePair[];
}

interface AddNodePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (nodePool: Omit<MKSNodePool, 'id' | 'status' | 'createdAt' | 'k8sVersion'>) => void;
  clusterId?: string;
}


export function AddNodePoolModal({
  isOpen,
  onClose,
  onAdd,
  clusterId,
}: AddNodePoolModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [nodePool, setNodePool] = useState<NewNodePool>({
    name: '',
    flavor: 'cpu-2x-8gb',
    desiredCount: 2,
    minCount: 1,
    maxCount: 5,
    diskSize: 50,
    subnetId: mockSubnets[0]?.id || '',
    securityGroupId: undefined,
    taints: [{ key: '', value: '', effect: 'NoSchedule' }],
    labels: [{ key: '', value: '' }],
    tags: [{ key: '', value: '' }],
  });

  // Get selected flavor details
  const getSelectedFlavor = (flavorId: string) => {
    return instanceFlavors.find(f => f.id === flavorId) || instanceFlavors[1];
  };


  const handleClose = () => {
    // Reset form
    setNodePool({
      name: '',
      flavor: 'cpu-2x-8gb',
      desiredCount: 2,
      minCount: 1,
      maxCount: 5,
      diskSize: 50,
      subnetId: mockSubnets[0]?.id || '',
      securityGroupId: undefined,
      taints: [{ key: '', value: '', effect: 'NoSchedule' }],
      labels: [{ key: '', value: '' }],
      tags: [{ key: '', value: '' }],
    });
    onClose();
  };

  const addTaint = () => {
    setNodePool(prev => ({
      ...prev,
      taints: [...prev.taints, { key: '', value: '', effect: 'NoSchedule' }],
    }));
  };

  const updateTaint = (index: number, field: keyof Taint, value: string) => {
    setNodePool(prev => ({
      ...prev,
      taints: prev.taints.map((taint, i) =>
        i === index ? { ...taint, [field]: value } : taint
      ),
    }));
  };

  const removeTaint = (index: number) => {
    setNodePool(prev => ({
      ...prev,
      taints: prev.taints.filter((_, i) => i !== index),
    }));
  };

  const addLabel = () => {
    setNodePool(prev => ({
      ...prev,
      labels: [...prev.labels, { key: '', value: '' }],
    }));
  };

  const updateLabel = (index: number, field: keyof KeyValuePair, value: string) => {
    setNodePool(prev => ({
      ...prev,
      labels: prev.labels.map((label, i) =>
        i === index ? { ...label, [field]: value } : label
      ),
    }));
  };

  const removeLabel = (index: number) => {
    setNodePool(prev => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    setNodePool(prev => ({
      ...prev,
      tags: [...prev.tags, { key: '', value: '' }],
    }));
  };

  const updateTag = (index: number, field: keyof KeyValuePair, value: string) => {
    setNodePool(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) =>
        i === index ? { ...tag, [field]: value } : tag
      ),
    }));
  };

  const removeTag = (index: number) => {
    setNodePool(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleAdd = async () => {
    if (!nodePool.name.trim()) {
      toast({
        title: 'Pool name required',
        description: 'Please enter a name for the node pool.',
        variant: 'destructive',
      });
      return;
    }

    // Validate node counts
    if (nodePool.minCount > nodePool.desiredCount || nodePool.desiredCount > nodePool.maxCount) {
      toast({
        title: 'Invalid node counts',
        description: 'Min count ≤ Desired count ≤ Max count',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter out empty taints, labels, and tags
      const filteredTaints = nodePool.taints.filter(taint => taint.key.trim() && taint.value.trim());
      const filteredLabels = nodePool.labels.filter(label => label.key.trim() && label.value.trim());
      const filteredTags = nodePool.tags.filter(tag => tag.key.trim() && tag.value.trim());

      // Convert to the format expected by the parent component
      const newNodePool = {
        name: nodePool.name,
        flavor: nodePool.flavor,
        desiredCount: nodePool.desiredCount,
        minCount: nodePool.minCount,
        maxCount: nodePool.maxCount,
        diskSize: nodePool.diskSize,
        taints: filteredTaints,
        labels: filteredLabels.reduce((acc, label) => {
          acc[label.key] = label.value;
          return acc;
        }, {} as Record<string, string>),
        subnetId: nodePool.subnetId,
      };

      onAdd(newNodePool);
      handleClose();

      toast({
        title: 'Node pool added successfully',
        description: `Node pool "${nodePool.name}" has been added to the cluster.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to add node pool',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-6xl max-h-[95vh] overflow-hidden flex flex-col'>
        <DialogHeader className='flex-shrink-0 pb-6'>
          <DialogTitle className='text-lg font-semibold'>
            Add New Node Pool
          </DialogTitle>
          <DialogDescription>
            Configure a new node pool with advanced settings. Set up instance types, scaling parameters, and Kubernetes-specific configurations.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto space-y-6 pl-6 pr-8 py-2'>
          {/* 1. Node Pool Name */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>
              Node Pool Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              value={nodePool.name}
              onChange={e => setNodePool(prev => ({ ...prev, name: e.target.value }))}
              placeholder='Enter node pool name (e.g., workers, database, gpu-nodes)'
              className={!nodePool.name.trim() ? 'border-destructive focus:border-destructive' : ''}
            />
            {!nodePool.name.trim() && (
              <p className='text-xs text-destructive'>Node pool name is required</p>
            )}
          </div>

          {/* 2. Instance Flavour */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>
              Instance Flavour <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={nodePool.flavor}
              onValueChange={value => setNodePool(prev => ({ ...prev, flavor: value }))}
            >
              <SelectTrigger className='w-full'>
                <SelectValue>
                  {(() => {
                    const selectedFlavor = getSelectedFlavor(nodePool.flavor);
                    return (
                      <div className='flex items-center justify-between w-full pr-2'>
                        <div className='flex items-center gap-4'>
                          <span className='font-medium'>{selectedFlavor.name}</span>
                          <span className='text-muted-foreground text-sm'>
                            {selectedFlavor.vcpus} vCPU • {selectedFlavor.memory} GB RAM
                          </span>
                        </div>
                        <span className='text-primary font-semibold text-sm ml-6'>
                          ₹{selectedFlavor.pricePerHour}/hr
                        </span>
                      </div>
                    );
                  })()} 
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {instanceFlavors.map(flavor => (
                  <SelectItem key={flavor.id} value={flavor.id}>
                    <div className='flex items-center justify-between w-full min-w-[320px] py-1'>
                      <div className='flex flex-col gap-1'>
                        <span className='font-medium'>{flavor.name}</span>
                        <span className='text-muted-foreground text-xs'>
                          {flavor.vcpus} vCPU • {flavor.memory} GB RAM
                        </span>
                      </div>
                      <span className='text-primary font-semibold text-sm ml-6'>
                        ₹{flavor.pricePerHour}/hr
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Scaling Settings */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>
              Scaling Settings <span className='text-destructive'>*</span>
            </Label>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label className='text-xs text-muted-foreground mb-2 block'>Min Nodes</Label>
                <Input
                  type='number'
                  value={nodePool.minCount}
                  onChange={e => setNodePool(prev => ({ ...prev, minCount: Math.max(0, Number(e.target.value) || 0) }))}
                  min={0}
                  className='text-center'
                />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground mb-2 block'>Desired Nodes</Label>
                <Input
                  type='number'
                  value={nodePool.desiredCount}
                  onChange={e => setNodePool(prev => ({ ...prev, desiredCount: Math.max(1, Number(e.target.value) || 1) }))}
                  min={1}
                  className='text-center'
                />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground mb-2 block'>Max Nodes</Label>
                <Input
                  type='number'
                  value={nodePool.maxCount}
                  onChange={e => setNodePool(prev => ({ ...prev, maxCount: Math.max(1, Number(e.target.value) || 1) }))}
                  min={1}
                  className='text-center'
                />
              </div>
            </div>
            
            {/* Validation */}
            {nodePool.minCount > nodePool.maxCount && (
              <p className='text-xs text-destructive'>Min nodes cannot be greater than max nodes</p>
            )}
            {nodePool.desiredCount < nodePool.minCount && (
              <p className='text-xs text-destructive'>Desired nodes must be at least min nodes</p>
            )}
            {nodePool.desiredCount > nodePool.maxCount && (
              <p className='text-xs text-destructive'>Desired nodes must not exceed max nodes</p>
            )}
          </div>

          {/* 4. Bootable Volume Size */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>
              Bootable Volume <span className='text-destructive'>*</span>
            </Label>
            <div className='space-y-2'>
              <Label className='text-xs text-muted-foreground'>Storage Size (GB)</Label>
              <Input
                type='number'
                min='50'
                max='1024'
                value={nodePool.diskSize}
                onChange={e => setNodePool(prev => ({ ...prev, diskSize: Math.max(50, Math.min(1024, parseInt(e.target.value) || 50)) }))}
              />
            </div>
            <div className='bg-amber-50 border border-amber-200 rounded-lg py-2.5 px-3'>
              <div className='flex gap-2'>
                <Info className='h-4 w-4 text-amber-600 flex-shrink-0' style={{ marginTop: '1px' }} />
                <p className='text-xs text-amber-800 leading-relaxed'>
                  <strong>Note:</strong> Once chosen, storage size cannot be changed later. Please select carefully.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Subnet */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>
              Subnet <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={nodePool.subnetId}
              onValueChange={value => setNodePool(prev => ({ ...prev, subnetId: value }))}
            >
              <SelectTrigger className={!nodePool.subnetId ? 'border-red-300 bg-red-50' : ''}>
                <SelectValue placeholder='Select a subnet' />
              </SelectTrigger>
              <SelectContent>
                {mockSubnets.map(subnet => (
                  <SelectItem key={subnet.id} value={subnet.id}>
                    <div className='flex items-center justify-between w-full'>
                      <span>{subnet.name}</span>
                      <Badge 
                        variant='secondary' 
                        className={`ml-2 text-xs ${
                          subnet.type === 'Public' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {subnet.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!nodePool.subnetId && (
              <p className='text-xs text-destructive'>Please select a subnet</p>
            )}
          </div>

          {/* 6. Advanced Settings */}
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='advanced-settings' className='border-none'>
              <AccordionTrigger className='text-base font-semibold hover:no-underline py-4'>
                Advanced Settings
              </AccordionTrigger>
              <AccordionContent className='space-y-8 pt-6 pb-4'>
                {/* Security Group */}
                <div className='space-y-3'>
                  <Label className='text-sm font-medium'>Security Group</Label>
                  <Select
                    value={nodePool.securityGroupId || 'none'}
                    onValueChange={value => setNodePool(prev => ({ 
                      ...prev, 
                      securityGroupId: value === 'none' ? undefined : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select a security group (optional)' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>
                        <span className='text-muted-foreground'>No security group</span>
                      </SelectItem>
                      {mockSecurityGroups.map(sg => (
                        <SelectItem key={sg.id} value={sg.id}>
                          <div className='flex flex-col items-start'>
                            <span>{sg.name}</span>
                            <span className='text-xs text-muted-foreground'>{sg.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Taints */}
                <div className='space-y-4'>
                  <Label className='text-sm font-medium'>Taints</Label>
                  <div className='space-y-4'>
                    {nodePool.taints.map((taint, index) => (
                      <div key={index} className='grid grid-cols-3 gap-4 items-end'>
                        <Input
                          placeholder='Key'
                          value={taint.key}
                          onChange={e => updateTaint(index, 'key', e.target.value)}
                          className='text-xs'
                        />
                        <Input
                          placeholder='Value'
                          value={taint.value}
                          onChange={e => updateTaint(index, 'value', e.target.value)}
                          className='text-xs'
                        />
                        <div className='flex gap-2'>
                          <Select
                            value={taint.effect}
                            onValueChange={value => updateTaint(index, 'effect', value as Taint['effect'])}
                          >
                            <SelectTrigger className='text-xs'>
                              <SelectValue placeholder='Effect' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='NoSchedule'>NoSchedule</SelectItem>
                              <SelectItem value='PreferNoSchedule'>PreferNoSchedule</SelectItem>
                              <SelectItem value='NoExecute'>NoExecute</SelectItem>
                            </SelectContent>
                          </Select>
                          {nodePool.taints.length > 1 ? (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => removeTaint(index)}
                              className='px-2'
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          ) : (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={addTaint}
                              className='px-2'
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Labels */}
                <div className='space-y-4'>
                  <Label className='text-sm font-medium'>Labels</Label>
                  <div className='space-y-4'>
                    {nodePool.labels.map((label, index) => (
                      <div key={index} className='grid grid-cols-2 gap-4 items-end'>
                        <Input
                          placeholder='Key'
                          value={label.key}
                          onChange={e => updateLabel(index, 'key', e.target.value)}
                          className='text-xs'
                        />
                        <div className='flex gap-2'>
                          <Input
                            placeholder='Value'
                            value={label.value}
                            onChange={e => updateLabel(index, 'value', e.target.value)}
                            className='text-xs'
                          />
                          {nodePool.labels.length > 1 ? (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => removeLabel(index)}
                              className='px-2'
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          ) : (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={addLabel}
                              className='px-2'
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className='space-y-4'>
                  <Label className='text-sm font-medium'>Tags</Label>
                  <div className='space-y-4'>
                    {nodePool.tags.map((tag, index) => (
                      <div key={index} className='grid grid-cols-2 gap-4 items-end'>
                        <Input
                          placeholder='Key'
                          value={tag.key}
                          onChange={e => updateTag(index, 'key', e.target.value)}
                          className='text-xs'
                        />
                        <div className='flex gap-2'>
                          <Input
                            placeholder='Value'
                            value={tag.value}
                            onChange={e => updateTag(index, 'value', e.target.value)}
                            className='text-xs'
                          />
                          {nodePool.tags.length > 1 ? (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => removeTag(index)}
                              className='px-2'
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          ) : (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={addTag}
                              className='px-2'
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>


        </div>

        <DialogFooter className='flex-shrink-0 border-t pt-6'>
          <div className='flex items-center gap-3 ml-auto'>
            <Button variant='outline' onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!nodePool.name.trim() || isLoading}
              className='min-w-[120px]'
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                  Adding...
                </div>
              ) : (
                'Add Node Pool'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
