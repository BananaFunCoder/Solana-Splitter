import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { parseRecipientsCSV } from '@/lib/csvUtils';
import type { Recipient } from '@/lib/solana';

interface CSVImporterProps {
    onImport: (recipients: Recipient[]) => void;
    onError: (message: string) => void;
}

export function CSVImporter({ onImport, onError }: CSVImporterProps) {
    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { recipients: newRecipients, errors } = await parseRecipientsCSV(file);

            if (errors.length > 0) {
                onError(`CSV Error: ${errors[0]}`);
                return;
            }

            if (newRecipients.length < 2 || newRecipients.length > 5) {
                onError('CSV must contain between 2 and 5 recipients');
                return;
            }

            // Validate total percentage
            const total = newRecipients.reduce((sum, r) => sum + r.percentage, 0);
            if (Math.abs(total - 100) > 0.1) {
                onError(`Total percentage in CSV is ${total}%, must be 100%`);
                return;
            }

            onImport(newRecipients);
        } catch (err) {
            onError('Failed to parse CSV file');
        } finally {
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Import CSV"
            />
            <Button variant="outline" size="sm" className="text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Import
            </Button>
        </div>
    );
}
