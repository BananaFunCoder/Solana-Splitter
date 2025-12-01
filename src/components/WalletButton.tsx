import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { getBalance } from '@/lib/solana';
import { truncateAddress } from '@/lib/validation';
import { Wallet } from 'lucide-react';

export function WalletButton() {
    const { publicKey, connected } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey && connected) {
            getBalance(publicKey).then(setBalance);
        } else {
            setBalance(null);
        }
    }, [publicKey, connected]);

    return (
        <div className="flex flex-col items-center gap-3">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !rounded-lg !px-6 !py-3 !font-semibold !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />

            {connected && publicKey && (
                <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono text-muted-foreground">
                            {truncateAddress(publicKey.toBase58(), 6)}
                        </span>
                    </div>
                    {balance !== null && (
                        <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary/10">
                            <span className="text-sm font-bold text-primary">
                                {balance.toFixed(4)} SOL
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
