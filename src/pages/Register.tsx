import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { register, type RegisterData } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/onsite-logo.png';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeToTerms: checked }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.company.trim()) {
      setError('Please enter your company name');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData: RegisterData = {
        fullName: formData.fullName,
        email: formData.email,
        company: formData.company,
        phone: formData.phone || undefined,
        password: formData.password,
      };

      // Call the authentication API
      const response = await register(userData);

      // Update the AuthContext with the registered user
      setUser(response.user);

      toast({
        title: 'Account created successfully!',
        description: `Welcome to OnSite, ${response.user.name}!`,
      });

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/Dashboard');
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const length = formData.password.length;
    if (length === 0) return { text: '', color: '' };
    if (length < 8) return { text: 'Too short', color: 'text-red-600' };
    if (length < 12) return { text: 'Good', color: 'text-yellow-600' };
    return { text: 'Strong', color: 'text-green-600' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 py-12">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 -z-10"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center mb-4"
          >
            <img src={logo} alt="OnSite Logo" className="h-20" />
          </motion.div>
          <p className="text-muted-foreground" style={{ fontSize: '1.125rem' }}>
            Start your 14-day free trial
          </p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-2xl border-2 border-gray-100">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center" style={{ letterSpacing: '-0.01em' }}>
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Get started with OnSite today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="name"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Your Roofing Company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="organization"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="tel"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                  className="h-11"
                />
                {formData.password && (
                  <p className={`text-xs ${strength.color}`}>
                    Password strength: {strength.text}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                  className="h-11"
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center text-xs text-emerald-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passwords match
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                  className="mt-1"
                />
                <Label
                  htmlFor="agreeToTerms"
                  className="text-sm font-normal cursor-pointer leading-tight"
                >
                  I agree to the{' '}
                  <Link to="/terms" className="text-emerald-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-emerald-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-6">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
