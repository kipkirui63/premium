import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TurnstileWidget from './TurnstileWidget';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: AuthMode;
  resetUid?: string;
  resetToken?: string;
}

const LoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  resetUid = '',
  resetToken = '',
}: LoginModalProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const { login, forgotPassword, register, resetPassword, isLoading } = useAuth();
  const { toast } = useToast();
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const isRegister = mode === 'register';
  const isForgotPassword = mode === 'forgot-password';
  const isResetPassword = mode === 'reset-password';
  const requiresPassword = mode === 'login' || mode === 'register' || mode === 'reset-password';
  const requiresTurnstile = mode !== 'reset-password';

  useEffect(() => {
    setMode(initialMode);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setTurnstileToken('');
    setTurnstileNonce((current) => current + 1);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((mode === 'login' || mode === 'register' || mode === 'forgot-password') && !email) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (requiresPassword && !password) {
      toast({
        title: "Validation Error",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }

    if (isRegister) {
      if (!firstName || !lastName || !phone) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 8) {
        toast({
          title: "Validation Error",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        return;
      }
    }

    if (isResetPassword) {
      if (!resetUid || !resetToken) {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is incomplete or invalid.",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 8) {
        toast({
          title: "Validation Error",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        return;
      }
    }

    if (turnstileSiteKey && requiresTurnstile && !turnstileToken) {
      toast({
        title: "Security Check Required",
        description: "Please complete the security challenge before continuing.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isRegister) {
        await register(firstName, lastName, email, phone, password, confirmPassword, turnstileToken);
        toast({
          title: "Registration Successful",
          description: "Account created successfully. Please check your email to activate it before signing in.",
        });
        
        // Clear form and switch to login
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setTurnstileToken('');
        setTurnstileNonce((current) => current + 1);
        setMode('login');
      } else if (isForgotPassword) {
        const message = await forgotPassword(email, turnstileToken);
        toast({
          title: "Check Your Email",
          description: message,
        });
        setTurnstileToken('');
        setTurnstileNonce((current) => current + 1);
        setMode('login');
      } else {
        if (isResetPassword) {
          const message = await resetPassword(resetUid, resetToken, password, confirmPassword);
          toast({
            title: "Password Updated",
            description: message,
          });
          window.location.assign('/marketplace?auth=login&reason=password-updated');
          return;
        }

        await login(email, password, turnstileToken);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setTurnstileToken('');
        setTurnstileNonce((current) => current + 1);
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      setTurnstileToken('');
      if (requiresTurnstile) {
        setTurnstileNonce((current) => current + 1);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-50 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'register' && 'Create Account'}
              {mode === 'login' && 'Welcome Back'}
              {mode === 'forgot-password' && 'Forgot Password'}
              {mode === 'reset-password' && 'Set New Password'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {mode === 'register' && 'Join CrispAI Marketplace today'}
              {mode === 'login' && 'Sign in to your account'}
              {mode === 'forgot-password' && 'Enter your email to receive a reset link'}
              {mode === 'reset-password' && 'Choose a new password for your account'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="John"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {!isResetPassword && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="john@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {turnstileSiteKey && requiresTurnstile && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Security Verification</Label>
              <div key={turnstileNonce}>
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken('')}
                />
              </div>
              <p className="text-xs text-gray-500">
                Complete the challenge to protect sign-in and registration from abuse.
              </p>
            </div>
          )}

          {requiresPassword && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {isResetPassword ? 'New Password' : 'Password'} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {(isRegister || isResetPassword) && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                {mode === 'register' && 'Create Account'}
                {mode === 'login' && 'Sign In'}
                {mode === 'forgot-password' && 'Send Reset Link'}
                {mode === 'reset-password' && 'Update Password'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'login' && (
            <div className="space-y-3">
              <button
                onClick={() => setMode('forgot-password')}
                className="text-sm text-slate-600 hover:text-blue-700 transition-colors"
                disabled={isLoading}
                type="button"
              >
                Forgot your password?
              </button>
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                disabled={isLoading}
                type="button"
              >
                Don't have an account? Create one
              </button>
            </div>
          )}

          {mode === 'register' && (
            <button
              onClick={() => setMode('login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              disabled={isLoading}
              type="button"
            >
              Already have an account? Sign in
            </button>
          )}

          {mode === 'forgot-password' && (
            <button
              onClick={() => setMode('login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              disabled={isLoading}
              type="button"
            >
              Back to sign in
            </button>
          )}

          {mode === 'reset-password' && (
            <button
              onClick={() => window.location.assign('/marketplace?auth=login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              disabled={isLoading}
              type="button"
            >
              Back to sign in
            </button>
          )}
        </div>

        {isRegister && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default LoginModal;
