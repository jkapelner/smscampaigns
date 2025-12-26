import { describe, it, expect } from 'vitest';
import { parsePhoneNumber } from 'libphonenumber-js';
import { isValidEmail, isValidPassword, getPasswordErrors } from '../src/utils/validation.js';

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com',
        'a@b.co',
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'test@',
        'test @example.com',
        'test@example',
        '',
        'test@@example.com',
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'Password123',
        'Test1234',
        'MySecure1Pass',
        'Abcdef12',
        'P@ssw0rd',
      ];

      validPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(true);
        expect(getPasswordErrors(password)).toHaveLength(0);
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      const shortPassword = 'Test12';
      expect(isValidPassword(shortPassword)).toBe(false);
      const errors = getPasswordErrors(shortPassword);
      expect(errors.some((e) => e.includes('8 characters'))).toBe(true);
    });

    it('should reject passwords without uppercase letters', () => {
      const password = 'password123';
      expect(isValidPassword(password)).toBe(false);
      const errors = getPasswordErrors(password);
      expect(errors.some((e) => e.includes('uppercase'))).toBe(true);
    });

    it('should reject passwords without lowercase letters', () => {
      const password = 'PASSWORD123';
      expect(isValidPassword(password)).toBe(false);
      const errors = getPasswordErrors(password);
      expect(errors.some((e) => e.includes('lowercase'))).toBe(true);
    });

    it('should reject passwords without numbers', () => {
      const password = 'PasswordOnly';
      expect(isValidPassword(password)).toBe(false);
      const errors = getPasswordErrors(password);
      expect(errors.some((e) => e.includes('number'))).toBe(true);
    });

    it('should return multiple errors for passwords with multiple issues', () => {
      const password = 'short';
      const errors = getPasswordErrors(password);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors.some((e) => e.includes('8 characters'))).toBe(true);
      expect(errors.some((e) => e.includes('uppercase'))).toBe(true);
      expect(errors.some((e) => e.includes('number'))).toBe(true);
    });
  });

  describe('Phone Number Validation (libphonenumber-js)', () => {
    it('should validate US phone numbers', () => {
      const validUSNumbers = [
        '+14155552671',
        '+12025551234',
        '+13105551234',
      ];

      validUSNumbers.forEach((number) => {
        const parsed = parsePhoneNumber(number);
        expect(parsed).toBeDefined();
        expect(parsed?.isValid()).toBe(true);
        expect(parsed?.country).toBe('US');
      });
    });

    it('should validate UK phone numbers', () => {
      const validUKNumbers = [
        '+442071838750',
        '+441234567890',
      ];

      validUKNumbers.forEach((number) => {
        const parsed = parsePhoneNumber(number);
        expect(parsed).toBeDefined();
        expect(parsed?.isValid()).toBe(true);
        expect(parsed?.country).toBe('GB');
      });
    });

    it('should validate Australian phone numbers', () => {
      const validAUNumbers = [
        '+61291234567',
        '+61412345678',
      ];

      validAUNumbers.forEach((number) => {
        const parsed = parsePhoneNumber(number);
        expect(parsed).toBeDefined();
        expect(parsed?.isValid()).toBe(true);
        expect(parsed?.country).toBe('AU');
      });
    });

    it('should validate Japanese phone numbers', () => {
      const validJPNumbers = [
        '+81312345678',
        '+819012345678',
      ];

      validJPNumbers.forEach((number) => {
        const parsed = parsePhoneNumber(number);
        expect(parsed).toBeDefined();
        expect(parsed?.isValid()).toBe(true);
        expect(parsed?.country).toBe('JP');
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        'invalid',
        '12345',
        '+1',
        'abc123',
        '000000000',
        '+999999999999',
      ];

      invalidNumbers.forEach((number) => {
        try {
          const parsed = parsePhoneNumber(number);
          if (parsed) {
            expect(parsed.isValid()).toBe(false);
          }
        } catch (error) {
          // parsePhoneNumber throws for completely invalid formats
          expect(error).toBeDefined();
        }
      });
    });

    it('should reject phone numbers without country code', () => {
      const numbersWithoutCountryCode = [
        '4155552671',
        '2025551234',
      ];

      numbersWithoutCountryCode.forEach((number) => {
        try {
          const parsed = parsePhoneNumber(number);
          // Without default country, these should be invalid or undefined
          if (parsed) {
            expect(parsed.isValid()).toBe(false);
          } else {
            expect(parsed).toBeUndefined();
          }
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    it('should provide phone number formatting', () => {
      const number = '+14155552671';
      const parsed = parsePhoneNumber(number);

      expect(parsed).toBeDefined();
      expect(parsed?.formatInternational()).toBe('+1 415 555 2671');
      expect(parsed?.formatNational()).toBe('(415) 555-2671');
    });

    it('should identify mobile vs landline types when possible', () => {
      const mobileNumber = '+14155552671';
      const parsed = parsePhoneNumber(mobileNumber);

      expect(parsed).toBeDefined();
      expect(parsed?.getType()).toBeDefined();
      // Type can be 'MOBILE', 'FIXED_LINE', 'FIXED_LINE_OR_MOBILE', etc.
    });

    it('should handle phone numbers with spaces and dashes', () => {
      const formattedNumbers = [
        '+1 415 555 2671',
        '+1-415-555-2671',
        '+1 (415) 555-2671',
      ];

      formattedNumbers.forEach((number) => {
        const parsed = parsePhoneNumber(number);
        expect(parsed).toBeDefined();
        expect(parsed?.isValid()).toBe(true);
        expect(parsed?.number).toBe('+14155552671');
      });
    });

    it('should validate toll-free numbers', () => {
      const tollFreeNumbers = [
        '+18005551234', // US toll-free
        '+18885551234',
      ];

      tollFreeNumbers.forEach((number) => {
        const parsed = parsePhoneNumber(number);
        expect(parsed).toBeDefined();
        expect(parsed?.isValid()).toBe(true);
      });
    });

    it('should reject numbers that are too short', () => {
      const shortNumbers = [
        '+1415',
        '+44207',
      ];

      shortNumbers.forEach((number) => {
        try {
          const parsed = parsePhoneNumber(number);
          if (parsed) {
            expect(parsed.isValid()).toBe(false);
          }
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    it('should reject numbers that are too long', () => {
      const longNumbers = [
        '+141555526719999999',
        '+4420718387509999999',
      ];

      longNumbers.forEach((number) => {
        try {
          const parsed = parsePhoneNumber(number);
          if (parsed) {
            expect(parsed.isValid()).toBe(false);
          }
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });
});
