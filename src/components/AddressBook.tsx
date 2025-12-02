import { useState } from 'react';
import { useStorage, Contact } from '@/context/StorageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateSolanaAddress } from '@/lib/solana';
import { truncateAddress } from '@/lib/validation';
import { Plus, Trash2, User, Wallet, Pencil, Save, X } from 'lucide-react';

export function AddressBook() {
    const { contacts, addContact, removeContact, updateContact } = useStorage();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    const resetForm = () => {
        setName('');
        setAddress('');
        setError('');
        setIsAdding(false);
        setEditingId(null);
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        if (!validateSolanaAddress(address)) {
            setError('Invalid Solana address');
            return;
        }

        if (editingId) {
            updateContact(editingId, { name, address });
        } else {
            addContact({ name, address });
        }
        resetForm();
    };

    const startEdit = (contact: Contact) => {
        setName(contact.name);
        setAddress(contact.address);
        setEditingId(contact.id);
        setIsAdding(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Address Book</h2>
                    <p className="text-muted-foreground">Manage your saved recipients</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Contact
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Contact' : 'New Contact'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Alice"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Wallet Address</Label>
                            <Input
                                id="address"
                                placeholder="Solana address..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                            <Button onClick={handleSubmit} className="gap-2">
                                <Save className="h-4 w-4" />
                                Save Contact
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => (
                    <Card key={contact.id} className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{contact.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
                                            <Wallet className="h-3 w-3" />
                                            {truncateAddress(contact.address)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(contact)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => removeContact(contact.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {contacts.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No contacts saved yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
