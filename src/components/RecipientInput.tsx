import { useState, useEffect, memo } from 'react';
import { useStorage } from '@/context/StorageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { validateSolanaAddress } from '@/lib/solana';
import { X, BookUser } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const AddressBookSelect = memo(function AddressBookSelect({ onSelect }: { onSelect: (address: string) => void }) {
    const { contacts } = useStorage();

    if (contacts.length === 0) return null;

    return (
        <Select onValueChange={onSelect}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Address Book" />
            </SelectTrigger>
            <SelectContent>
                {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.address}>
                        {contact.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
});


interface RecipientInputProps {
    index: number;
    address: string;
    percentage: number;
    onAddressChange: (address: string) => void;
    onPercentageChange: (percentage: number) => void;
    onRemove?: () => void;
    canRemove: boolean;
}

export const RecipientInput = memo(function RecipientInput({
    index,
    address,
    percentage,
    onAddressChange,
    onPercentageChange,
    onRemove,
    canRemove,
}: RecipientInputProps) {
    const [isValidAddress, setIsValidAddress] = useState(true);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (address && touched) {
            setIsValidAddress(validateSolanaAddress(address));
        }
    }, [address, touched]);

    const handleAddressBlur = () => {
        setTouched(true);
        if (address) {
            setIsValidAddress(validateSolanaAddress(address));
        }
    };

    return (
        <div className="relative p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`address-${index}`} className="text-sm font-medium">
                                Recipient {index + 1} Address
                            </Label>
                            <AddressBookSelect onSelect={onAddressChange} />
                        </div>
                        <Input
                            id={`address-${index}`}
                            type="text"
                            placeholder="Enter Solana wallet address"
                            value={address}
                            onChange={(e) => onAddressChange(e.target.value)}
                            onBlur={handleAddressBlur}
                            className={`font-mono text-sm ${touched && !isValidAddress && address
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : ''
                                }`}
                        />
                        {touched && !isValidAddress && address && (
                            <p className="text-xs text-red-500">Invalid Solana address</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={`percentage-${index}`} className="text-sm font-medium">
                                Percentage
                            </Label>
                            <span className="text-sm font-semibold text-primary">
                                {percentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id={`percentage-${index}`}
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={percentage}
                                onChange={(e) => onPercentageChange(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={percentage}
                                onChange={(e) => onPercentageChange(parseFloat(e.target.value) || 0)}
                                className="w-20 text-center"
                            />
                        </div>
                    </div>
                </div>

                {canRemove && onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                        className="mt-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
});
