import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getExplorerUrl } from '@/lib/solana';

export type TransactionState =
    | 'idle'
    | 'building'
    | 'awaiting-approval'
    | 'processing'
    | 'confirmed'
    | 'error';

interface TransactionStatusProps {
    state: TransactionState;
    signature?: string;
    error?: string;
}

export function TransactionStatus({ state, signature, error }: TransactionStatusProps) {
    if (state === 'idle') return null;

    const getStatusContent = () => {
        switch (state) {
            case 'building':
                return {
                    icon: <Loader2 className="h-8 w-8 animate-spin text-blue-500" />,
                    title: 'Building Transaction',
                    description: 'Preparing your payment split...',
                    color: 'border-blue-500/50',
                };
            case 'awaiting-approval':
                return {
                    icon: <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />,
                    title: 'Awaiting Approval',
                    description: 'Please approve the transaction in your wallet',
                    color: 'border-yellow-500/50',
                };
            case 'processing':
                return {
                    icon: <Loader2 className="h-8 w-8 animate-spin text-purple-500" />,
                    title: 'Processing',
                    description: 'Transaction is being confirmed on the blockchain...',
                    color: 'border-purple-500/50',
                };
            case 'confirmed':
                return {
                    icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
                    title: 'Transaction Confirmed!',
                    description: 'Your payment has been successfully split and sent',
                    color: 'border-green-500/50',
                };
            case 'error':
                return {
                    icon: <XCircle className="h-8 w-8 text-red-500" />,
                    title: 'Transaction Failed',
                    description: error || 'An error occurred while processing your transaction',
                    color: 'border-red-500/50',
                };
            default:
                return null;
        }
    };

    const content = getStatusContent();
    if (!content) return null;

    return (
        <Card className={`border-2 ${content.color} bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    {content.icon}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">{content.title}</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            {content.description}
                        </p>
                    </div>

                    {signature && state === 'confirmed' && (
                        <a
                            href={getExplorerUrl(signature)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                        >
                            View on Solana Explorer
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
