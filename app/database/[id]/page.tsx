'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { PageLayout } from '../../../components/page-layout';
import { DetailGrid } from '../../../components/detail-grid';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { getDatabase } from '../../../lib/data';
import { DeleteConfirmationModal } from '../../../components/delete-confirmation-modal';
import { StatusBadge } from '../../../components/status-badge';
import { Edit, Trash2, RotateCcw, Pause, Play, Copy, Eye, EyeOff, Plus } from 'lucide-react';
import { VercelTabs } from '../../../components/ui/vercel-tabs';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ShadcnDataTable } from '../../../components/ui/shadcn-data-table';
import { useToast } from '../../../hooks/use-toast';

const tabs = [
  { id: 'connection', label: 'Connection Details' },
  { id: 'backups', label: 'Backups' },
  { id: 'monitoring', label: 'Monitoring' },
];

// Mock data for backup schedules
const backupSchedules = [
  {
    id: 'backup-1',
    name: 'hourly-backup',
    schedule: 'Every hour at minute 0',
    storageBucket: 'backup-storage-us-east',
    maxBackups: 7,
  },
  {
    id: 'backup-2',
    name: 'daily-backup',
    schedule: 'Daily at 12:00 AM',
    storageBucket: 'backup-storage-us-west',
    maxBackups: 30,
  },
];

// Mock data for backup history
const backupHistory = [
  {
    id: 'bkp-1',
    status: 'active',
    name: 'backup-zjr',
    started: '27/06/2024 at 09:29 PM',
    finished: '27/06/2024 at 09:29 PM',
  },
  {
    id: 'bkp-2',
    status: 'active',
    name: 'backup-a4y',
    started: '27/06/2024 at 09:28 PM',
    finished: '27/06/2024 at 09:28 PM',
  },
  {
    id: 'bkp-3',
    status: 'active',
    name: 'backup-5ms',
    started: '27/06/2024 at 09:24 PM',
    finished: '27/06/2024 at 09:25 PM',
  },
  {
    id: 'bkp-4',
    status: 'active',
    name: 'backup-iaz',
    started: '27/06/2024 at 01:18 PM',
    finished: '27/06/2024 at 01:19 PM',
  },
];

// Mock monitoring data
const monitoringData = {
  cpuUtilization: [45, 52, 48, 58, 54, 62, 51, 47, 55, 61, 57, 64],
  freeableMemory: [4.8, 4.5, 5.0, 4.9, 4.6, 4.7, 5.1, 5.3, 4.8, 5.0, 4.9, 5.2],
  dbConnections: [32, 41, 38, 45, 42, 47, 39, 35, 43, 48, 44, 48],
  freeStorage: [73, 74, 75, 76, 75, 74, 76, 77, 76, 75, 77, 77],
  diskIORead: [1.8, 2.1, 1.9, 2.3, 2.2, 2.6, 2.0, 1.7, 2.4, 2.5, 2.3, 2.4],
  diskIOWrite: [1.2, 1.4, 1.3, 1.6, 1.5, 1.8, 1.4, 1.1, 1.6, 1.7, 1.6, 1.7],
  diskQueueDepth: [1.5, 1.8, 1.6, 2.0, 1.9, 2.3, 1.7, 1.4, 2.0, 2.2, 2.0, 2.1],
};

export default function DatabaseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('connection');
  const [showPassword, setShowPassword] = useState(false);
  const [showConnectionURL, setShowConnectionURL] = useState(false);
  const database = getDatabase(params.id);

  if (!database) {
    notFound();
  }

  const handleDelete = () => {
    // In a real app, this would delete the database
    console.log('Deleting database:', database.name);
    router.push('/database');
  };

  const handleEdit = () => {
    router.push(`/database/${database.id}/edit`);
  };

  const handleRestart = () => {
    console.log('Restarting database:', database.name);
    // Mock restart action
  };

  const handlePauseResume = () => {
    console.log(database.status === 'stopped' ? 'Resuming' : 'Pausing', 'database:', database.name);
    // Mock pause/resume action
  };

  // Format created date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${label} has been copied to your clipboard.`,
    });
  };

  // Mock connection details
  const connectionDetails = {
    hosts: [
      'aac24173c14264d30ba8c67518153697-956d2b1fde21c4b7.elb.us-east-1.amazonaws.com:27017',
      'ab1e00129beac49dda3c84e0471157 6f-500a2d077cd5c3f2.elb.us-east-1.amazonaws.com:27017',
      'abe9ad997a7f94d76b3b590c69547f10-aa3785d03f7c83aa.elb.us-east-1.amazonaws.com:27017',
    ],
    port: '27017',
    username: 'databaseAdmin',
    password: 'SecureP@ssw0rd!2024',
    connectionURL: 'mongodb://databaseAdmin:SecureP@ssw0rd!2024@aac24173c14264d30ba8c67518153697-956d2b1fde21c4b7.elb.us-east-1.amazonaws.com:27017',
  };

  // Highcharts configurations - Ultra sleek bars
  const getSimpleBarChart = (data: number[], color: string = '#3b82f6') => ({
    chart: {
      type: 'column',
      height: 140,
      backgroundColor: 'transparent',
      spacing: [0, 0, 0, 0],
    },
    title: { text: null },
    xAxis: { visible: false },
    yAxis: { visible: false },
    tooltip: { enabled: false },
    legend: { enabled: false },
    plotOptions: {
      column: {
        borderRadius: 2,
        pointPadding: 0.35,
        groupPadding: 0.25,
        borderWidth: 0,
      },
    },
    series: [{
      data: data,
      color: color,
      states: { hover: { enabled: false } },
    }],
    credits: { enabled: false },
  });

  const getDualBarChart = (readData: number[], writeData: number[]) => ({
    chart: {
      type: 'column',
      height: 140,
      backgroundColor: 'transparent',
      spacing: [0, 0, 0, 0],
    },
    title: { text: null },
    xAxis: { visible: false },
    yAxis: { visible: false },
    tooltip: { enabled: false },
    legend: { enabled: false },
    plotOptions: {
      column: {
        stacking: 'normal',
        borderRadius: 2,
        pointPadding: 0.35,
        groupPadding: 0.25,
        borderWidth: 0,
      },
    },
    series: [
      {
        data: writeData,
        color: '#93c5fd',
        states: { hover: { enabled: false } },
      },
      {
        data: readData,
        color: '#3b82f6',
        states: { hover: { enabled: false } },
      },
    ],
    credits: { enabled: false },
  });

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/database', title: 'Database' },
    { href: `/database/${database.id}`, title: database.name },
  ];

  return (
    <PageLayout
      title={database.name}
      customBreadcrumbs={customBreadcrumbs}
      hideViewDocs={true}
    >
      {/* Database Basic Information - Summary Card */}
      <div
        className='mb-6 group relative'
        style={{
          borderRadius: '16px',
          border: '4px solid #FFF',
          background: 'linear-gradient(265deg, #FFF -13.17%, #F7F8FD 133.78%)',
          boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
          padding: '1.5rem',
        }}
      >
        {/* Overlay Action Buttons */}
        {database.status !== 'deleting' && (
          <div className='absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleEdit}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title='Edit'
            >
              <Edit className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleRestart}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title='Restart'
            >
              <RotateCcw className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handlePauseResume}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title={database.status === 'stopped' ? 'Resume' : 'Pause'}
            >
              {database.status === 'stopped' ? (
                <Play className='h-4 w-4' />
              ) : (
                <Pause className='h-4 w-4' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsDeleteModalOpen(true)}
              className='h-8 w-8 p-0 text-muted-foreground hover:text-red-600 bg-white/80 hover:bg-white border border-gray-200 shadow-sm'
              title='Delete'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        )}

        <DetailGrid>
          {/* Row 1: Status, DB Engine, DB Version (3 columns) */}
          <div className='col-span-full grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Status
              </label>
              <div>
                <StatusBadge status={database.status} />
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                DB Engine
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.dbEngine}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                DB Version
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.engineVersion}
              </div>
            </div>
          </div>

          {/* Row 2: VPC, Subnet, Configuration (3 columns) */}
          <div className='col-span-full grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                VPC
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.vpc || 'N/A'}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Subnet
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.subnet || 'N/A'}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Configuration
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.configuration || database.instanceType}
              </div>
            </div>
          </div>

          {/* Row 3: Storage, Created On (3 columns - Storage and Created On, third empty) */}
          <div className='col-span-full grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Storage
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {database.storage}
              </div>
            </div>
            <div className='space-y-1'>
              <label
                className='text-sm font-normal text-gray-700'
                style={{ fontSize: '13px' }}
              >
                Created On
              </label>
              <div className='font-medium' style={{ fontSize: '14px' }}>
                {formatDate(database.createdOn)}
              </div>
            </div>
            <div className='space-y-1'>
              {/* Empty third column for balanced layout */}
            </div>
          </div>
        </DetailGrid>
      </div>

      {/* Tabs Section */}
      <div className='space-y-6'>
        <VercelTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          size='lg'
        />

        {/* Connection Details Tab */}
        {activeTab === 'connection' && (
          <div className='bg-card text-card-foreground border-border border rounded-lg p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Left Column */}
              <div className='space-y-6'>
                {/* Host Section */}
                <div>
                  <div className='flex items-center gap-2 mb-3'>
                    <label className='text-sm font-medium text-gray-700'>Host</label>
                    <button className='text-muted-foreground hover:text-foreground'>
                      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z' clipRule='evenodd' />
                      </svg>
                    </button>
                  </div>
                  <div className='space-y-2'>
                    {connectionDetails.hosts.map((host, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between bg-muted p-3 rounded-md border'
                      >
                        <code className='text-sm font-mono'>{host}</code>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => copyToClipboard(host, 'Host')}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Port and Username in 2 columns */}
                <div className='grid grid-cols-2 gap-4'>
                  {/* Port */}
                  <div>
                    <label className='text-sm font-medium text-gray-700 block mb-2'>Port</label>
                    <div className='text-base'>{connectionDetails.port}</div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className='text-sm font-medium text-gray-700 block mb-2'>Username</label>
                    <div className='text-base'>{connectionDetails.username}</div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                {/* Password */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-2'>Password</label>
                  <div className='flex items-center justify-between bg-muted p-3 rounded-md border'>
                    <code className='text-sm font-mono'>
                      {showPassword ? connectionDetails.password : '*'.repeat(17)}
                    </code>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => copyToClipboard(connectionDetails.password, 'Password')}
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Connection URL */}
                <div>
                  <label className='text-sm font-medium text-gray-700 block mb-2'>Connection URL</label>
                  <div className='flex items-center justify-between bg-muted p-3 rounded-md border'>
                    <code className='text-sm font-mono'>
                      {showConnectionURL ? connectionDetails.connectionURL : '•'.repeat(45)}
                    </code>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => setShowConnectionURL(!showConnectionURL)}
                      >
                        {showConnectionURL ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => copyToClipboard(connectionDetails.connectionURL, 'Connection URL')}
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div>
            {/* Backups Header */}
            <div className='flex items-center justify-between mb-6'>
              <div>
                <p className='text-sm text-muted-foreground'>{backupSchedules.length} active schedules</p>
              </div>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Create backup
              </Button>
            </div>

            {/* Backup Schedules */}
            <div className='space-y-4 mb-8'>
              {backupSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className='pt-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <h3 className='font-semibold text-base mb-1'>{schedule.name}</h3>
                        <p className='text-sm text-muted-foreground'>{schedule.schedule}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-muted-foreground mb-1'>Storage Bucket</p>
                        <p className='text-sm font-medium'>{schedule.storageBucket}</p>
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground mb-1'>Maximum Backups</p>
                        <p className='text-sm font-medium'>{schedule.maxBackups}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Backup History */}
            <div className='bg-card text-card-foreground border-border border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>Backup History</h3>
              <ShadcnDataTable
                columns={[
                  {
                    key: 'status',
                    label: 'Status',
                    sortable: true,
                    render: (value: string) => (
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-green-500'></div>
                        <span className='text-sm'>Succeeded</span>
                      </div>
                    ),
                  },
                  {
                    key: 'name',
                    label: 'Name',
                    sortable: true,
                    searchable: true,
                    render: (value: string) => <span className='text-sm'>{value}</span>,
                  },
                  {
                    key: 'started',
                    label: 'Started',
                    sortable: true,
                    render: (value: string) => <span className='text-sm'>{value}</span>,
                  },
                  {
                    key: 'finished',
                    label: 'Finished',
                    sortable: true,
                    render: (value: string) => <span className='text-sm'>{value}</span>,
                  },
                ]}
                data={backupHistory}
                searchableColumns={['name']}
                pageSize={10}
                enableSearch={false}
                enableColumnVisibility={false}
                enablePagination={true}
                enableVpcFilter={false}
              />
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div>
            {/* Monitoring Metrics Grid - 2x3 layout */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* CPU Utilization */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>CPU Utilization</h3>
                    <span className='text-xs text-muted-foreground'>Last 1 hour</span>
                  </div>
                  <div className='h-[140px] mb-4'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getSimpleBarChart(monitoringData.cpuUtilization)}
                    />
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>64%</div>
                    <div className='text-sm text-muted-foreground'>Current Usage</div>
                  </div>
                </CardContent>
              </Card>

              {/* Freeable Memory */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Freeable Memory</h3>
                    <span className='text-xs text-muted-foreground'>Last 1 hour</span>
                  </div>
                  <div className='h-[140px] mb-4'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getSimpleBarChart(monitoringData.freeableMemory)}
                    />
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>5.2 GB</div>
                    <div className='text-sm text-muted-foreground'>Available</div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Connections */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Database Connections</h3>
                    <span className='text-xs text-muted-foreground'>Last 1 hour</span>
                  </div>
                  <div className='h-[140px] mb-4'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getSimpleBarChart(monitoringData.dbConnections)}
                    />
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>48</div>
                    <div className='text-sm text-muted-foreground'>Active Connections</div>
                  </div>
                </CardContent>
              </Card>

              {/* Free Storage Space */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Free Storage Space</h3>
                    <span className='text-xs text-muted-foreground'>Last 1 hour</span>
                  </div>
                  <div className='h-[140px] mb-4'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getSimpleBarChart(monitoringData.freeStorage)}
                    />
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>77 GB</div>
                    <div className='text-sm text-muted-foreground'>Free of 100 GB</div>
                  </div>
                </CardContent>
              </Card>

              {/* Disk I/O Performance */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Disk I/O Performance</h3>
                    <span className='text-xs text-muted-foreground'>Last 1 hour</span>
                  </div>
                  <div className='h-[140px] mb-4'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getDualBarChart(monitoringData.diskIORead, monitoringData.diskIOWrite)}
                    />
                  </div>
                  <div className='flex items-center justify-center gap-8'>
                    <div className='text-center'>
                      <div className='text-xl font-bold'>2.4 MB/s</div>
                      <div className='text-xs text-muted-foreground'>Read</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xl font-bold'>1.7 MB/s</div>
                      <div className='text-xs text-muted-foreground'>Write</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Disk Queue Depth */}
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-base font-semibold'>Disk Queue Depth</h3>
                    <span className='text-xs text-muted-foreground'>Last 1 hour</span>
                  </div>
                  <div className='h-[140px] mb-4'>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getSimpleBarChart(monitoringData.diskQueueDepth)}
                    />
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold'>2.1</div>
                    <div className='text-sm text-muted-foreground'>Average Queue Depth</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        resourceName={database.name}
        resourceType='Database'
        onConfirm={handleDelete}
      />
    </PageLayout>
  );
}

