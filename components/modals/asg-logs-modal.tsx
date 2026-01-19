'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, ChevronDown, ChevronUp, CalendarIcon, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface ASGEvent {
  event_id: string;
  event_type: string;
  event_category: 'Resource' | 'Action';
  event_status: 'START' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
  source: 'User' | 'System' | 'Policy';
  timestamp: string;
  message: string;
  action: string;
}

interface ASGLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asgName: string;
}

export function ASGLogsModal({ isOpen, onClose, asgName }: ASGLogsModalProps) {
  const { toast } = useToast();

  // State for filters
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isDateSelecting, setIsDateSelecting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 20;

  const datePresets = [
    {
      label: 'Last 7 days',
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date(),
      },
    },
    {
      label: 'Last 30 days',
      range: {
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
      },
    },
    {
      label: 'Last 3 months',
      range: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        to: new Date(),
      },
    },
    {
      label: 'This month',
      range: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      },
    },
  ];

  const handlePresetSelect = (preset: (typeof datePresets)[0]) => {
    setDateRange(preset.range);
    setCalendarOpen(false);
    setIsDateSelecting(false);
    setCurrentPage(1);
  };

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDateRange(selectedDate);
    setCurrentPage(1);
    if (selectedDate?.from && selectedDate?.to) {
      setIsDateSelecting(false);
      setCalendarOpen(false);
    } else if (selectedDate?.from && !selectedDate?.to) {
      setIsDateSelecting(true);
    } else {
      setIsDateSelecting(false);
    }
  };

  // Mock events with more instances (updated to recent dates: Jan 12-19, 2026)
  const allEvents: ASGEvent[] = [
    {
      event_id: 'evt-7f3a91',
      event_type: 'SCALE_OUT',
      event_category: 'Action',
      event_status: 'START',
      source: 'Policy',
      timestamp: '2026-01-12T10:32:15Z',
      message: 'Scale-out initiated due to CPU threshold breach',
      action: 'Launching 2 new instances to meet target capacity',
    },
    {
      event_id: 'evt-8b4c22',
      event_type: 'SCALE_OUT',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-12T10:33:42Z',
      message: 'Launching new instance media-processing-asg-05',
      action: 'Instance provisioning in progress - waiting for health checks',
    },
    {
      event_id: 'evt-9d5e33',
      event_type: 'SCALE_OUT',
      event_category: 'Resource',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-12T10:35:18Z',
      message: 'Successfully launched instance media-processing-asg-05',
      action: 'Instance healthy and added to load balancer',
    },
    {
      event_id: 'evt-1a6f44',
      event_type: 'HEALTH_CHECK',
      event_category: 'Action',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-12T11:15:30Z',
      message: 'Health check passed for all instances',
      action: 'Verified 4/4 instances healthy',
    },
    {
      event_id: 'evt-2b7g55',
      event_type: 'SCALE_IN',
      event_category: 'Action',
      event_status: 'START',
      source: 'Policy',
      timestamp: '2026-01-12T14:22:05Z',
      message: 'Scale-in initiated due to low CPU utilization',
      action: 'Terminating 1 instance to reduce capacity',
    },
    {
      event_id: 'evt-3c8h66',
      event_type: 'SCALE_IN',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-12T14:23:11Z',
      message: 'Terminating instance media-processing-asg-03',
      action: 'Draining connections before termination',
    },
    {
      event_id: 'evt-4d9i77',
      event_type: 'SCALE_IN',
      event_category: 'Resource',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-12T14:25:47Z',
      message: 'Successfully terminated instance media-processing-asg-03',
      action: 'Instance removed from ASG and terminated',
    },
    {
      event_id: 'evt-5e0j88',
      event_type: 'HEALTH_CHECK',
      event_category: 'Action',
      event_status: 'FAILED',
      source: 'System',
      timestamp: '2026-01-13T16:10:22Z',
      message: 'Health check failed for instance media-processing-asg-02',
      action: 'Instance marked unhealthy - replacement required',
    },
    {
      event_id: 'evt-6f1k99',
      event_type: 'INSTANCE_REPLACE',
      event_category: 'Action',
      event_status: 'START',
      source: 'System',
      timestamp: '2026-01-13T16:11:35Z',
      message: 'Initiating replacement for unhealthy instance',
      action: 'Launching new instance and terminating unhealthy one',
    },
    {
      event_id: 'evt-7g2la0',
      event_type: 'INSTANCE_REPLACE',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-13T16:12:58Z',
      message: 'Terminating unhealthy instance media-processing-asg-02',
      action: 'Gracefully shutting down unhealthy instance',
    },
    {
      event_id: 'evt-8h3mb1',
      event_type: 'INSTANCE_REPLACE',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-13T16:14:21Z',
      message: 'Launching replacement instance media-processing-asg-06',
      action: 'New instance starting - waiting for health checks',
    },
    {
      event_id: 'evt-9i4nc2',
      event_type: 'INSTANCE_REPLACE',
      event_category: 'Resource',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-13T16:16:45Z',
      message: 'Successfully replaced instance media-processing-asg-02',
      action: 'New instance healthy and in service',
    },
    {
      event_id: 'evt-0j5od3',
      event_type: 'SCHEDULED_ACTION',
      event_category: 'Action',
      event_status: 'SUCCESS',
      source: 'User',
      timestamp: '2026-01-13T22:00:00Z',
      message: 'Nightly scale down completed - set desired capacity to 2',
      action: 'Scheduled policy executed - adjusted min/max/desired capacity',
    },
    {
      event_id: 'evt-1k6pe4',
      event_type: 'SCALE_OUT',
      event_category: 'Action',
      event_status: 'START',
      source: 'User',
      timestamp: '2026-01-14T09:00:15Z',
      message: 'Morning scale-up initiated via scheduled action',
      action: 'Launching instances to reach desired capacity of 4',
    },
    {
      event_id: 'evt-2l7qf5',
      event_type: 'SCALE_OUT',
      event_category: 'Action',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-14T09:03:42Z',
      message: 'Scaled to desired capacity of 4 instances',
      action: 'All instances healthy and in service',
    },
    {
      event_id: 'evt-3m8rg6',
      event_type: 'HEALTH_CHECK',
      event_category: 'Action',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-14T12:30:00Z',
      message: 'Periodic health check completed - all instances healthy',
      action: 'All instances passed health verification',
    },
    {
      event_id: 'evt-4n9sh7',
      event_type: 'SCALE_OUT',
      event_category: 'Action',
      event_status: 'START',
      source: 'Policy',
      timestamp: '2026-01-15T15:45:22Z',
      message: 'Scale-out triggered by memory utilization exceeding 80%',
      action: 'Memory-based scaling policy activated',
    },
    {
      event_id: 'evt-5o0ti8',
      event_type: 'SCALE_OUT',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-15T15:46:35Z',
      message: 'Provisioning instance media-processing-asg-07',
      action: 'Instance launching - configuring network and storage',
    },
    {
      event_id: 'evt-6p1uj9',
      event_type: 'SCALE_OUT',
      event_category: 'Resource',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-15T15:49:12Z',
      message: 'Instance media-processing-asg-07 launched and healthy',
      action: 'Instance added to ASG and serving traffic',
    },
    {
      event_id: 'evt-7q2vk0',
      event_type: 'SCALE_OUT',
      event_category: 'Action',
      event_status: 'START',
      source: 'Policy',
      timestamp: '2026-01-16T16:12:08Z',
      message: 'Additional scale-out required - CPU at 85%',
      action: 'CPU threshold breached - launching additional instance',
    },
    {
      event_id: 'evt-8r3wl1',
      event_type: 'SCALE_OUT',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-16T16:13:45Z',
      message: 'Starting instance media-processing-asg-08',
      action: 'Instance initialization in progress',
    },
    {
      event_id: 'evt-9s4xm2',
      event_type: 'SCALE_OUT',
      event_category: 'Resource',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-16T16:16:20Z',
      message: 'Reached maximum capacity of 8 instances',
      action: 'All instances healthy - at max capacity',
    },
    {
      event_id: 'evt-0t5yn3',
      event_type: 'HEALTH_CHECK',
      event_category: 'Action',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-17T17:00:00Z',
      message: 'All 8 instances passed health check',
      action: 'Verified full capacity health status',
    },
    {
      event_id: 'evt-1u6zo4',
      event_type: 'SCALE_IN',
      event_category: 'Action',
      event_status: 'START',
      source: 'Policy',
      timestamp: '2026-01-17T19:30:15Z',
      message: 'Scale-in initiated - CPU utilization dropped to 35%',
      action: 'Low utilization detected - reducing capacity',
    },
    {
      event_id: 'evt-2v7ap5',
      event_type: 'SCALE_IN',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-17T19:31:28Z',
      message: 'Draining connections from instance media-processing-asg-08',
      action: 'Gracefully removing instance from load balancer',
    },
    {
      event_id: 'evt-3w8bq6',
      event_type: 'SCALE_IN',
      event_category: 'Resource',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-17T19:33:55Z',
      message: 'Instance media-processing-asg-08 terminated successfully',
      action: 'Instance terminated and removed from ASG',
    },
    {
      event_id: 'evt-4x9cr7',
      event_type: 'SCALE_IN',
      event_category: 'Action',
      event_status: 'START',
      source: 'Policy',
      timestamp: '2026-01-18T20:15:42Z',
      message: 'Continuing scale-in - load decreased further',
      action: 'Terminating another instance to optimize cost',
    },
    {
      event_id: 'evt-5y0ds8',
      event_type: 'SCALE_IN',
      event_category: 'Resource',
      event_status: 'PARTIAL',
      source: 'System',
      timestamp: '2026-01-18T20:16:50Z',
      message: 'Terminating instance media-processing-asg-07',
      action: 'Stopping instance and releasing resources',
    },
    {
      event_id: 'evt-6z1et9',
      event_type: 'SCALE_IN',
      event_category: 'Resource',
      event_status: 'SUCCESS',
      source: 'System',
      timestamp: '2026-01-18T20:19:18Z',
      message: 'Scale-in completed - now running 6 instances',
      action: 'Capacity adjusted to optimal level',
    },
    {
      event_id: 'evt-7a2fu0',
      event_type: 'SCHEDULED_ACTION',
      event_category: 'Action',
      event_status: 'SUCCESS',
      source: 'User',
      timestamp: '2026-01-18T22:00:00Z',
      message: 'Nightly scale down executed - desired capacity set to 2',
      action: 'Scheduled policy applied - terminating excess instances',
    },
  ];

  // Filter events based on selected filters
  const filteredEvents = allEvents.filter((event) => {
    // Event Type filter
    if (eventTypeFilter !== 'all' && event.event_category !== eventTypeFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && event.event_status !== statusFilter) {
      return false;
    }
    
    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      const eventDate = new Date(event.timestamp);
      if (eventDate < dateRange.from || eventDate > dateRange.to) {
        return false;
      }
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    if (filterType === 'eventType') setEventTypeFilter(value);
    if (filterType === 'status') setStatusFilter(value);
  };

  const toggleRowExpansion = (eventId: string) => {
    // Only allow one row to be expanded at a time (accordion behavior)
    if (expandedRows.has(eventId)) {
      // If clicking the currently expanded row, collapse it
      setExpandedRows(new Set());
    } else {
      // Otherwise, expand only this row (collapse any other)
      setExpandedRows(new Set([eventId]));
    }
  };

  const handleDownloadCSV = () => {
    // Mock CSV download
    const csvContent = [
      ['Event ID', 'Event Type', 'Source', 'Event Status', 'Details', 'Action', 'Timestamp'],
      ...filteredEvents.map((event) => [
        event.event_id,
        event.event_type,
        event.source,
        event.event_status,
        event.message,
        event.action,
        event.timestamp,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asgName}-scaling-logs.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'CSV Downloaded',
      description: `Scaling logs for ${asgName} have been downloaded.`,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[85vh] overflow-hidden flex flex-col [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>{asgName} scaling logs</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* Filters */}
        <div className="flex items-center gap-3 pb-4 border-b">
          {/* Date Range Filter */}
          <Popover 
            open={calendarOpen} 
            onOpenChange={(open) => {
              setCalendarOpen(open);
              if (open) {
                setEventTypeOpen(false);
                setStatusOpen(false);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9 text-sm font-normal"
              >
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    <span className="text-blue-600">
                      From: {format(dateRange.from, 'MMM dd, yyyy')} | Select end date
                    </span>
                  )
                ) : (
                  'Select date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 flex" align="start">
              {/* Quick Presets Sidebar */}
              <div className="w-48 p-4 border-r bg-gray-50">
                <h4 className="font-medium text-sm mb-3 text-gray-700">
                  Quick Select
                </h4>
                <div className="space-y-2">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-9 text-sm text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                {/* Current Selection Status */}
                {dateRange?.from && (
                  <div className="mt-4 pt-3 border-t">
                    <h5 className="font-medium text-xs text-gray-600 mb-2">
                      Current Selection
                    </h5>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Start: {format(dateRange.from, 'MMM dd, y')}</div>
                      {dateRange.to ? (
                        <div>End: {format(dateRange.to, 'MMM dd, y')}</div>
                      ) : (
                        <div className="text-blue-600">Select end date →</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Calendar Section */}
              <div className="p-3">
                {/* Selection Progress Indicator */}
                {isDateSelecting && dateRange?.from && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                    <span className="font-medium">Start:</span>{' '}
                    {format(dateRange.from, 'LLL dd, y')}
                    <br />
                    <span className="text-gray-600">Now select an end date</span>
                  </div>
                )}

                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                  className="rounded-md"
                  modifiers={{
                    ...(dateRange?.from && { start: dateRange.from }),
                    ...(dateRange?.to && { end: dateRange.to }),
                  }}
                  modifiersStyles={{
                    start: {
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontWeight: 'bold',
                    },
                    end: {
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontWeight: 'bold',
                    },
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Event Type Filter */}
          <Select 
            value={eventTypeFilter} 
            onValueChange={(value) => handleFilterChange('eventType', value)}
            open={eventTypeOpen}
            onOpenChange={(open) => {
              setEventTypeOpen(open);
              if (open) {
                setStatusOpen(false);
                setCalendarOpen(false);
              }
            }}
          >
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              <SelectItem value="Resource">Resource</SelectItem>
              <SelectItem value="Action">Action</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select 
            value={statusFilter} 
            onValueChange={(value) => handleFilterChange('status', value)}
            open={statusOpen}
            onOpenChange={(open) => {
              setStatusOpen(open);
              if (open) {
                setEventTypeOpen(false);
                setCalendarOpen(false);
              }
            }}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="START">START</SelectItem>
              <SelectItem value="SUCCESS">SUCCESS</SelectItem>
              <SelectItem value="FAILED">FAILED</SelectItem>
              <SelectItem value="PARTIAL">PARTIAL</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'log' : 'logs'}
          </div>
        </div>
        
        <div className="h-[600px] overflow-auto border rounded-lg">
          {filteredEvents.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-12">
                <p className="text-lg font-medium text-muted-foreground">No logs available</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters to see more results</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted sticky top-0 z-10">
                <tr className="border-b">
                  <th className="text-left px-4 py-3 text-sm font-medium">Event ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Event Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Source</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Details</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map((event, index) => {
                  const isExpanded = expandedRows.has(event.event_id);
                  return (
                    <>
                      <tr
                        key={event.event_id}
                        className={`border-b ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                        } hover:bg-muted/50 transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm font-mono">{event.event_id}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium">{event.event_type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {event.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge status={event.event_status} />
                        </td>
                        <td className="px-4 py-3 text-sm max-w-md">
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => toggleRowExpansion(event.event_id)}
                              className="hover:bg-muted rounded p-1 flex-shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <span className="flex-1">{event.message}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(event.timestamp)}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className={`border-b ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                        }`}>
                          <td colSpan={4}></td>
                          <td colSpan={2} className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <div className="w-6 flex-shrink-0"></div>
                              <div className="flex-1 p-2 bg-muted/50 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Action Taken:</div>
                                <div className="text-sm text-muted-foreground">{event.action}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} logs
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center min-w-[120px] text-sm font-medium px-4">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

