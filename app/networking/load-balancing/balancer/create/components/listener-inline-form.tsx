'use client';

import { useState, useEffect } from 'react';
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
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { HelpCircle, Trash2 } from 'lucide-react';
import { PolicyRulesSection } from './sections/policy-rules-section';
import { PoolSection } from './sections/pool-section';
import type { ALBFormData } from './alb-create-form';
import type { NLBFormData } from './nlb-create-form';

interface ListenerInlineFormProps {
  listener: ALBFormData['listeners'][0] | NLBFormData['listeners'][0];
  onUpdate: (listener: any) => void;
  onDelete?: () => void;
  isALB?: boolean;
  showDelete?: boolean;
}

export function ListenerInlineForm({
  listener: initialListener,
  onUpdate,
  onDelete,
  isALB = true,
  showDelete = false,
}: ListenerInlineFormProps) {
  const [listener, setListener] = useState<any>(initialListener);

  // Sync with parent when initialListener changes
  useEffect(() => {
    setListener(initialListener);
  }, [initialListener]);

  const protocolOptions = isALB
    ? [
        { value: 'HTTP', label: 'HTTP', defaultPort: 80 },
        { value: 'HTTPS', label: 'HTTPS', defaultPort: 443 },
      ]
    : [{ value: 'TCP', label: 'TCP', defaultPort: 80 }];

  const certificateOptions = [
    { value: 'cert-1', label: 'wildcard.example.com (*.example.com)' },
    { value: 'cert-2', label: 'api.example.com' },
    { value: 'cert-3', label: 'app.example.com' },
    { value: 'cert-4', label: 'staging.example.com' },
  ];

  const updateField = (field: string, value: any) => {
    const updatedListener = { ...listener, [field]: value };
    setListener(updatedListener);
    onUpdate(updatedListener);
  };

  const updatePolicies = (policies: any[]) => {
    const updatedListener = { ...listener, policies };
    setListener(updatedListener);
    onUpdate(updatedListener);
  };

  const updateRules = (rules: any[]) => {
    const updatedListener = { ...listener, rules };
    setListener(updatedListener);
    onUpdate(updatedListener);
  };

  const updatePools = (pools: any[]) => {
    const updatedListener = { ...listener, pools };
    setListener(updatedListener);
    onUpdate(updatedListener);
  };

  return (
    <div className='space-y-6 p-6 border rounded-lg bg-white relative'>
      {/* Delete button in top right */}
      {showDelete && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onDelete}
          className='absolute top-4 right-4 text-red-600 hover:text-red-700 hover:bg-red-50'
        >
          <Trash2 className='h-4 w-4 mr-1' />
          Delete
        </Button>
      )}

      {/* Listener Settings */}
      <div className='space-y-4'>
        <h3 className='font-medium text-base'>Listener Settings</h3>
        <div className='grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20'>
          {/* Listener Name */}
          <div>
            <Label className='block mb-2 font-medium'>
              Listener Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              placeholder='e.g., web-listener, api-listener'
              value={listener.name}
              onChange={(e) => updateField('name', e.target.value)}
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
              onValueChange={(value) => {
                updateField('protocol', value);
                const protocol = protocolOptions.find((p) => p.value === value);
                if (protocol) {
                  updateField('port', protocol.defaultPort);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select protocol' />
              </SelectTrigger>
              <SelectContent>
                {protocolOptions.map((protocol) => (
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
              onChange={(e) =>
                updateField('port', parseInt(e.target.value) || 80)
              }
              className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
            <p className='text-xs text-muted-foreground mt-1'>
              Port auto-fills based on protocol selection
            </p>
          </div>

          {/* Certificate */}
          {(listener.protocol === 'HTTPS' ||
            listener.protocol === 'TERMINATED_HTTPS') && (
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2 mb-2'>
                <Label className='font-medium'>
                  SSL Certificate <span className='text-destructive'>*</span>
                </Label>
                <TooltipWrapper
                  content='Select an SSL certificate for HTTPS listeners. The certificate must be valid and associated with your domain.'
                  side='top'
                >
                  <HelpCircle className='h-4 w-4 text-muted-foreground hover:text-foreground cursor-help' />
                </TooltipWrapper>
              </div>
              <Select
                value={listener.certificate}
                onValueChange={(value) => updateField('certificate', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select SSL certificate' />
                </SelectTrigger>
                <SelectContent>
                  {certificateOptions.map((cert) => (
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

      {/* Policy & Rules Section (only for ALB) */}
      {isALB && (
        <div className='space-y-4'>
          <h3 className='font-medium text-base'>Policy & Rules Configuration</h3>
          <PolicyRulesSection
            formData={{
              policies: listener.policies || [],
              rules: listener.rules || [],
            } as any}
            updateFormData={(section: string, data: any) => {
              if (section === 'policyRules') {
                if (data.policies !== undefined) {
                  updatePolicies(data.policies);
                }
                if (data.rules !== undefined) {
                  updateRules(data.rules);
                }
              }
            }}
            isSection={true}
          />
        </div>
      )}

      {/* Pool Section */}
      <div className='space-y-4'>
        <h3 className='font-medium text-base'>Pool Configuration</h3>
        <PoolSection
          formData={{
            pools: listener.pools || [],
          } as any}
          updateFormData={(section: string, data: any) => {
            if (section === 'pools' && data.pools !== undefined) {
              updatePools(data.pools);
            }
          }}
          isSection={true}
          isEditMode={false}
          loadBalancerType={isALB ? 'ALB' : 'NLB'}
        />
      </div>
    </div>
  );
}
