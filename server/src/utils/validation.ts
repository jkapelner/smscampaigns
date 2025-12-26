import {parsePhoneNumberWithError} from "libphonenumber-js";

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber;
}

export function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
}

export function validatePhoneNumber(phoneNumber: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const parsedNumber = parsePhoneNumberWithError(phoneNumber, 'US');

    if (!parsedNumber.isValid()) {
      return { valid: false, error: 'Invalid phone number' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Invalid phone number: ${error.toString()}` };
  }
}
