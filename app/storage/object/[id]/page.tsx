'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

// Mock function to get bucket by ID
const getBucket = (id: string) => {
  const mockBuckets = [
    {
      id: 'bucket-1',
      name: 'user-uploads',
      region: 'us-west-2',
      storageClass: 'standard',
      size: '0 B',
      createdOn: '2024-05-10T16:30:00Z',
      status: 'success',
    },
    {
      id: 'bucket-2',
      name: 'media-backups',
      region: 'ap-south-1',
      storageClass: 'infrequent-access',
      size: '850 MB',
      createdOn: '2024-05-02T00:15:00Z',
      status: 'updating',
    },
    {
      id: 'bucket-3',
      name: 'project-assets',
      region: 'us-east-1',
      storageClass: 'standard',
      size: '12.4 GB',
      createdOn: '2024-04-10T19:53:00Z',
      status: 'success',
    },
    {
      id: 'bucket-4',
      name: 'logs-archive',
      region: 'eu-west-1',
      storageClass: 'infrequent-access',
      size: '2.1 TB',
      createdOn: '2024-03-22T14:40:00Z',
      status: 'success',
    },
  ];
  return mockBuckets.find(bucket => bucket.id === id);
};

export default function BucketDetailsPage() {
  const params = useParams();
  const pathname = usePathname();
  const bucketId = params.id as string;
  const bucket = getBucket(bucketId);

  if (!bucket) {
    return (
      <PageLayout title='Bucket Not Found'>
        <Card>
          <CardContent className='py-12'>
            <p className='text-center text-muted-foreground'>
              The bucket you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const isInfrequentAccess = bucket.storageClass === 'infrequent-access';

  // Determine active tab from pathname
  const getActiveTabFromPath = () => {
    if (pathname.endsWith('/objects') || pathname.endsWith(`/${bucketId}/objects`)) return 'objects';
    if (pathname.endsWith('/rules') || pathname.endsWith(`/${bucketId}/rules`)) return 'rules';
    if (pathname.endsWith('/properties') || pathname.endsWith(`/${bucketId}/properties`)) return 'properties';
    if (pathname.endsWith('/bucket-policy') || pathname.endsWith(`/${bucketId}/bucket-policy`)) return 'bucket-policy';
    // Default to objects if just viewing the bucket
    if (pathname.endsWith(`/${bucketId}`)) return 'objects';
    return 'objects'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  // Update active tab when URL changes (for direct navigation)
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [pathname, bucketId]);

  // Handle tab change without URL navigation to prevent refreshes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Don't navigate - just change the local state
  };

  const tabs = [
    { id: 'objects', label: 'Objects' },
    { id: 'rules', label: 'Rules' },
    { id: 'properties', label: 'Properties' },
    { id: 'bucket-policy', label: 'Bucket Policy' },
  ];

  // Rules empty state icon - Using SVG from public folder
  const rulesEmptyStateIcon = (
    <img
      src='/rule-not-available.svg'
      alt='Rules not available'
      className='w-auto h-auto'
      style={{ maxWidth: '240px', maxHeight: '200px' }}
    />
  );

  // Bucket Policy empty state icon - Using SVG from public folder
  const policyEmptyStateIcon = (
    <img
      src='/bucketpolicy-not-available.svg'
      alt='Bucket policy not available'
      className='w-auto h-auto'
      style={{ maxWidth: '240px', maxHeight: '200px' }}
    />
  );

  return (
    <PageLayout title={bucket.name}>
      <div>
        <VercelTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          size='lg'
        />
      {activeTab === 'objects' && (
        <div className='flex justify-center items-center w-full h-full py-12'>
          <Card className='w-full max-w-md'>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center space-y-6'>
                {/* Title and Region */}
                <div className='flex flex-col items-center space-y-1'>
                  <h2 className='text-xl font-semibold text-center'>Create Session</h2>
                  <p className='text-sm text-muted-foreground text-center'>
                    Region: {bucket.region}
                  </p>
                </div>

                {/* Access Key */}
                <div className='w-full space-y-2'>
                  <Label htmlFor='accessKey' className='text-sm font-medium'>
                    Access Key
                  </Label>
                  <Input
                    id='accessKey'
                    placeholder='Enter access key'
                    className='w-full'
                  />
                </div>

                {/* Secret Key */}
                <div className='w-full space-y-2'>
                  <Label htmlFor='secretKey' className='text-sm font-medium'>
                    Secret Key
                  </Label>
                  <Input
                    id='secretKey'
                    type='password'
                    placeholder='Enter secret key'
                    className='w-full'
                  />
                </div>

                {/* Create Session Button */}
                <Button 
                  className='w-full bg-black text-white hover:bg-black/90 rounded-full'
                  size='lg'
                >
                  Create Session
                </Button>

                {/* Create API keys link */}
                <div className='text-center'>
                  <span className='text-sm text-muted-foreground'>
                    Don't have keys?{' '}
                  </span>
                  <a
                    href='#'
                    className='text-sm text-primary hover:underline font-medium'
                  >
                    Create API keys
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className='w-full border border-gray-200 rounded-lg bg-white mt-6'>
          <div className='pt-12 pb-12 px-6'>
            <div className='flex flex-col items-center justify-center space-y-6' style={{ minHeight: '60vh' }}>
              {/* Icon/Illustration */}
              <div className='mb-4'>
                {rulesEmptyStateIcon}
              </div>
              
              {/* Title and Description */}
              <div className='flex flex-col items-center space-y-2'>
                <h3 className='text-xl font-semibold text-gray-900 text-center mb-2'>
                  Rules Not Available
                </h3>
                <p className='text-sm text-gray-500 text-center max-w-md mb-6'>
                  Lifecycle rules are only available for 'Standard' buckets.
                </p>
              </div>
              
              {/* Create Rule Button */}
              <Button
                className='text-md bg-black text-white hover:bg-black/90 rounded-full px-4'
                onClick={() => {
                  // Handle create rule action
                  console.log('Create rule clicked');
                }}
              >
                Create Rule
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <Label className='font-medium text-base'>Tags (Optional)</Label>
                <p className='text-sm text-muted-foreground mt-1'>
                  You can use bucket tags to track storage costs and organize buckets
                </p>
              </div>
              <Button variant='secondary' size='lg' className='rounded-full'>
                + Add Tags
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'bucket-policy' && (
        <div className='w-full border border-gray-200 rounded-lg bg-white mt-6'>
          <div className='pt-12 pb-12 px-6'>
            <div className='flex flex-col items-center justify-center space-y-6' style={{ minHeight: '60vh' }}>
              {/* Icon/Illustration */}
              <div className='mb-4'>
                {policyEmptyStateIcon}
              </div>
              
              {/* Title and Description */}
              <div className='flex flex-col items-center space-y-2'>
                <h3 className='text-xl font-semibold text-gray-900 text-center mb-2'>
                  Bucket Policies Not Available
                </h3>
                <p className='text-sm text-gray-500 text-center max-w-md mb-6'>
                  Bucket policies are only available for 'Standard' buckets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  );
}
