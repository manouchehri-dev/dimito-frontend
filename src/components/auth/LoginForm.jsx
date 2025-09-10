import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoginForm } from '@/hooks/useAuthentication';
import { cn } from '@/lib/utils';

/**
 * Login Form Component
 * Handles user authentication with username and password
 * Includes form validation, loading states, and error handling
 */
export function LoginForm({ 
  onSuccess,
  className,
  title = "تسجيل الدخول",
  description = "أدخل بيانات اعتمادك للوصول إلى لوحة الشفافية"
}) {
  const { login, isLoading, error, clearError } = useLoginForm();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Handle input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Clear general error when user starts typing
    if (error) {
      clearError();
    }
  };

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'اسم المستخدم مطلوب';
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook and displayed in the UI
      console.error('Login failed:', error);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error.message || error}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="أدخل اسم المستخدم"
              disabled={isLoading}
              className={cn(
                fieldErrors.username && "border-red-500 focus-visible:ring-red-500"
              )}
              autoComplete="username"
              dir="ltr"
            />
            {fieldErrors.username && (
              <p className="text-sm text-red-600">{fieldErrors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="أدخل كلمة المرور"
                disabled={isLoading}
                className={cn(
                  "pr-10",
                  fieldErrors.password && "border-red-500 focus-visible:ring-red-500"
                )}
                autoComplete="current-password"
                dir="ltr"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>
        </form>

        {/* Additional Information */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>للوصول إلى لوحة الشفافية</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simplified Login Form for embedded use
 */
export function SimpleLoginForm({ onSubmit, isLoading, error }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error.message || error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="simple-username">اسم المستخدم</Label>
        <Input
          id="simple-username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="أدخل اسم المستخدم"
          disabled={isLoading}
          required
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="simple-password">كلمة المرور</Label>
        <div className="relative">
          <Input
            id="simple-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="أدخل كلمة المرور"
            disabled={isLoading}
            className="pr-10"
            required
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري تسجيل الدخول...
          </>
        ) : (
          'تسجيل الدخول'
        )}
      </Button>
    </form>
  );
}