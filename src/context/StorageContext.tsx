import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Recipient } from '@/lib/solana';

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

export interface Preset {
    id: string;
    name: string;
    recipients: Recipient[];
}

interface StorageContextType {
    history: TransactionRecord[];
    addToHistory: (record: Omit<TransactionRecord, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;
    contacts: Contact[];
    addContact: (contact: Omit<Contact, 'id'>) => void;
    removeContact: (id: string) => void;
    updateContact: (id: string, contact: Partial<Contact>) => void;
    presets: Preset[];
    addPreset: (preset: Omit<Preset, 'id'>) => void;
    removePreset: (id: string) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const [history, setHistory] = useState<TransactionRecord[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [presets, setPresets] = useState<Preset[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('solana-splitter-history');
        const savedContacts = localStorage.getItem('solana-splitter-contacts');
        const savedPresets = localStorage.getItem('solana-splitter-presets');

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

        if (savedPresets) {
            try {
                setPresets(JSON.parse(savedPresets));
            } catch (e) {
                console.error('Failed to parse presets', e);
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

    useEffect(() => {
        localStorage.setItem('solana-splitter-presets', JSON.stringify(presets));
    }, [presets]);

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

    const addPreset = (preset: Omit<Preset, 'id'>) => {
        const newPreset: Preset = {
            ...preset,
            id: crypto.randomUUID(),
        };
        setPresets(prev => [...prev, newPreset]);
    };

    const removePreset = (id: string) => {
        setPresets(prev => prev.filter(p => p.id !== id));
    };

    return (
        <StorageContext.Provider value={{
            history,
            addToHistory,
            clearHistory,
            contacts,
            addContact,
            removeContact,
            updateContact,
            presets,
            addPreset,
            removePreset
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
