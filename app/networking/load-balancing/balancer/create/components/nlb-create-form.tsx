'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/page-layout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { HelpCircle, Plus, Trash2, Info, Edit } from 'lucide-react';
import { BasicSection } from './sections/basic-section';
import { PoolSection } from './sections/pool-section';
import { CreateVPCModal } from '@/components/modals/vm-creation-modals';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NLBProgressModal } from './nlb-progress-modal';
import { ListenerInlineForm } from './listener-inline-form';
import { ListenerViewEditModal } from './listener-view-edit-modal';
import { vpcs, targetGroups } from '@/lib/data';

import type { LoadBalancerConfiguration } from '../page';

export interface NLBFormData {
  // Basics
  name: string;
  description: string;
  loadBalancerType: string;
  region: string;
  vpc: string;
  subnet: string;
  securityGroup: string;

  // Performance Tier
  performanceTier: string;
  standardConfig: string;
  ipAddressType: string;
  reservedIpId: string;

  // Listeners with only pools (no policies/rules for NLB)
  listeners: Array<{
    id: string;
    name: string;
    protocol: string;
    port: number;
    certificate: string;

    // Only pools for NLB - no policies or rules
    pools: Array<{
      id: string;
      name: string;
      protocol: string;
      algorithm: string;
      targetGroup: string;
    }>;
  }>;
}

interface NLBCreateFormProps {
  config: LoadBalancerConfiguration;
  onBack: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
  editData?: any;
  customBreadcrumbs?: Array<{ href: string; title: string }>;
  listenersEditMode?: boolean;
  onToggleListenersEdit?: () => void;
  currentStep?: number;
  onStepComplete?: (data: any) => void;
  onStepBack?: () => void;
  loadBalancerData?: any;
}

const getLoadBalancerTypeName = (config: LoadBalancerConfiguration) => {
  return config.loadBalancerType === 'ALB'
    ? 'Application Load Balancer'
    : 'Network Load Balancer';
};

// Helper component for individual NLB listener configuration
interface NLBListenerCardProps {
  listener: NLBFormData['listeners'][0];
  updateListener: (listenerId: string, field: string, value: any) => void;
  isEditMode?: boolean;
}

function NLBListenerCard({
  listener,
  updateListener,
  isEditMode = false,
}: NLBListenerCardProps) {
  const protocolOptions = [{ value: 'TCP', label: 'TCP', defaultPort: 80 }];

  const certificateOptions = [
    { value: 'cert-1', label: 'wildcard.example.com (*.example.com)' },
    { value: 'cert-2', label: 'api.example.com' },
    { value: 'cert-3', label: 'app.example.com' },
    { value: 'cert-4', label: 'staging.example.com' },
  ];

  const updateListenerField = (field: string, value: string | number) => {
    if (field === 'protocol') {
      const protocol = protocolOptions.find(p => p.value === value);
      if (protocol) {
        updateListener(listener.id, field, value);
        updateListener(listener.id, 'port', protocol.defaultPort);
      }
    } else {
      updateListener(listener.id, field, value);
    }
  };

  const updatePools = (section: string, data: any) => {
    // Handle the "pools" section
    if (section === 'pools') {
      if (data.pools) {
        updateListener(listener.id, 'pools', data.pools);
      }
    }
  };

  return (
    <div className='space-y-6'>
      {/* Listener Basic Configuration */}
      <div className='space-y-4'>
        <div className='grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20'>
          {/* Listener Name */}
          <div>
            <Label className='block mb-2 font-medium'>
              Listener Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              placeholder='e.g., web-listener, api-listener'
              value={listener.name}
              onChange={e => updateListenerField('name', e.target.value)}
              className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
          </div>

          {/* Protocol */}
          <div>
            <Label className='block mb-2 font-medium'>
              Protocol <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={listener.protocol}
              onValueChange={value => updateListenerField('protocol', value)}
              disabled={isEditMode}
            >
              <SelectTrigger
                className={isEditMode ? 'bg-muted text-muted-foreground' : ''}
              >
                <SelectValue placeholder='Select protocol' />
              </SelectTrigger>
              <SelectContent>
                {protocolOptions.map(protocol => (
                  <SelectItem key={protocol.value} value={protocol.value}>
                    {protocol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Port */}
          <div>
            <Label className='block mb-2 font-medium'>
              Port <span className='text-destructive'>*</span>
            </Label>
            <Input
              type='number'
              min='1'
              max='65535'
              placeholder='80'
              value={listener.port}
              onChange={e =>
                updateListenerField('port', parseInt(e.target.value) || 80)
              }
              className={`focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isEditMode ? 'bg-muted text-muted-foreground' : ''}`}
              disabled={isEditMode}
            />
            {!isEditMode && (
              <p className='text-xs text-muted-foreground mt-1'>
                Port auto-fills based on protocol selection
              </p>
            )}
          </div>

          {/* Certificate */}
          {listener.protocol === 'TLS' && (
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2 mb-2'>
                <Label className='font-medium'>
                  SSL Certificate <span className='text-destructive'>*</span>
                </Label>
                <TooltipWrapper
                  content='Select an SSL certificate for TLS listeners. The certificate must be valid and associated with your domain.'
                  side='top'
                >
                  <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                </TooltipWrapper>
              </div>
              <Select
                value={listener.certificate}
                onValueChange={value =>
                  updateListenerField('certificate', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select SSL certificate' />
                </SelectTrigger>
                <SelectContent>
                  {certificateOptions.map(cert => (
                    <SelectItem key={cert.value} value={cert.value}>
                      {cert.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Pool Section - No Policy & Rules for NLB */}
      <div className='space-y-4'>
        <h4 className='font-medium text-base'>Pool Configuration</h4>
        <PoolSection
          formData={{
            ...({} as any),
            pools: listener.pools,
          }}
          updateFormData={updatePools}
          isSection={true}
          isEditMode={isEditMode}
          loadBalancerType='NLB'
        />
      </div>
    </div>
  );
}

export function NLBCreateForm({
  config,
  onBack,
  onCancel,
  isEditMode = false,
  editData,
  customBreadcrumbs,
  listenersEditMode = false,
  onToggleListenersEdit,
  currentStep = 1,
  onStepComplete,
  onStepBack,
  loadBalancerData,
}: NLBCreateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showCreateVPCModal, setShowCreateVPCModal] = useState(false);
  const [showCreateSubnetModal, setShowCreateSubnetModal] = useState(false);
  const [showCreateSecurityGroupModal, setShowCreateSecurityGroupModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [showListenerModal, setShowListenerModal] = useState(false);
  const [selectedListener, setSelectedListener] = useState<NLBFormData['listeners'][0] | null>(null);
  const [listenerModalMode, setListenerModalMode] = useState<'view' | 'edit'>('view');
  const [isNewListenerModal, setIsNewListenerModal] = useState(false);
  
  // Generate a storage key based on edit mode and ID
  const storageKey = isEditMode && editData?.id 
    ? `nlb-form-${editData.id}` 
    : 'nlb-form-new';
  
  // Initialize form data from localStorage if available, otherwise use defaults
  const getInitialFormData = (): NLBFormData => {
    // Only load from localStorage in edit mode
    if (isEditMode && typeof window !== 'undefined') {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Failed to parse saved form data:', e);
        }
      }
    }
    
    // Return default initial data
    return {
      name: isEditMode ? editData?.name || '' : '',
      description: isEditMode ? editData?.description || '' : '',
      loadBalancerType: getLoadBalancerTypeName(config),
      region: isEditMode ? editData?.region || '' : '',
      vpc: isEditMode ? editData?.vpc || '' : '',
      subnet: isEditMode ? editData?.subnet || '' : '',
      securityGroup: isEditMode ? editData?.securityGroup || '' : '',
      performanceTier: isEditMode
        ? editData?.performanceTier || 'standard'
        : 'standard',
      standardConfig: isEditMode
        ? editData?.standardConfig || 'high-availability'
        : 'high-availability',
      ipAddressType: isEditMode ? editData?.ipAddressType || '' : '',
      reservedIpId: isEditMode ? editData?.reservedIpId || '' : '',
      listeners: isEditMode ? editData?.listeners || [] : [],
    };
  };

  const [formData, setFormData] = useState<NLBFormData>(getInitialFormData());
  
  // Clear localStorage on mount in create mode
  useEffect(() => {
    if (!isEditMode && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, []);
  
  // Save form data to localStorage whenever it changes (only in edit mode)
  useEffect(() => {
    if (isEditMode && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }
  }, [formData, storageKey, isEditMode]);

  // Initialize with default listener (only in create mode)
  useEffect(() => {
    if (!isEditMode && formData.listeners.length === 0) {
      setFormData(prev => ({
        ...prev,
        listeners: [createNewListener()],
      }));
    }
  }, [isEditMode]);

  const createNewListener = () => ({
    id: crypto.randomUUID(),
    name: '',
    protocol: '',
    port: 80,
    certificate: '',
    pools: [
      {
        id: crypto.randomUUID(),
        name: '',
        protocol: '',
        algorithm: '',
        targetGroup: '',
      },
    ],
  });

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }));
  };

  const addListener = () => {
    // Open modal with empty listener
    const newListener = createNewListener();
    setSelectedListener(newListener);
    setListenerModalMode('edit');
    setIsNewListenerModal(true);
    setShowListenerModal(true);
  };

  const removeListener = (listenerId: string) => {
    if (formData.listeners.length > 1) {
      setFormData(prev => ({
        ...prev,
        listeners: prev.listeners.filter(
          listener => listener.id !== listenerId
        ),
      }));
    }
  };

  const updateListener = (listenerId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      listeners: prev.listeners.map(listener =>
        listener.id === listenerId ? { ...listener, [field]: value } : listener
      ),
    }));
  };

  const handleViewListener = (listener: NLBFormData['listeners'][0]) => {
    setSelectedListener(listener);
    setListenerModalMode('view');
    setIsNewListenerModal(false);
    setShowListenerModal(true);
  };

  const handleEditListener = (listener: NLBFormData['listeners'][0]) => {
    setSelectedListener(listener);
    setListenerModalMode('edit');
    setIsNewListenerModal(false);
    setShowListenerModal(true);
  };

  const handleDeleteListener = (listenerId: string) => {
    if (formData.listeners.length > 1) {
      setFormData(prev => ({
        ...prev,
        listeners: prev.listeners.filter(
          listener => listener.id !== listenerId
        ),
      }));
      toast({
        title: 'Listener deleted',
        description: 'The listener has been removed.',
      });
    }
  };

  const handleSaveListener = (updatedListener: NLBFormData['listeners'][0]) => {
    // Enrich listener data with target group health information
    const enrichedListener = {
      ...updatedListener,
      pools: updatedListener.pools.map(pool => {
        // Find the target group by name
        const targetGroup = targetGroups.find(tg => tg.name === pool.targetGroup);
        
        if (targetGroup) {
          // Calculate health status based on target members
          const healthyCount = targetGroup.targetMembers.filter(
            tm => tm.status === 'healthy'
          ).length;
          const totalCount = targetGroup.targetMembers.length;
          
          // Determine overall health status
          let targetGroupStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
          if (healthyCount === 0) {
            targetGroupStatus = 'unhealthy';
          } else if (healthyCount < totalCount) {
            targetGroupStatus = 'degraded';
          }
          
          return {
            ...pool,
            targetGroupStatus,
            targetCount: totalCount,
            healthyTargets: healthyCount,
          };
        }
        
        return pool;
      }),
    };
    
    setFormData(prev => {
      // Check if listener already exists
      const existingListenerIndex = prev.listeners.findIndex(
        listener => listener.id === enrichedListener.id
      );
      
      if (existingListenerIndex >= 0) {
        // Update existing listener
        return {
          ...prev,
          listeners: prev.listeners.map(listener =>
            listener.id === enrichedListener.id ? enrichedListener : listener
          ),
        };
      } else {
        // Add new listener
        return {
          ...prev,
          listeners: [...prev.listeners, enrichedListener],
        };
      }
    });
    
    const isNewListener = !formData.listeners.some(
      listener => listener.id === enrichedListener.id
    );
    
    toast({
      title: isNewListener ? 'Listener added' : 'Listener updated',
      description: isNewListener
        ? 'The listener has been added successfully.'
        : 'The listener has been updated successfully.',
    });
  };

  const handleVPCCreated = (vpcId: string) => {
    setFormData(prev => ({ ...prev, vpc: vpcId }));
    setShowCreateVPCModal(false);
  };

  const handleSubnetCreated = (subnetId: string) => {
    setFormData(prev => ({ ...prev, subnet: subnetId }));
    setShowCreateSubnetModal(false);
  };

  const handleSecurityGroupCreated = (securityGroupId: string) => {
    setFormData(prev => ({ ...prev, securityGroup: securityGroupId }));
    setShowCreateSecurityGroupModal(false);
  };

  const handleReviewAndCreate = () => {
    if (isEditMode) {
      // Handle edit save
      console.log('Saving NLB changes:', formData);
      // In a real app, this would be an API call to update the load balancer

      // Clear localStorage after successful save
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }

      // Navigate back to details page
      router.push(`/networking/load-balancing/balancer/${editData?.id}`);
    } else {
      // Generate a unique task ID
      const newTaskId = crypto.randomUUID();
      setTaskId(newTaskId);

      // Show progress modal
      setShowProgressModal(true);

      // In a real app, this would trigger the actual load balancer creation API call
      console.log('Creating NLB with data:', formData);
    }
  };

  const handleProgressModalClose = () => {
    setShowProgressModal(false);
  };

  const handleProgressSuccess = () => {
    setShowProgressModal(false);
    
    // Clear localStorage after successful creation
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
    
    // Reset form data to initial state
    setFormData({
      name: '',
      description: '',
      loadBalancerType: getLoadBalancerTypeName(config),
      region: '',
      vpc: '',
      subnet: '',
      securityGroup: '',
      performanceTier: 'standard',
      standardConfig: 'high-availability',
      ipAddressType: '',
      reservedIpId: '',
      listeners: [],
    });
    
    // Show success toast
    toast({
      title: 'Network Load Balancer created successfully',
      description: `Load Balancer "${formData.name}" has been created successfully`,
    });
  };
  
  const handleCancel = () => {
    // Clear localStorage when user cancels
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
    onCancel();
  };

  const isFormValid = () => {
    const basicValid =
      formData.name?.trim().length > 0 &&
      formData.region?.length > 0 &&
      formData.vpc?.length > 0 &&
      formData.subnet?.length > 0 &&
      formData.securityGroup?.length > 0 &&
      formData.performanceTier?.length > 0;

    // At least one listener must have basic configuration
    const listenersValid = formData.listeners.some(
      listener =>
        listener.name?.trim().length > 0 &&
        listener.protocol?.length > 0 &&
        listener.port > 0
    );

    return basicValid && listenersValid;
  };

  // Determine step title and description for create mode
  const getStepTitle = () => {
    if (isEditMode) return `Edit ${editData?.name}`;
    return 'Set Up Your Load Balancer';
  };

  const getStepDescription = () => {
    if (isEditMode) return 'Modify your Network Load Balancer configuration';
    return 'Configure and deploy a new Network load balancer with enterprise-grade reliability';
  };

  return (
    <PageLayout
      title={getStepTitle()}
      description={getStepDescription()}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={false}
    >
      {/* Step Indicator - only show in create mode */}
      {!isEditMode && (
        <div className='mb-12 flex items-center justify-center'>
          {/* Step 1 */}
          <div className='flex items-center gap-3'>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                currentStep === 1
                  ? 'bg-black text-white'
                  : currentStep > 1
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </div>
            <span
              className={`text-base font-medium ${
                currentStep === 1 ? 'text-black' : 'text-gray-500'
              }`}
            >
              Load Balancer Details
            </span>
          </div>

          {/* Connecting Line */}
          <div className='mx-8 h-px w-24 bg-gray-300'></div>

          {/* Step 2 */}
          <div className='flex items-center gap-3'>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                currentStep === 2
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span
              className={`text-base font-medium ${
                currentStep === 2 ? 'text-black' : 'text-gray-500'
              }`}
            >
              Listener Details
            </span>
          </div>
        </div>
      )}

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Main Content */}
        <div className='flex-1 space-y-4'>
          {/* Step 1: Load Balancer Details Section */}
          {(!isEditMode && currentStep === 1) || (isEditMode && !listenersEditMode) ? (
            <Card>
              <CardContent className='pt-6'>
                <BasicSection
                  formData={formData as any}
                  updateFormData={updateFormData}
                  isSection={true}
                  isEditMode={isEditMode}
                  onCreateVPC={() => setShowCreateVPCModal(true)}
                  onCreateSubnet={() => setShowCreateSubnetModal(true)}
                  onCreateSecurityGroup={() => setShowCreateSecurityGroupModal(true)}
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Step 2: Listeners Section - only show in create mode step 2 or when in listener edit mode */}
          {((!isEditMode && currentStep === 2) || (isEditMode && listenersEditMode)) && (
            <>
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-lg font-semibold'>Listeners</h2>
                    {/* Only allow adding one listener in create mode */}
                    {(formData.listeners.length === 0 || isEditMode) && (
                      <Button
                        type='button'
                        variant='outline'
                        onClick={addListener}
                        className='flex items-center gap-2'
                      >
                        <Plus className='h-4 w-4' />
                        Add Listener
                      </Button>
                    )}
                  </div>
                  {!isEditMode && (
                    <p className='text-sm text-muted-foreground'>
                      Start by adding a listener for your load balancer. You'll be able to add more listeners after deployment.
                    </p>
                  )}
                </div>

                {/* Listener Forms */}
                {formData.listeners.length > 0 ? (
                  <div className='space-y-4'>
                    {formData.listeners.map((listener, index) => (
                      <ListenerInlineForm
                        key={listener.id}
                        listener={listener}
                        onUpdate={(updatedListener) => {
                          const updatedListeners = [...formData.listeners];
                          updatedListeners[index] = updatedListener;
                          setFormData(prev => ({ ...prev, listeners: updatedListeners }));
                        }}
                        onDelete={formData.listeners.length > 1 ? () => handleDeleteListener(listener.id) : undefined}
                        isALB={false}
                        showDelete={formData.listeners.length > 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      No listeners configured
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Click "Add Listener" to create one
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit Actions - show different buttons based on mode */}
          <div className='flex justify-end gap-4'>
            {isEditMode && listenersEditMode ? (
              // Listener edit mode buttons
              <>
                <Button
                  type='button'
                  variant='outline'
                  className='hover:bg-secondary transition-colors'
                  onClick={onToggleListenersEdit}
                >
                  Cancel Listener Changes
                </Button>
                <Button
                  onClick={() => {
                    // Save listener changes
                    toast({
                      title: 'Listeners updated successfully',
                      description: 'Your listener configuration has been saved.',
                    });
                    if (onToggleListenersEdit) onToggleListenersEdit();
                  }}
                  className='bg-black text-white hover:bg-black/90'
                >
                  Save Listeners
                </Button>
              </>
            ) : !isEditMode && currentStep === 1 ? (
              // Step 1 buttons - Create mode
              <>
                <Button
                  type='button'
                  variant='outline'
                  className='hover:bg-secondary transition-colors'
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Validate step 1
                    const basicValid =
                      formData.name?.trim().length > 0 &&
                      formData.region?.length > 0 &&
                      formData.vpc?.length > 0 &&
                      formData.subnet?.length > 0 &&
                      formData.securityGroup?.length > 0 &&
                      formData.performanceTier?.length > 0;

                    if (!basicValid) {
                      toast({
                        title: 'Incomplete Configuration',
                        description: 'Please fill in all required fields.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    // Move to step 2
                    if (onStepComplete) {
                      onStepComplete(formData);
                    }
                  }}
                  className='bg-black text-white hover:bg-black/90'
                >
                  Next: Listener Details
                </Button>
              </>
            ) : !isEditMode && currentStep === 2 ? (
              // Step 2 buttons - Create mode
              <>
                <Button
                  type='button'
                  variant='outline'
                  className='hover:bg-secondary transition-colors'
                  onClick={() => {
                    if (onStepBack) {
                      onStepBack();
                    }
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleReviewAndCreate}
                  disabled={formData.listeners.length === 0 || !formData.listeners.some(
                    listener =>
                      listener.name?.trim().length > 0 &&
                      listener.protocol?.length > 0 &&
                      listener.port > 0
                  )}
                  className={`transition-colors ${
                    formData.listeners.length > 0 &&
                    formData.listeners.some(
                      listener =>
                        listener.name?.trim().length > 0 &&
                        listener.protocol?.length > 0 &&
                        listener.port > 0
                    )
                      ? 'bg-black text-white hover:bg-black/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Review & Create
                </Button>
              </>
            ) : (
              // Edit mode buttons
              <>
                <Button
                  type='button'
                  variant='outline'
                  className='hover:bg-secondary transition-colors'
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewAndCreate}
                  disabled={!isFormValid()}
                  className={`transition-colors ${
                    isFormValid()
                      ? 'bg-black text-white hover:bg-black/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className='w-full lg:w-80 space-y-6'>
          {/* Best Practices */}
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>Best Practices</h3>
              <ul className='space-y-3'>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-muted-foreground text-sm'>
                    Existence of a Target Group is mandatory for creation of LB.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-muted-foreground text-sm'>
                    A target group must consist of active VMs.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-muted-foreground text-sm'>
                    You can have multiple listeners, each mapped to 1 target
                    group each.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Price Summary */}
          <div
            style={{
              borderRadius: '16px',
              border: '4px solid #FFF',
              background:
                'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
              boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
              padding: '1.5rem',
            }}
          >
            <div className='pb-4'>
              <h3 className='text-base font-semibold'>Estimated Cost</h3>
            </div>
            <div className='space-y-3'>
              <div className='flex items-baseline gap-2'>
                <span className='text-2xl font-bold'>₹0.80</span>
                <span className='text-sm text-muted-foreground'>per hour</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Network Load Balancer optimized for high-performance TCP/UDP
                traffic.
              </p>
              <div className='text-xs text-muted-foreground pt-2 border-t'>
                <p>• NLB Setup: ₹0.80/hour</p>
                <p>• Estimated monthly: ₹584.00</p>
                <p>• Data processing charges apply</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create VPC Modal */}
      <CreateVPCModal
        open={showCreateVPCModal}
        onClose={() => setShowCreateVPCModal(false)}
        onSuccess={handleVPCCreated}
        preselectedRegion={formData.region || undefined}
      />

      {/* Create Subnet Modal */}
      <Dialog
        open={showCreateSubnetModal}
        onOpenChange={setShowCreateSubnetModal}
      >
        <DialogContent className='p-0 bg-white max-w-[70vw] max-h-[85vh] w-[70vw] h-[85vh] overflow-hidden flex flex-col'>
          <CreateSubnetModalContent
            vpcId={formData.vpc}
            onClose={() => setShowCreateSubnetModal(false)}
            onSuccess={handleSubnetCreated}
          />
        </DialogContent>
      </Dialog>

      {/* Create Security Group Modal */}
      <Dialog
        open={showCreateSecurityGroupModal}
        onOpenChange={setShowCreateSecurityGroupModal}
      >
        <DialogContent className='p-0 bg-white max-w-[70vw] max-h-[85vh] w-[70vw] h-[85vh] overflow-hidden flex flex-col'>
          <CreateSecurityGroupModalContent
            vpcId={formData.vpc}
            onClose={() => setShowCreateSecurityGroupModal(false)}
            onSuccess={handleSecurityGroupCreated}
          />
        </DialogContent>
      </Dialog>

      {/* NLB Progress Modal */}
      <NLBProgressModal
        isOpen={showProgressModal}
        onClose={handleProgressModalClose}
        taskId={taskId}
        onSuccess={handleProgressSuccess}
      />

      {/* Listener View/Edit Modal */}
      <ListenerViewEditModal
        isOpen={showListenerModal}
        onClose={() => {
          setShowListenerModal(false);
          setIsNewListenerModal(false);
        }}
        listener={selectedListener}
        onSave={handleSaveListener}
        mode={listenerModalMode}
        isALB={false}
        isNewListener={isNewListenerModal}
      />
    </PageLayout>
  );
}

// Create Subnet Modal Content Component
function CreateSubnetModalContent({
  vpcId,
  onClose,
  onSuccess,
}: {
  vpcId: string;
  onClose: () => void;
  onSuccess: (subnetId: string) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    accessType: 'public',
    cidr: '',
    gatewayIp: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, accessType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating subnet:', { ...formData, vpcId });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate created subnet ID
      const newSubnetId = `subnet-${Math.random().toString(36).substr(2, 9)}`;

      toast({
        title: 'Subnet Created',
        description: `Subnet "${formData.name}" has been created successfully!`,
      });

      onSuccess(newSubnetId);
    } catch (error) {
      console.error('Error creating subnet:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create subnet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedVPC = vpcs.find(vpc => vpc.id === vpcId);

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex-shrink-0 p-6 border-b'>
        <h2 className='text-2xl font-semibold'>Create Subnet</h2>
        <p className='text-sm text-muted-foreground mt-1'>
          Create a new subnet in {selectedVPC?.name}
        </p>
      </div>

      {/* Content */}
      <div className='flex-1 flex gap-6 min-h-0 p-6'>
        <div className='flex-1 flex flex-col min-h-0'>
          <div className='flex-1 overflow-y-auto pr-2'>
            <form
              id='subnet-form'
              onSubmit={handleSubmit}
              className='space-y-6'
            >
              <div className='mb-5'>
                <Label htmlFor='name' className='block mb-2 font-medium'>
                  Subnet Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='name'
                  placeholder='Enter subnet name'
                  value={formData.name}
                  onChange={handleChange}
                  className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  required
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Only alphanumeric characters, hyphens, and underscores
                  allowed.
                </p>
              </div>

              <div className='mb-5'>
                <Label htmlFor='description' className='block mb-2 font-medium'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  placeholder='Enter subnet description'
                  value={formData.description}
                  onChange={handleChange}
                  className='focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px]'
                />
              </div>

              <div className='mb-5'>
                <Label className='block mb-2 font-medium'>
                  Access Type <span className='text-destructive'>*</span>
                </Label>
                <div className='flex gap-5 mt-2'>
                  <div className='flex items-center'>
                    <input
                      type='radio'
                      value='public'
                      id='modal-public'
                      checked={formData.accessType === 'public'}
                      onChange={e => handleRadioChange(e.target.value)}
                      className='h-4 w-4 text-primary focus:ring-primary border-gray-300'
                    />
                    <Label htmlFor='modal-public' className='ml-2'>
                      Public
                    </Label>
                  </div>
                  <div className='flex items-center'>
                    <input
                      type='radio'
                      value='private'
                      id='modal-private'
                      checked={formData.accessType === 'private'}
                      onChange={e => handleRadioChange(e.target.value)}
                      className='h-4 w-4 text-primary focus:ring-primary border-gray-300'
                    />
                    <Label htmlFor='modal-private' className='ml-2'>
                      Private
                    </Label>
                  </div>
                </div>

                {formData.accessType === 'public' && (
                  <div className='mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                    <p className='text-gray-600' style={{ fontSize: '13px' }}>
                      Public subnets can be accessed through the internet.
                      Resources in public subnets can have public IP addresses.
                    </p>
                  </div>
                )}

                {formData.accessType === 'private' && (
                  <div className='mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                    <p className='text-gray-600' style={{ fontSize: '13px' }}>
                      Private subnets cannot be accessed through the internet.
                      Resources in private subnets only have private IP
                      addresses.
                    </p>
                  </div>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-5'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <Label htmlFor='cidr' className='font-medium'>
                      CIDR <span className='text-destructive'>*</span>
                    </Label>
                    <TooltipWrapper
                      content='Specify the IP address range for this subnet using CIDR notation'
                      side='top'
                    >
                      <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                    </TooltipWrapper>
                  </div>
                  <Input
                    id='cidr'
                    placeholder='e.g., 192.168.1.0/24'
                    value={formData.cidr}
                    onChange={handleChange}
                    className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    required
                  />
                </div>

                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <Label htmlFor='gatewayIp' className='font-medium'>
                      Gateway IP <span className='text-destructive'>*</span>
                    </Label>
                    <TooltipWrapper
                      content='The gateway IP address for this subnet (usually the first IP in the range)'
                      side='top'
                    >
                      <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                    </TooltipWrapper>
                  </div>
                  <Input
                    id='gatewayIp'
                    placeholder='e.g., 192.168.1.1'
                    value={formData.gatewayIp}
                    onChange={handleChange}
                    className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='flex-shrink-0 p-6 border-t bg-gray-50'>
        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            type='submit'
            form='subnet-form'
            className='bg-black text-white hover:bg-black/90 transition-colors'
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Subnet'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Create Security Group Modal Content Component
function CreateSecurityGroupModalContent({
  vpcId,
  onClose,
  onSuccess,
}: {
  vpcId: string;
  onClose: () => void;
  onSuccess: (securityGroupId: string) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    securityGroupFor: 'load-balancer',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating security group:', { ...formData, vpcId });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate created security group ID
      const newSecurityGroupId = `sg-${Math.random().toString(36).substr(2, 9)}`;

      toast({
        title: 'Security Group Created',
        description: `Security Group "${formData.name}" has been created successfully!`,
      });

      onSuccess(newSecurityGroupId);
    } catch (error) {
      console.error('Error creating security group:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create security group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedVPC = vpcs.find(vpc => vpc.id === vpcId);

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex-shrink-0 p-6 border-b'>
        <h2 className='text-2xl font-semibold'>Create Security Group</h2>
        <p className='text-sm text-muted-foreground mt-1'>
          Create a new security group for your load balancer in {selectedVPC?.name}
        </p>
      </div>

      {/* Content */}
      <div className='flex-1 flex gap-6 min-h-0 p-6'>
        <div className='flex-1 flex flex-col min-h-0'>
          <div className='flex-1 overflow-y-auto pr-2'>
            <form
              id='security-group-form'
              onSubmit={handleSubmit}
              className='space-y-6'
            >
              <div className='mb-5'>
                <Label htmlFor='name' className='block mb-2 font-medium'>
                  Security Group Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='name'
                  placeholder='Enter security group name'
                  value={formData.name}
                  onChange={handleChange}
                  className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  required
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Only alphanumeric characters, hyphens, and underscores allowed.
                </p>
              </div>

              <div className='mb-5'>
                <Label htmlFor='description' className='block mb-2 font-medium'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  placeholder='Enter a description for this security group'
                  value={formData.description}
                  onChange={handleChange}
                  className='focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px]'
                />
              </div>

              <div className='mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                <p className='text-gray-600' style={{ fontSize: '13px' }}>
                  Security groups act as virtual firewalls controlling inbound and
                  outbound traffic for your load balancer. You can configure specific
                  rules after creation.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Side Info Panel */}
        <div className='w-80 flex-shrink-0'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-sm'>Security Best Practices</h3>
              <ul className='space-y-3'>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-muted-foreground' style={{ fontSize: '13px' }}>
                    Only allow necessary ports and protocols
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-muted-foreground' style={{ fontSize: '13px' }}>
                    Use specific IP ranges when possible
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-muted-foreground' style={{ fontSize: '13px' }}>
                    Regularly review and update security rules
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className='flex-shrink-0 p-6 border-t bg-gray-50'>
        <div className='flex justify-end gap-4'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            type='submit'
            form='security-group-form'
            className='bg-black text-white hover:bg-black/90 transition-colors'
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Security Group'}
          </Button>
        </div>
      </div>
    </div>
  );
}
