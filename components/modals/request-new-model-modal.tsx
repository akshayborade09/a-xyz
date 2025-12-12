'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';

interface RequestNewModelModalProps {
  open: boolean;
  onClose: () => void;
}

export function RequestNewModelModal({
  open,
  onClose,
}: RequestNewModelModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    modelName: '',
    modelLink: '',
    modality: '',
    useCase: '',
    trafficDetails: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.modelName.trim() ||
      !formData.modelLink.trim() ||
      !formData.modality
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Request Submitted Successfully! 🎉',
        description:
          'Your model request has been submitted. Our team will review it and get back to you within 48 hours.',
      });

      // Reset form and close modal
      setFormData({
        modelName: '',
        modelLink: '',
        modality: '',
        useCase: '',
        trafficDetails: '',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description:
          'There was an error submitting your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-base font-semibold text-black'>
            Request new model
          </DialogTitle>
          <p className='text-sm text-muted-foreground'>
            You can request us to add an AI model with payment in tokens.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>

          {/* Model Name Field */}
          <div className='space-y-2'>
            <Label htmlFor='modelName' className='text-sm font-medium'>
              Model name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='modelName'
              value={formData.modelName}
              onChange={e => handleInputChange('modelName', e.target.value)}
              placeholder='e.g., deepseek-ai/DeepSeek-V3.1'
              required
              disabled={isSubmitting}
              className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
          </div>

          {/* Link to Model Field */}
          <div className='space-y-2'>
            <Label htmlFor='modelLink' className='text-sm font-medium'>
              Link to the Model <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='modelLink'
              type='url'
              value={formData.modelLink}
              onChange={e => handleInputChange('modelLink', e.target.value)}
              placeholder='https://...'
              required
              disabled={isSubmitting}
              className='focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
          </div>

          {/* Modality Field */}
          <div className='space-y-2'>
            <Label htmlFor='modality' className='text-sm font-medium'>
              Modality <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={formData.modality}
              onValueChange={value => handleInputChange('modality', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className='focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                <SelectValue placeholder='Video' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='text'>Text</SelectItem>
                <SelectItem value='image'>Image</SelectItem>
                <SelectItem value='video'>Video</SelectItem>
                <SelectItem value='audio'>Audio</SelectItem>
                <SelectItem value='multimodal'>Multimodal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Use Case Field */}
          <div className='space-y-2'>
            <Label htmlFor='useCase' className='text-sm font-medium'>
              Please describe your use case:
            </Label>
            <Textarea
              id='useCase'
              value={formData.useCase}
              onChange={e => handleInputChange('useCase', e.target.value)}
              placeholder='Tool calling, report summarisation, financial reasoning etc.'
              disabled={isSubmitting}
              className='min-h-[80px] focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
          </div>

          {/* Traffic Details Field */}
          <div className='space-y-2'>
            <Label htmlFor='trafficDetails' className='text-sm font-medium'>
              Please describe your traffic and usage details:
            </Label>
            <Textarea
              id='trafficDetails'
              value={formData.trafficDetails}
              onChange={e => handleInputChange('trafficDetails', e.target.value)}
              placeholder='Requests per min/day/hour, input token length, output token length, etc'
              disabled={isSubmitting}
              className='min-h-[80px] focus:ring-2 focus:ring-ring focus:ring-offset-2'
            />
          </div>

          {/* Form Buttons */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-primary text-primary-foreground hover:bg-primary/90'
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
