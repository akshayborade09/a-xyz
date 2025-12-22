'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ResetPasswordIAM() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Check for temporary session data
  useEffect(() => {
    const tempSession = sessionStorage.getItem('temp_auth_session');
    if (!tempSession) {
      // If no temp session, redirect to login
      router.push('/auth/new-signin');
      return;
    }
    
    try {
      const sessionData = JSON.parse(tempSession);
      setUserEmail(sessionData.email || '');
    } catch (error) {
      console.error('Error parsing session data:', error);
      router.push('/auth/new-signin');
    }
  }, [router]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      valid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        newErrors.newPassword = 'Password does not meet the requirements';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get the temp session data
      const tempSession = sessionStorage.getItem('temp_auth_session');
      if (!tempSession) {
        throw new Error('Session expired');
      }

      const sessionData = JSON.parse(tempSession);

      // Set authentication data after successful password reset
      const userInfo = {
        name: sessionData.email.split('@')[0],
        email: sessionData.email,
        mobile: '',
        accountType: 'iam',
        organisationId: sessionData.organisationId || '',
        signinCompletedAt: new Date().toISOString(),
      };

      const authToken = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('auth-token', authToken);
      document.cookie = `auth-token=${authToken}; path=/; max-age=86400`;
      localStorage.setItem('user_data', JSON.stringify(userInfo));

      const profileStatus = {
        basicInfoComplete: true,
        identityVerified: true,
        paymentSetupComplete: true,
      };
      localStorage.setItem('user_profile_status', JSON.stringify(profileStatus));
      localStorage.setItem('accessLevel', 'full');

      // Clear temporary session
      sessionStorage.removeItem('temp_auth_session');

      // Redirect to dashboard
      window.location.replace('/dashboard');
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({
        general: 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <div className='flex min-h-screen'>
      {/* Left side - 40% - Image */}
      <div className='hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-green-50 to-green-100'>
        <Image
          src='/register-krutrim-cloud.png'
          alt='Krutrim Cloud Platform'
          fill
          className='object-cover'
          priority
        />
      </div>

      {/* Right side - 60% - Form Content */}
      <div className='flex w-full lg:w-[60%] flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md'>
          {/* Krutrim Logo */}
          <div className='flex justify-start mb-8'>
            <Image
              src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Krutrim%20Logo-YGvFj442htj2kpqEDlt4mjbOEIqtzX.png'
              alt='Krutrim'
              width={180}
              height={60}
              className='h-12'
            />
          </div>

          {/* Card Container */}
          <div className='bg-white rounded-lg'>
            {/* Back Link */}
            <Link 
              href='/auth/new-signin?userType=iam'
              className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors'
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Back to login
            </Link>

            {/* Title and Description */}
            <div className='text-left mb-6'>
              <h2 className='text-3xl font-semibold tracking-tight text-gray-900 mb-2'>
                Reset Password
              </h2>
              <p className='text-md text-gray-500'>
                Choose a strong password to keep your account secure.
              </p>
            </div>

            {/* Form */}
            <form className='space-y-5' onSubmit={handleSubmit}>
              {errors.general && (
                <div className='rounded-md bg-red-50 p-4'>
                  <p className='text-md text-red-700'>{errors.general}</p>
                </div>
              )}

              {/* New Password */}
              <div>
                <Label
                  htmlFor='newPassword'
                  className='block text-sm text-gray-500 mb-2'
                >
                  New Password
                </Label>
                <div className='relative mt-1'>
                  <Input
                    id='newPassword'
                    name='newPassword'
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className={cn(
                      'pr-10',
                      errors.newPassword && 'border-red-300 focus-visible:ring-red-500'
                    )}
                    placeholder='Enter new password'
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className='mt-1 text-sm text-red-600'>{errors.newPassword}</p>
                )}

                {/* Password Requirements */}
                {newPassword && (
                  <div className='mt-3 space-y-2'>
                    <p className='text-xs text-gray-600 font-medium'>Password must contain:</p>
                    <ul className='space-y-1'>
                      <li className={cn(
                        'text-xs flex items-center',
                        passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'
                      )}>
                        <span className='mr-2'>{passwordValidation.minLength ? '✓' : '○'}</span>
                        At least 8 characters
                      </li>
                      <li className={cn(
                        'text-xs flex items-center',
                        passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'
                      )}>
                        <span className='mr-2'>{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                        One uppercase letter
                      </li>
                      <li className={cn(
                        'text-xs flex items-center',
                        passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'
                      )}>
                        <span className='mr-2'>{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                        One lowercase letter
                      </li>
                      <li className={cn(
                        'text-xs flex items-center',
                        passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'
                      )}>
                        <span className='mr-2'>{passwordValidation.hasNumber ? '✓' : '○'}</span>
                        One number
                      </li>
                      <li className={cn(
                        'text-xs flex items-center',
                        passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'
                      )}>
                        <span className='mr-2'>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                        One special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label
                  htmlFor='confirmPassword'
                  className='block text-sm text-gray-500 mb-2'
                >
                  Confirm Password
                </Label>
                <div className='relative mt-1'>
                  <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={cn(
                      'pr-10',
                      errors.confirmPassword && 'border-red-300 focus-visible:ring-red-500'
                    )}
                    placeholder='Re-enter new password'
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>
                )}
              </div>

              {/* Continue Button */}
              <Button
                type='submit'
                className='w-full bg-primary hover:bg-primary/90 text-white'
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Continue'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

