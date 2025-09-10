import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoginForm } from '@/hooks/useAuthentication';
import { validateLoginForm, sanitizeUsername } from '@/lib/validation/loginValidation';
import { cn } from '@/lib/utils';

/**
 * Enhanced Login Form Component with advanced validation
 * Supports both Arabic and English locales
 * Includes real-time validation and accessibility features
 */
export function EnhancedLoginForm({ 
  onSuccess,
  className,
  locale = 'fa',
  title,
  description
}) {
  const { login, isLoading, error, clearError } = useLoginForm();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Localized text
  const text = {
    fa: {
      title: title || 'تسجيل الدخول',
      description: description || 'أدخل بيانات اعتمادك للوصول إلى لوحة الشفافية',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      usernamePlaceholder: 'أدخل اسم المستخدم',
      passwordPlaceholder: 'أدخل كلمة المرور',
      signIn: 'تسجيل الدخول',
      signingIn: 'جاري تسجيل الدخول...',
      accessInfo: 'للوصول إلى لوحة الشفافية',
      showPassword: 'إظهار كلمة المرور',
      hidePassword: 'إخفاء كلمة المرور'
    },
    en: {
      title: title || 'Sign In',
      description: description || 'Enter your credentials to access the transparency dashboard',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      accessInfo: 'Access the transparency dashboard',
      showPassword: 'Show password',
      hidePassword: 'Hide password'
    }
  };

  const t = text[locale] || text.fa;

  /**
   * Validate form and update validation state
   */
  const validateForm = () => {
    const validation = validateLoginForm(formData, locale);
    setFieldErrors(validation.errors);
    setIsFormValid(validation.isValid);
    return validation.isValid;
  };

  /**
   * Handle input changes with real-time validation
   */
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Sanitize username input
    if (field === 'username') {
      processedValue = sanitizeUsername(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear general error when user starts typing
    if (error) {
      clearError();
    }
  };

  /**
   * Handle field blur (when user leaves field)
   */
  const handleFieldBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, password: true });
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate form whenever form data changes
  useEffect(() => {
    validateForm();
  }, [formData, locale]);

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* General Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error.message || error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              {t.username}
              {touched.username && !fieldErrors.username && formData.username && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onBlur={() => handleFieldBlur('username')}
              placeholder={t.usernamePlaceholder}
              disabled={isLoading}
              className={cn(
                touched.username && fieldErrors.username && "border-red-500 focus-visible:ring-red-500",
                touched.username && !fieldErrors.username && formData.username && "border-green-500 focus-visible:ring-green-500"
              )}
              autoComplete="username"
              dir={locale === 'fa' ? 'ltr' : 'ltr'}
              aria-invalid={touched.username && !!fieldErrors.username}
              aria-describedby={fieldErrors.username ? "username-error" : undefined}
            />
            {touched.username && fieldErrors.username && (
              <p id="username-error" className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              {t.password}
              {touched.password && !fieldErrors.password && formData.password && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                placeholder={t.passwordPlaceholder}
                disabled={isLoading}
                className={cn(
                  locale === 'fa' ? "pr-10" : "pl-10",
                  touched.password && fieldErrors.password && "border-red-500 focus-visible:ring-red-500",
                  touched.password && !fieldErrors.password && formData.password && "border-green-500 focus-visible:ring-green-500"
                )}
                autoComplete="current-password"
                dir="ltr"
                aria-invalid={touched.password && !!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700",
                  locale === 'fa' ? "left-3" : "right-3"
                )}
                disabled={isLoading}
                tabIndex={-1}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <p id="password-error" className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.signingIn}
              </>
            ) : (
              t.signIn
            )}
          </Button>
        </form>

        {/* Additional Information */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>{t.accessInfo}</p>
        </div>
      </CardContent>
    </Card>
  );
}