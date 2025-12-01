import type { Recipient } from './solana';

/**
 * Validate that percentages sum to exactly 100%
 */
export const validatePercentageSum = (recipients: Recipient[]): boolean => {
    const sum = recipients.reduce((acc, r) => acc + r.percentage, 0);
    // Allow for small floating point errors
    return Math.abs(sum - 100) < 0.01;
};

/**
 * Validate recipient count (2-5)
 */
export const validateRecipientCount = (count: number): boolean => {
    return count >= 2 && count <= 5;
};

/**
 * Validate that an amount is positive
 */
export const validateAmount = (amount: number): boolean => {
    return amount > 0 && !isNaN(amount) && isFinite(amount);
};

/**
 * Check for duplicate addresses in recipients
 */
export const hasDuplicateAddresses = (recipients: Recipient[]): boolean => {
    const addresses = recipients.map(r => r.address.toLowerCase());
    return new Set(addresses).size !== addresses.length;
};

/**
 * Validate all recipients
 */
export const validateRecipients = (recipients: Recipient[]): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    // Check recipient count
    if (!validateRecipientCount(recipients.length)) {
        errors.push('You must have between 2 and 5 recipients');
    }

    // Check for empty addresses
    if (recipients.some(r => !r.address || r.address.trim() === '')) {
        errors.push('All recipient addresses must be filled');
    }

    // Check for duplicate addresses
    if (hasDuplicateAddresses(recipients)) {
        errors.push('Duplicate recipient addresses are not allowed');
    }

    // Check percentage sum
    if (!validatePercentageSum(recipients)) {
        const sum = recipients.reduce((acc, r) => acc + r.percentage, 0);
        errors.push(`Percentages must sum to 100% (currently ${sum.toFixed(2)}%)`);
    }

    // Check individual percentages
    if (recipients.some(r => r.percentage <= 0 || r.percentage > 100)) {
        errors.push('Each percentage must be between 0 and 100');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

/**
 * Truncate Solana address for display
 */
export const truncateAddress = (address: string, chars: number = 4): string => {
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
