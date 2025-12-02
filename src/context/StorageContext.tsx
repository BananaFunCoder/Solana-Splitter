import React, { createContext, useContext, useEffect, useState } from 'react';
import { Recipient } from '@/lib/solana';

export interface TransactionRecord {
    id: string;
    signature: string;
    timestamp: number;
    amount: number;
    recipients: Recipient[];
    status: 'success' | 'failed';
}

export interface Contact {
    id: string;
    name: string;
    address: string;
}

interface StorageContextType {
    history: TransactionRecord[];
    addToHistory: (record: Omit<TransactionRecord, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;
    contacts: Contact[];
    addContact: (contact: Omit<Contact, 'id'>) => void;
    removeContact: (id: string) => void;
    updateContact: (id: string, contact: Partial<Contact>) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const [history, setHistory] = useState<TransactionRecord[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('solana-splitter-history');
        const savedContacts = localStorage.getItem('solana-splitter-contacts');

        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }

        if (savedContacts) {
            try {
                setContacts(JSON.parse(savedContacts));
            } catch (e) {
                console.error('Failed to parse contacts', e);
            }
        }
    }, []);

    // Save to local storage whenever state changes
    useEffect(() => {
        localStorage.setItem('solana-splitter-history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('solana-splitter-contacts', JSON.stringify(contacts));
    }, [contacts]);

    const addToHistory = (record: Omit<TransactionRecord, 'id' | 'timestamp'>) => {
        const newRecord: TransactionRecord = {
            ...record,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        setHistory(prev => [newRecord, ...prev]);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const addContact = (contact: Omit<Contact, 'id'>) => {
        const newContact: Contact = {
            ...contact,
            id: crypto.randomUUID(),
        };
        setContacts(prev => [...prev, newContact]);
    };

    const removeContact = (id: string) => {
        setContacts(prev => prev.filter(c => c.id !== id));
    };

    const updateContact = (id: string, updates: Partial<Contact>) => {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    return (
        <StorageContext.Provider value={{
            history,
            addToHistory,
            clearHistory,
            contacts,
            addContact,
            removeContact,
            updateContact
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
}
