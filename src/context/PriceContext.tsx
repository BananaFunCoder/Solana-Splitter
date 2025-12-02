import React, { createContext, useContext, useEffect, useState } from 'react';

interface PriceContextType {
    price: number | null;
    loading: boolean;
    error: string | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export function PriceProvider({ children }: { children: React.ReactNode }) {
    const [price, setPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                if (!response.ok) {
                    throw new Error('Failed to fetch price');
                }
                const data = await response.json();
                setPrice(data.solana.usd);
                setError(null);
            } catch (err) {
                console.error('Error fetching SOL price:', err);
                setError('Failed to load price');
            } finally {
                setLoading(false);
            }
        };

        fetchPrice();
        // Refresh every minute
        const interval = setInterval(fetchPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <PriceContext.Provider value={{ price, loading, error }}>
            {children}
        </PriceContext.Provider>
    );
}

export function usePrice() {
    const context = useContext(PriceContext);
    if (context === undefined) {
        throw new Error('usePrice must be used within a PriceProvider');
    }
    return context;
}
