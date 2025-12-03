import { useState } from 'react';
import { useStorage } from '@/context/StorageContext';
import type { Recipient } from '@/lib/solana';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, FolderOpen } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface PresetManagerProps {
    currentRecipients: Recipient[];
    onLoad: (recipients: Recipient[]) => void;
}

export function PresetManager({ currentRecipients, onLoad }: PresetManagerProps) {
    const { presets, addPreset } = useStorage();
    const [presetName, setPresetName] = useState('');
    const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);

    const handleSavePreset = () => {
        if (!presetName.trim()) return;
        addPreset({
            name: presetName,
            recipients: currentRecipients
        });
        setPresetName('');
        setIsSavePresetOpen(false);
    };

    const handleLoadPreset = (presetId: string) => {
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            onLoad(preset.recipients);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Dialog open={isSavePresetOpen} onOpenChange={setIsSavePresetOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                        <Save className="h-3 w-3 mr-1" />
                        Save
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Preset</DialogTitle>
                        <DialogDescription>
                            Save current recipients configuration for later use.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Preset Name</Label>
                            <Input
                                id="name"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                placeholder="My Split"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSavePreset}>Save Preset</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {presets.length > 0 && (
                <Select onValueChange={handleLoadPreset}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                        <FolderOpen className="h-3 w-3 mr-2" />
                        <SelectValue placeholder="Load Preset" />
                    </SelectTrigger>
                    <SelectContent>
                        {presets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                                {preset.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
