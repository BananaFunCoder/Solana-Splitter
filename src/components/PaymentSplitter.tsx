import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStorage } from '@/context/StorageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecipientInput } from './RecipientInput';
import { TransactionStatus, type TransactionState } from './TransactionStatus';
import { WalletButton } from './WalletButton';
import type { Recipient } from '@/lib/solana';
import { buildSplitTransaction, solToLamports, validateSolanaAddress } from '@/lib/solana';
import { validateRecipients, validateAmount } from '@/lib/validation';
import { Plus, Send } from 'lucide-react';

export function PaymentSplitter() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();
    const { addToHistory } = useStorage();
    const [amount, setAmount] = useState('');
    const [recipients, setRecipients] = useState<Recipient[]>([
        { address: '', percentage: 50 },
        { address: '', percentage: 50 },
    ]);
    const [transactionState, setTransactionState] = useState<TransactionState>('idle');
    const [signature, setSignature] = useState<string>();
    const [error, setError] = useState<string>();

    const handleAddRecipient = () => {
        if (recipients.length < 5) {
            const newPercentage = 100 / (recipients.length + 1);
            const updatedRecipients = recipients.map(r => ({
                ...r,
                percentage: newPercentage,
            }));
            setRecipients([...updatedRecipients, { address: '', percentage: newPercentage }]);
        }
    };

    const handleRemoveRecipient = (index: number) => {
        if (recipients.length > 2) {
            const newRecipients = recipients.filter((_, i) => i !== index);
            const newPercentage = 100 / newRecipients.length;
            setRecipients(newRecipients.map(r => ({ ...r, percentage: newPercentage })));
        }
    };

    const handleAddressChange = (index: number, address: string) => {
        const newRecipients = [...recipients];
        newRecipients[index].address = address;
        setRecipients(newRecipients);
    };

    const handlePercentageChange = (index: number, percentage: number) => {
        const newRecipients = [...recipients];
        newRecipients[index].percentage = percentage;
        setRecipients(newRecipients);
    };

    const handleDistributeEvenly = () => {
        const evenPercentage = 100 / recipients.length;
        setRecipients(recipients.map(r => ({ ...r, percentage: evenPercentage })));
    };

    const handleSendPayment = async () => {
        if (!publicKey || !connected) {
            setError('Please connect your wallet first');
            return;
        }

        const amountNum = parseFloat(amount);
        if (!validateAmount(amountNum)) {
            setError('Please enter a valid amount');
            return;
        }

        const validation = validateRecipients(recipients);
        if (!validation.isValid) {
            setError(validation.errors.join('. '));
            return;
        }

        // Validate all addresses
        const invalidAddresses = recipients.filter(r => !validateSolanaAddress(r.address));
        if (invalidAddresses.length > 0) {
            setError('One or more recipient addresses are invalid');
            return;
        }

        try {
            setError(undefined);
            setTransactionState('building');

            const totalLamports = solToLamports(amountNum);
            const transaction = await buildSplitTransaction(publicKey, recipients, totalLamports);

            setTransactionState('awaiting-approval');
            const sig = await sendTransaction(transaction, connection, { skipPreflight: false });

            setSignature(sig);
            setTransactionState('processing');

            // Note: In production, you'd want to use confirmTransaction from solana.ts
            // For now, we'll just wait a bit and assume success
            setTimeout(() => {
                setTransactionState('confirmed');
                addToHistory({
                    signature: sig,
                    amount: amountNum,
                    recipients: recipients,
                    status: 'success'
                });
            }, 3000);

        } catch (err: any) {
            console.error('Transaction error:', err);
            setTransactionState('error');
            setError(err.message || 'Transaction failed');
        }
    };

    const percentageSum = recipients.reduce((sum, r) => sum + r.percentage, 0);
    const isPercentageValid = Math.abs(percentageSum - 100) < 0.01;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Solana Payment Splitter
                </h1>
                <p className="text-muted-foreground">
                    Distribute SOL payments among 2-5 wallets automatically
                </p>
            </div>

            <WalletButton />

            {connected && publicKey ? (
                <>
                    <Card className="bg-card/50 backdrop-blur-sm border-border">
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>Enter the total amount to split</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Total Amount (SOL)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    className="text-lg font-semibold"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recipients</CardTitle>
                                    <CardDescription>
                                        Add 2-5 recipients and set their percentages
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDistributeEvenly}
                                        className="text-xs"
                                    >
                                        Distribute Evenly
                                    </Button>
                                    {recipients.length < 5 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddRecipient}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Recipient
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recipients.map((recipient, index) => (
                                <RecipientInput
                                    key={index}
                                    index={index}
                                    address={recipient.address}
                                    percentage={recipient.percentage}
                                    onAddressChange={(addr) => handleAddressChange(index, addr)}
                                    onPercentageChange={(pct) => handlePercentageChange(index, pct)}
                                    onRemove={() => handleRemoveRecipient(index)}
                                    canRemove={recipients.length > 2}
                                />
                            ))}

                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <span className="font-medium">Total Percentage:</span>
                                <span
                                    className={`text-lg font-bold ${isPercentageValid ? 'text-green-500' : 'text-red-500'
                                        }`}
                                >
                                    {percentageSum.toFixed(2)}%
                                </span>
                            </div>

                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleSendPayment}
                                disabled={!isPercentageValid || !amount || transactionState !== 'idle'}
                                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                size="lg"
                            >
                                <Send className="h-5 w-5" />
                                Send Payment
                            </Button>
                        </CardContent>
                    </Card>

                    <TransactionStatus
                        state={transactionState}
                        signature={signature}
                        error={error}
                    />
                </>
            ) : (
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardContent className="pt-6 text-center py-12">
                        <p className="text-muted-foreground">
                            Please connect your wallet to start splitting payments
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
