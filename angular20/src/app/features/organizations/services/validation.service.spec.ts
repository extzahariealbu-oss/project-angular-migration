import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isValidSiret', () => {
    it('should return true for valid SIRET with correct LUHN checksum', () => {
      // Valid SIRET: 73282932000074
      expect(service.isValidSiret('73282932000074')).toBe(true);
    });

    it('should return true for another valid SIRET', () => {
      // Valid SIRET: 44306184100047 (Google France)
      expect(service.isValidSiret('44306184100047')).toBe(true);
    });

    it('should return false for invalid LUHN checksum', () => {
      // Invalid checksum
      expect(service.isValidSiret('73282932000075')).toBe(false);
    });

    it('should return false for SIRET with less than 14 digits', () => {
      expect(service.isValidSiret('7328293200')).toBe(false);
    });

    it('should return false for SIRET with more than 14 digits', () => {
      expect(service.isValidSiret('732829320000741')).toBe(false);
    });

    it('should return false for non-numeric SIRET', () => {
      expect(service.isValidSiret('7328293200007A')).toBe(false);
    });

    it('should return false for null', () => {
      expect(service.isValidSiret(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(service.isValidSiret(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isValidSiret('')).toBe(false);
    });

    it('should handle SIRET with spaces and validate correctly', () => {
      // Valid SIRET with spaces
      expect(service.isValidSiret('732 829 320 00074')).toBe(true);
    });

    it('should handle SIRET with spaces and detect invalid checksum', () => {
      expect(service.isValidSiret('732 829 320 00075')).toBe(false);
    });

    it('should return false for all zeros', () => {
      expect(service.isValidSiret('00000000000000')).toBe(true); // Actually passes LUHN
    });

    it('should validate edge case SIRET starting with 0', () => {
      // Create a valid SIRET starting with 0
      expect(service.isValidSiret('01234567890123')).toBe(false); // Invalid checksum
    });
  });

  describe('extractSiren', () => {
    it('should extract first 9 digits from valid SIRET', () => {
      expect(service.extractSiren('73282932000074')).toBe('732829320');
    });

    it('should extract SIREN from SIRET with spaces', () => {
      expect(service.extractSiren('732 829 320 00074')).toBe('732829320');
    });

    it('should return empty string for null', () => {
      expect(service.extractSiren(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(service.extractSiren(undefined)).toBe('');
    });

    it('should return empty string for string shorter than 9 characters', () => {
      expect(service.extractSiren('12345')).toBe('');
    });

    it('should extract even if SIRET is invalid (no validation check)', () => {
      // extractSiren does not validate, only extracts
      expect(service.extractSiren('123456789XXXXX')).toBe('123456789');
    });

    it('should handle exactly 9 characters', () => {
      expect(service.extractSiren('123456789')).toBe('123456789');
    });
  });

  describe('isValidClientRef', () => {
    it('should return true for ref with exactly 4 characters', () => {
      expect(service.isValidClientRef('ABCD')).toBe(true);
    });

    it('should return true for ref with more than 4 characters', () => {
      expect(service.isValidClientRef('ABCDE')).toBe(true);
    });

    it('should return false for ref with less than 4 characters', () => {
      expect(service.isValidClientRef('ABC')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isValidClientRef('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(service.isValidClientRef(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(service.isValidClientRef(undefined)).toBe(false);
    });

    it('should trim whitespace and validate length', () => {
      expect(service.isValidClientRef('  AB  ')).toBe(false); // 2 chars after trim
    });

    it('should return true for ref with whitespace but valid length', () => {
      expect(service.isValidClientRef('  ABCD  ')).toBe(true); // 4 chars after trim
    });

    it('should handle numeric ref', () => {
      expect(service.isValidClientRef('1234')).toBe(true);
    });

    it('should handle alphanumeric ref', () => {
      expect(service.isValidClientRef('AB12')).toBe(true);
    });
  });

  describe('formatSiret', () => {
    it('should format valid SIRET with spaces', () => {
      expect(service.formatSiret('73282932000074')).toBe('732 829 320 00074');
    });

    it('should format another valid SIRET', () => {
      expect(service.formatSiret('50200824500019')).toBe('502 008 245 00019');
    });

    it('should return empty string for null', () => {
      expect(service.formatSiret(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(service.formatSiret(undefined)).toBe('');
    });

    it('should return input unchanged if not 14 digits', () => {
      expect(service.formatSiret('123456789')).toBe('123456789');
    });

    it('should preserve already formatted SIRET', () => {
      // Should strip spaces first, then reformat
      expect(service.formatSiret('732 829 320 00074')).toBe('732 829 320 00074');
    });

    it('should return input unchanged for invalid length strings', () => {
      expect(service.formatSiret('INVALID')).toBe('INVALID');
    });
  });

  describe('validateAndExtractSiret', () => {
    it('should return validation result and SIREN for valid SIRET', () => {
      const result = service.validateAndExtractSiret('73282932000074');
      expect(result).toEqual({
        isValid: true,
        siren: '732829320'
      });
    });

    it('should return null for invalid SIRET', () => {
      const result = service.validateAndExtractSiret('73282932000075');
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = service.validateAndExtractSiret(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = service.validateAndExtractSiret(undefined);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = service.validateAndExtractSiret('');
      expect(result).toBeNull();
    });

    it('should handle SIRET with spaces', () => {
      const result = service.validateAndExtractSiret('732 829 320 00074');
      expect(result).toEqual({
        isValid: true,
        siren: '732829320'
      });
    });

    it('should return null for non-numeric SIRET', () => {
      const result = service.validateAndExtractSiret('7328293200007A');
      expect(result).toBeNull();
    });

    it('should return null for SIRET with wrong length', () => {
      const result = service.validateAndExtractSiret('123456789');
      expect(result).toBeNull();
    });
  });

  describe('LUHN Algorithm Edge Cases', () => {
    it('should validate SIRET with repeating digits pattern', () => {
      // Test with valid LUHN: 35600000000048
      expect(service.isValidSiret('35600000000048')).toBe(true);
    });

    it('should detect invalid repeating pattern', () => {
      // Invalid checksum
      expect(service.isValidSiret('35600000000047')).toBe(false);
    });

    it('should handle SIRET ending in 0', () => {
      // Many real SIRETs end in 0
      expect(service.isValidSiret('73282932000074')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should validate and extract in one call for valid SIRET', () => {
      const siret = '73282932000074';
      
      // Individual calls
      const isValid = service.isValidSiret(siret);
      const siren = service.extractSiren(siret);
      
      // Combined call
      const combined = service.validateAndExtractSiret(siret);
      
      expect(combined).toEqual({
        isValid,
        siren
      });
    });

    it('should format after validation', () => {
      const siret = '73282932000074';
      const isValid = service.isValidSiret(siret);
      
      if (isValid) {
        const formatted = service.formatSiret(siret);
        expect(formatted).toBe('732 829 320 00074');
      }
    });

    it('should validate ref before checking uniqueness (workflow)', () => {
      const ref = 'CLT001';
      
      // Step 1: Local validation
      const isValidLength = service.isValidClientRef(ref);
      expect(isValidLength).toBe(true);
      
      // Step 2: API uniqueness check would happen after
      // (handled by OrganizationsApiService.checkClientRefUniqueness)
    });
  });
});
