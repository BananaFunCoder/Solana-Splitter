import { useStorage } from '@/context/StorageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getExplorerUrl } from '@/lib/solana';
import { ExternalLink, Trash2, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { truncateAddress } from '@/lib/validation';

export function TransactionHistory() {
    const { history, clearHistory } = useStorage();

    if (history.length === 0) {
        return (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No History Yet</h3>
                    <p className="text-muted-foreground">
                        Your transaction history will appear here once you make a payment.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const handleExportCSV = () => {
        if (history.length === 0) return;

        const headers = ['Date', 'Status', 'Amount (SOL)', 'Signature', 'Recipients'];
        const rows = history.map(record => [
            new Date(record.timestamp).toLocaleString(),
            record.status,
            record.amount,
            record.signature,
            record.recipients.map(r => `${r.address} (${r.percentage}%)`).join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `solana_splitter_history_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Transaction History</h2>
                <Button variant="destructive" size="sm" onClick={clearHistory} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear History
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-4">
                {history.map((record) => (
                    <Card key={record.id} className="bg-card/50 backdrop-blur-sm border-border overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {record.status === 'success' ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <div>
                                        <p className="font-semibold">
                                            {record.status === 'success' ? 'Payment Sent' : 'Failed Transaction'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(record.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">{record.amount} SOL</p>
                                    <a
                                        href={getExplorerUrl(record.signature)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center justify-end gap-1"
                                    >
                                        View on Explorer
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recipients</p>
                                {record.recipients.map((recipient, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="font-mono text-muted-foreground">
                                            {truncateAddress(recipient.address)}
                                        </span>
                                        <div className="flex items-center gap-4">
                                            <span className="text-muted-foreground">
                                                {recipient.percentage.toFixed(1)}%
                                            </span>
                                            <span className="font-medium">
                                                {(record.amount * (recipient.percentage / 100)).toFixed(4)} SOL
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
