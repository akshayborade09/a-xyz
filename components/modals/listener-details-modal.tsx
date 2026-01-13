'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ListenerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listener: any;
  isALB: boolean;
}

export function ListenerDetailsModal({
  isOpen,
  onClose,
  listener,
  isALB,
}: ListenerDetailsModalProps) {
  if (!listener) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {listener.name} ({listener.protocol}:{listener.port})
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Listener Settings */}
          <div className='space-y-4'>
            <h4 className='font-medium text-sm text-gray-700'>
              Listener Settings
            </h4>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Protocol
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {listener.protocol}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Port
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {listener.port}
                </div>
              </div>
              {listener.alpnProtocol && (
                <div className='space-y-1'>
                  <label
                    className='text-sm font-normal text-gray-700'
                    style={{ fontSize: '13px' }}
                  >
                    ALPN Protocol
                  </label>
                  <div className='font-medium' style={{ fontSize: '14px' }}>
                    {listener.alpnProtocol}
                  </div>
                </div>
              )}
              {listener.certificateName && (
                <div className='space-y-1'>
                  <label
                    className='text-sm font-normal text-gray-700'
                    style={{ fontSize: '13px' }}
                  >
                    SSL Certificate
                  </label>
                  <div className='font-medium' style={{ fontSize: '14px' }}>
                    {listener.certificateName}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Policy & Rules Configuration (only for ALB) */}
          {isALB && listener.policy && listener.rule && (
            <>
              <Separator />
              <div className='space-y-4'>
                <h4 className='font-medium text-sm text-gray-700'>
                  Policy & Rules Configuration
                </h4>

                {/* Policy Configuration */}
                <div className='space-y-3'>
                  <h5 className='font-medium text-sm'>Policy Configuration</h5>
                  <div className='grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20'>
                    <div className='space-y-1'>
                      <label
                        className='text-sm font-normal text-gray-700'
                        style={{ fontSize: '13px' }}
                      >
                        Policy Name
                      </label>
                      <div className='font-medium' style={{ fontSize: '14px' }}>
                        {listener.policy.name}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <label
                        className='text-sm font-normal text-gray-700'
                        style={{ fontSize: '13px' }}
                      >
                        Action
                      </label>
                      <div className='font-medium' style={{ fontSize: '14px' }}>
                        {listener.policy.action}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rule Configuration */}
                <div className='space-y-3'>
                  <h5 className='font-medium text-sm'>Rule Configuration</h5>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20'>
                    <div className='space-y-1'>
                      <label
                        className='text-sm font-normal text-gray-700'
                        style={{ fontSize: '13px' }}
                      >
                        Rule Type
                      </label>
                      <div className='font-medium' style={{ fontSize: '14px' }}>
                        {listener.rule.ruleType}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <label
                        className='text-sm font-normal text-gray-700'
                        style={{ fontSize: '13px' }}
                      >
                        Comparator
                      </label>
                      <div className='font-medium' style={{ fontSize: '14px' }}>
                        {listener.rule.comparator}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <label
                        className='text-sm font-normal text-gray-700'
                        style={{ fontSize: '13px' }}
                      >
                        Value
                      </label>
                      <div className='font-medium' style={{ fontSize: '14px' }}>
                        {listener.rule.value}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pool Configuration */}
          <Separator />
          <div className='space-y-4'>
            <h4 className='font-medium text-sm text-gray-700'>
              Pool Configuration
            </h4>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20'>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Pool Name
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {listener.pool.name}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Protocol
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {listener.pool.protocol}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Algorithm
                </label>
                <div className='font-medium' style={{ fontSize: '14px' }}>
                  {listener.pool.algorithm}
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  className='text-sm font-normal text-gray-700'
                  style={{ fontSize: '13px' }}
                >
                  Target Group
                </label>
                <div className='flex items-center gap-2'>
                  <span className='font-medium' style={{ fontSize: '14px' }}>
                    {listener.pool.targetGroup}
                  </span>
                  <StatusBadge status={listener.pool.targetGroupStatus} />
                </div>
              </div>
            </div>

            {/* Target Group Health */}
            <div className='space-y-4'>
              <h4 className='font-semibold text-lg'>Target Group Health</h4>
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='text-sm text-gray-700'>
                  {listener.pool.healthyTargets} of{' '}
                  {listener.pool.targetCount} targets are healthy
                </div>
              </div>
            </div>

            {/* Registered Targets */}
            <div className='space-y-4'>
              <h4 className='font-semibold text-lg'>
                Registered Targets ({listener.pool.registeredTargets?.length || 0})
              </h4>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-gray-500 font-normal uppercase text-xs'>
                        Target Name
                      </TableHead>
                      <TableHead className='text-gray-500 font-normal uppercase text-xs'>
                        IP Address
                      </TableHead>
                      <TableHead className='text-gray-500 font-normal uppercase text-xs'>
                        Port
                      </TableHead>
                      <TableHead className='text-gray-500 font-normal uppercase text-xs'>
                        Weight
                      </TableHead>
                      <TableHead className='text-gray-500 font-normal uppercase text-xs'>
                        Target Health
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listener.pool.registeredTargets?.length > 0 ? (
                      listener.pool.registeredTargets.map((target: any) => (
                        <TableRow key={target.name}>
                          <TableCell className='font-medium'>
                            {target.name}
                          </TableCell>
                          <TableCell className='text-blue-600'>
                            {target.ipAddress}
                          </TableCell>
                          <TableCell>{target.port}</TableCell>
                          <TableCell>{target.weight}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                target.health === 'healthy'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                target.health === 'healthy'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : 'bg-red-100 text-red-800 hover:bg-red-100'
                              }
                            >
                              {target.health === 'healthy'
                                ? 'Healthy'
                                : 'Unhealthy'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='text-center text-muted-foreground'
                        >
                          No registered targets
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
