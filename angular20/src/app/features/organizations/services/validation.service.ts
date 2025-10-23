import { Injectable } from '@angular/core';

/**
 * Validation Service for Organizations Module
 * 
 * Evidence: Section 8.3 - Validation Rules (Lines 1592-1645)
 * 
 * Implements:
 * 1. SIRET validation (French company number) with LUHN checksum
 * 2. Client reference validation (minimum length)
 * 3. SIREN extraction from SIRET
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  /**
   * Validate SIRET number using LUHN algorithm
   * 
   * Evidence: customer.js:1264-1311 (Section 8.3.2)
   * 
   * Rules:
   * - Must be exactly 14 digits
   * - Must pass LUHN checksum validation
   * - Odd positions (0,2,4...): multiply by 2, subtract 9 if > 9
   * - Even positions: use as-is
   * - Sum must be divisible by 10
   * 
   * @param siret - SIRET string (14 digits)
   * @returns true if valid LUHN checksum, false otherwise
   */
  isValidSiret(siret: string | null | undefined): boolean {
    // Handle null/undefined
    if (!siret) {
      return false;
    }

    // Remove whitespace
    const cleanSiret = siret.replace(/\s/g, '');

    // Must be exactly 14 digits
    if (cleanSiret.length !== 14) {
      return false;
    }

    // Must be all numeric
    if (!/^\d{14}$/.test(cleanSiret)) {
      return false;
    }

    // LUHN algorithm
    let sum = 0;
    for (let i = 0; i < cleanSiret.length; i++) {
      let digit = parseInt(cleanSiret[i], 10);

      // Odd positions (0, 2, 4, 6, 8, 10, 12): multiply by 2
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
    }

    // Valid if sum is multiple of 10
    return sum % 10 === 0;
  }

  /**
   * Extract SIREN (9 digits) from SIRET (14 digits)
   * 
   * Evidence: customer.js:1307 (Section 8.3.2)
   * 
   * SIRET structure: SIREN (9 digits) + NIC (5 digits)
   * 
   * @param siret - SIRET string (14 digits)
   * @returns SIREN (first 9 digits) or empty string if invalid
   */
  extractSiren(siret: string | null | undefined): string {
    if (!siret) {
      return '';
    }

    const cleanSiret = siret.replace(/\s/g, '');

    // Must be at least 9 characters
    if (cleanSiret.length < 9) {
      return '';
    }

    // Extract first 9 digits
    return cleanSiret.substring(0, 9);
  }

  /**
   * Validate client reference (code client)
   * 
   * Evidence: customer.js:307-341 (Section 8.3.1)
   * 
   * Rules:
   * - Minimum length: 4 characters
   * - Case-insensitive comparison
   * 
   * Note: Uniqueness check is handled by API service
   * (checkClientRefUniqueness method)
   * 
   * @param ref - Client reference string
   * @returns true if valid length, false otherwise
   */
  isValidClientRef(ref: string | null | undefined): boolean {
    if (!ref) {
      return false;
    }

    // Minimum 4 characters
    return ref.trim().length >= 4;
  }

  /**
   * Format SIRET for display (add spaces every 3 digits)
   * 
   * Common French SIRET formatting convention
   * Example: 12345678901234 → 123 456 789 01234
   * 
   * @param siret - SIRET string (14 digits)
   * @returns Formatted SIRET or empty string
   */
  formatSiret(siret: string | null | undefined): string {
    if (!siret) {
      return '';
    }

    const cleanSiret = siret.replace(/\s/g, '');

    if (cleanSiret.length !== 14) {
      return siret;
    }

    // Format: XXX XXX XXX XXXXX
    return `${cleanSiret.substring(0, 3)} ${cleanSiret.substring(3, 6)} ${cleanSiret.substring(6, 9)} ${cleanSiret.substring(9, 14)}`;
  }

  /**
   * Validate SIRET and extract SIREN in one call
   * 
   * Evidence: customer.js:1264-1311 (Section 8.3.2)
   * 
   * Combines validation + extraction for efficiency
   * 
   * @param siret - SIRET string (14 digits)
   * @returns Object with validation result and SIREN, or null if invalid
   */
  validateAndExtractSiret(siret: string | null | undefined): { isValid: boolean; siren: string } | null {
    const isValid = this.isValidSiret(siret);
    
    if (!isValid) {
      return null;
    }

    const siren = this.extractSiren(siret);
    
    return {
      isValid,
      siren
    };
  }
}
