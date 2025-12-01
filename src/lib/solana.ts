import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Solana RPC endpoint - using devnet for testing
const SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com';

/**
 * Get a connection to the Solana network
 */
export const getConnection = (): Connection => {
    return new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
};

/**
 * Validate if a string is a valid Solana address
 */
export const validateSolanaAddress = (address: string): boolean => {
    try {
        const pubkey = new PublicKey(address);
        return PublicKey.isOnCurve(pubkey.toBytes());
    } catch {
        return false;
    }
};

/**
 * Convert SOL to lamports
 */
export const solToLamports = (sol: number): number => {
    return Math.floor(sol * LAMPORTS_PER_SOL);
};

/**
 * Convert lamports to SOL
 */
export const lamportsToSol = (lamports: number): number => {
    return lamports / LAMPORTS_PER_SOL;
};

export interface Recipient {
    address: string;
    percentage: number;
}

/**
 * Build a transaction that splits payment among multiple recipients
 */
export const buildSplitTransaction = async (
    senderPublicKey: PublicKey,
    recipients: Recipient[],
    totalAmount: number
): Promise<Transaction> => {
    const connection = getConnection();
    const transaction = new Transaction();

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;

    // Calculate and add transfer instructions for each recipient
    for (const recipient of recipients) {
        const recipientPubkey = new PublicKey(recipient.address);
        const amount = Math.floor(totalAmount * (recipient.percentage / 100));

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: senderPublicKey,
            toPubkey: recipientPubkey,
            lamports: amount,
        });

        transaction.add(transferInstruction);
    }

    return transaction;
};

/**
 * Confirm a transaction on the blockchain
 */
export const confirmTransaction = async (signature: string): Promise<boolean> => {
    const connection = getConnection();

    try {
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');
        return !confirmation.value.err;
    } catch (error) {
        console.error('Transaction confirmation error:', error);
        return false;
    }
};

/**
 * Get the balance of a wallet in SOL
 */
export const getBalance = async (publicKey: PublicKey): Promise<number> => {
    const connection = getConnection();
    const balance = await connection.getBalance(publicKey);
    return lamportsToSol(balance);
};

/**
 * Get Solana Explorer URL for a transaction
 */
export const getExplorerUrl = (signature: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string => {
    return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};
