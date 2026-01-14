'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { LoadBalancerConfigurationModal } from './components/load-balancer-configuration-modal';
import { ALBCreateForm } from './components/alb-create-form';
import { NLBCreateForm } from './components/nlb-create-form';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export type LoadBalancerConfiguration = {
  loadBalancerType: 'ALB' | 'NLB' | '';
};

export default function CreateLoadBalancerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<LoadBalancerConfiguration>({
    loadBalancerType: '',
  });
  const [loadBalancerData, setLoadBalancerData] = useState<any>(null);

  // Show modal on page load if no configuration is set
  useEffect(() => {
    if (!config.loadBalancerType) {
      setShowModal(true);
    }
  }, []);

  const handleConfigurationComplete = (
    configuration: LoadBalancerConfiguration
  ) => {
    setConfig(configuration);
    setShowModal(false);
    setCurrentStep(1); // Start at step 1
  };

  const handleModalClose = () => {
    // If modal is closed without selection, go back to list
    router.push('/networking/load-balancing');
  };

  const handleBack = () => {
    // Reset configuration and show modal again
    setConfig({ loadBalancerType: '' });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleStepComplete = (data: any) => {
    setLoadBalancerData(data);
    setCurrentStep(2); // Move to listener details
  };

  const handleStepBack = () => {
    setCurrentStep(1); // Go back to load balancer details
  };

  // Custom breadcrumbs to remove "Balancer" segment
  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/networking', title: 'Networking' },
    { href: '/networking/load-balancing', title: 'Load Balancers' },
    { href: '/networking/load-balancing/balancer/create', title: 'Create' },
  ];

  // Show modal if configuration is not complete
  if (showModal || !config.loadBalancerType) {
    return (
      <PageLayout
        title='Create Load Balancer'
        description='Choose your load balancer configuration to get started'
        customBreadcrumbs={customBreadcrumbs}
      >
        <LoadBalancerConfigurationModal
          isOpen={showModal}
          onComplete={handleConfigurationComplete}
          onClose={handleModalClose}
        />
      </PageLayout>
    );
  }

  // Show appropriate form based on configuration
  if (config.loadBalancerType === 'ALB') {
    return (
      <ALBCreateForm
        config={config}
        onBack={handleBack}
        onCancel={() => router.push('/networking/load-balancing')}
        currentStep={currentStep}
        onStepComplete={handleStepComplete}
        onStepBack={handleStepBack}
        loadBalancerData={loadBalancerData}
        customBreadcrumbs={customBreadcrumbs}
      />
    );
  }

  // Show NLB form
  if (config.loadBalancerType === 'NLB') {
    return (
      <NLBCreateForm
        config={config}
        onBack={handleBack}
        onCancel={() => router.push('/networking/load-balancing')}
        currentStep={currentStep}
        onStepComplete={handleStepComplete}
        onStepBack={handleStepBack}
        loadBalancerData={loadBalancerData}
        customBreadcrumbs={customBreadcrumbs}
      />
    );
  }

  // Default fallback
  return (
    <PageLayout
      title='Create Load Balancer'
      description='Please select a load balancer type to continue'
      customBreadcrumbs={customBreadcrumbs}
    >
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Button onClick={handleBack}>Select Load Balancer Type</Button>
        </div>
      </div>
    </PageLayout>
  );
}
