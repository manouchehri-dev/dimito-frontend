/**
 * Login form validation utilities
 * Provides validation functions for login credentials
 */

/**
 * Validate username field
 * @param {string} username - Username to validate
 * @param {string} locale - Locale for error messages ('fa' or 'en')
 * @returns {string|null} Error message or null if valid
 */
export function validateUsername(username, locale = "fa") {
  if (!username || !username.trim()) {
    return locale === "fa" ? "اسم المستخدم مطلوب" : "Username is required";
  }

  if (username.trim().length < 3) {
    return locale === "fa"
      ? "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"
      : "Username must be at least 3 characters";
  }

  if (username.trim().length > 50) {
    return locale === "fa"
      ? "اسم المستخدم يجب أن يكون أقل من 50 حرف"
      : "Username must be less than 50 characters";
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validUsernameRegex.test(username.trim())) {
    return locale === "fa"
      ? "اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط"
      : "Username can only contain letters, numbers, underscores, and hyphens";
  }

  return null;
}

/**
 * Validate password field
 * @param {string} password - Password to validate
 * @param {string} locale - Locale for error messages ('fa' or 'en')
 * @returns {string|null} Error message or null if valid
 */
export function validatePassword(password, locale = "fa") {
  if (!password) {
    return locale === "fa" ? "كلمة المرور مطلوبة" : "Password is required";
  }

  if (password.length < 6) {
    return locale === "fa"
      ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
      : "Password must be at least 6 characters";
  }

  if (password.length > 128) {
    return locale === "fa"
      ? "كلمة المرور يجب أن تكون أقل من 128 حرف"
      : "Password must be less than 128 characters";
  }

  return null;
}

/**
 * Validate complete login form
 * @param {Object} formData - Form data to validate
 * @param {string} formData.username - Username
 * @param {string} formData.password - Password
 * @param {string} locale - Locale for error messages ('fa' or 'en')
 * @returns {Object} Validation result with errors object
 */
export function validateLoginForm(formData, locale = "fa") {
  const errors = {};

  const usernameError = validateUsername(formData.username, locale);
  if (usernameError) {
    errors.username = usernameError;
  }

  const passwordError = validatePassword(formData.password, locale);
  if (passwordError) {
    errors.password = passwordError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize username input
 * @param {string} username - Username to sanitize
 * @returns {string} Sanitized username
 */
export function sanitizeUsername(username) {
  if (!username) return "";

  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_-]/g, ""); // Remove invalid characters
}

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {Object} Password strength analysis
 */
export function checkPasswordStrength(password) {
  if (!password) {
    return { strength: "none", score: 0, feedback: [] };
  }

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include uppercase letters");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include lowercase letters");
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include numbers");
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include special characters");
  }

  // Determine strength level
  let strength = "weak";
  if (score >= 4) {
    strength = "strong";
  } else if (score >= 3) {
    strength = "medium";
  }

  return {
    strength,
    score,
    feedback: feedback.slice(0, 2), // Limit feedback to 2 items
  };
}
