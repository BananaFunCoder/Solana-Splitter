import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { PaymentSplitter } from './components/PaymentSplitter';
import { TransactionHistory } from './components/History';
import { AddressBook } from './components/AddressBook';
import { StorageProvider } from './context/StorageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import './index.css';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com';

export function App() {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <StorageProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
              </div>

              <div className="container mx-auto px-4 py-12 relative z-10">
                <Tabs defaultValue="splitter" className="w-full max-w-4xl mx-auto">
                  <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-3 bg-card/50 backdrop-blur-sm border border-border">
                      <TabsTrigger value="splitter">Splitter</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                      <TabsTrigger value="contacts">Contacts</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="splitter">
                    <PaymentSplitter />
                  </TabsContent>

                  <TabsContent value="history">
                    <TransactionHistory />
                  </TabsContent>

                  <TabsContent value="contacts">
                    <AddressBook />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </StorageProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
