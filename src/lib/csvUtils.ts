import type { Recipient } from './solana';
import { validateSolanaAddress } from './solana';

export interface ParseResult {
    recipients: Recipient[];
    errors: string[];
}

export async function parseRecipientsCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) {
                resolve({ recipients: [], errors: ['Empty file'] });
                return;
            }

            const lines = text.split(/\r?\n/).filter(line => line.trim());
            const recipients: Recipient[] = [];
            const errors: string[] = [];

            lines.forEach((line, index) => {
                // Skip header if it exists (simple check: if first column is "address" or similar)
                if (index === 0 && line.toLowerCase().includes('address')) return;

                const parts = line.split(',');
                if (parts.length < 2) {
                    errors.push(`Line ${index + 1}: Invalid format. Expected "address, percentage"`);
                    return;
                }

                const address = parts[0].trim();
                const valueStr = parts[1].trim();
                const value = parseFloat(valueStr);

                if (!validateSolanaAddress(address)) {
                    errors.push(`Line ${index + 1}: Invalid Solana address "${address}"`);
                    return;
                }

                if (isNaN(value) || value < 0) {
                    errors.push(`Line ${index + 1}: Invalid percentage/amount "${valueStr}"`);
                    return;
                }

                recipients.push({ address, percentage: value });
            });

            // Normalize percentages if they don't sum to 100 (assuming they might be raw amounts or just off)
            // For now, we'll assume they are percentages. If the user wants amount-based, we'd need more logic.
            // Let's strictly treat them as percentages for this iteration as per plan, but we can be smart.

            resolve({ recipients, errors });
        };
        reader.onerror = () => resolve({ recipients: [], errors: ['Failed to read file'] });
        reader.readAsText(file);
    });
}
