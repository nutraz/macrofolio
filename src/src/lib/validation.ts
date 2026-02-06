/**
 * Security: Input validation utilities
 * 
 * This module provides Zod schemas for validating user inputs
 * to prevent XSS, injection attacks, and data integrity issues.
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

/**
 * Asset validation schema
 */
export const AssetSchema = z.object({
  name: z.string()
    .min(1, "Asset name is required")
    .max(100, "Asset name too long (max 100 characters)")
    .refine(
      (val) => DOMPurify.sanitize(val) === val,
      "Asset name contains invalid characters"
    ),
  
  symbol: z.string()
    .min(1, "Symbol is required")
    .max(10, "Symbol too long (max 10 characters)")
    .regex(/^[A-Z0-9]+$/, "Symbol must be uppercase letters/numbers only"),
  
  quantity: z.number()
    .positive("Quantity must be positive")
    .max(1e15, "Quantity exceeds maximum allowed value")
    .refine(
      (val) => Number.isFinite(val),
      "Quantity must be a valid number"
    ),
  
  price: z.number()
    .nonnegative("Price cannot be negative")
    .max(1e12, "Price exceeds maximum allowed value")
    .refine(
      (val) => {
        // Check decimal precision (max 8 decimal places)
        const strVal = val.toString();
        const decimals = strVal.includes('.') ? strVal.split('.')[1].length : 0;
        return decimals <= 8;
      },
      "Maximum 8 decimal places for price"
    ),
  
  asset_type: z.enum(
    ['stock', 'crypto', 'gold', 'real_estate', 'nft', 'fixed_income'],
    {
      errorMap: () => ({ message: "Invalid asset type" }),
    }
  ),
});

/**
 * Transaction validation schema
 */
export const TransactionSchema = z.object({
  type: z.enum(['buy', 'sell', 'transfer'], {
    errorMap: () => ({ message: "Invalid transaction type" }),
  }),
  
  amount: z.number()
    .positive("Amount must be positive")
    .max(1e18, "Amount exceeds maximum allowed value"),
  
  asset_id: z.string().uuid("Invalid asset ID").optional().nullable(),
  
  tx_hash: z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash format")
    .optional()
    .nullable(),
});

/**
 * User profile validation schema
 */
export const UserProfileSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email too long"),
  
  wallet_address: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address format")
    .optional()
    .nullable(),
});

/**
 * Anchor verification schema
 */
export const AnchorVerificationSchema = z.object({
  data_hash: z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid data hash format"),
  
  chain_tx: z.string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash format")
    .optional(),
});

/**
 * Portfolio summary query schema
 */
export const PortfolioQuerySchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  
  start_date: z.string()
    .datetime("Invalid start date format")
    .optional(),
  
  end_date: z.string()
    .datetime("Invalid end date format")
    .optional(),
  
  asset_type: z.enum(
    ['stock', 'crypto', 'gold', 'real_estate', 'nft', 'fixed_income']
  ).optional(),
});

// =============================================================================
// TYPE INFERENCES
// =============================================================================

export type AssetInput = z.infer<typeof AssetSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type AnchorVerificationInput = z.infer<typeof AnchorVerificationSchema>;
export type PortfolioQueryInput = z.infer<typeof PortfolioQuerySchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate and sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

/**
 * Validate asset input
 */
export const validateAsset = (data: unknown): { success: true; data: AssetInput } | { success: false; errors: Record<string, string> } => {
  const result = AssetSchema.safeParse(data);
  
  if (result.success) {
    // Sanitize string fields
    const sanitized = {
      ...result.data,
      name: sanitizeString(result.data.name),
      symbol: sanitizeString(result.data.symbol).toUpperCase(),
    };
    return { success: true, data: sanitized };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
};

/**
 * Validate transaction input
 */
export const validateTransaction = (data: unknown): { success: true; data: TransactionInput } | { success: false; errors: Record<string, string> } => {
  const result = TransactionSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
};

/**
 * Validate anchor verification
 */
export const validateAnchor = (data: unknown): { success: true; data: AnchorVerificationInput } | { success: false; errors: Record<string, string> } => {
  const result = AnchorVerificationSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
};

/**
 * Validate portfolio query parameters
 */
export const validatePortfolioQuery = (data: unknown): { success: true; data: PortfolioQueryInput } | { success: false; errors: Record<string, string> } => {
  const result = PortfolioQuerySchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
};

// =============================================================================
// SANITIZATION HELPERS
// =============================================================================

/**
 * Sanitize all string values in an object
 */
export const sanitizeObjectStrings = <T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): T => {
  const sanitized = { ...obj };
  
  keys.forEach((key) => {
    if (typeof sanitized[key] === 'string') {
      (sanitized[key] as unknown) = sanitizeString(sanitized[key] as string);
    }
  });
  
  return sanitized;
};

/**
 * Validate numeric range
 */
export const validateNumericRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; message?: string } => {
  if (!Number.isFinite(value)) {
    return { valid: false, message: `${fieldName} must be a valid number` };
  }
  
  if (value < min) {
    return { valid: false, message: `${fieldName} must be at least ${min}` };
  }
  
  if (value > max) {
    return { valid: false, message: `${fieldName} must be at most ${max}` };
  }
  
  return { valid: true };
};

/**
 * Check if value is safe for JSON rendering (prevents XSS)
 */
export const isSafeForRender = (value: unknown): boolean => {
  if (typeof value === 'string') {
    const sanitized = DOMPurify.sanitize(value);
    return sanitized === value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return Number.isFinite(value) || typeof value === 'boolean';
  }
  
  if (value === null || value === undefined) {
    return true;
  }
  
  return false;
};

export default {
  AssetSchema,
  TransactionSchema,
  UserProfileSchema,
  AnchorVerificationSchema,
  PortfolioQuerySchema,
  validateAsset,
  validateTransaction,
  validateAnchor,
  validatePortfolioQuery,
  sanitizeString,
  sanitizeObjectStrings,
  validateNumericRange,
  isSafeForRender,
};

