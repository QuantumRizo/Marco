import { useState } from 'react';
import type { SoapNote } from '../../appointments/types';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface SoapNoteEditorProps {
    initialData?: SoapNote;
    onSave: (data: SoapNote) => void;
}

const DEFAULT_SOAP: SoapNote = {
    subjective: '',
    objective: '',
    analysis: '',
    plan: ''
};

export const SoapNoteEditor = ({ initialData, onSave }: SoapNoteEditorProps) => {
    const [note, setNote] = useState<SoapNote>(initialData || DEFAULT_SOAP);

    const handleChange = (field: keyof SoapNote, value: string) => {
        setNote(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        onSave(note);
        toast.success("Nota Clínica Guardada");
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-blue-800 font-bold">S - Subjetivo (Síntomas)</Label>
                    <Textarea
                        className="min-h-[120px] bg-blue-50/30 border-blue-100 focus-visible:ring-blue-200"
                        placeholder="Lo que el paciente nos dice..."
                        value={note.subjective}
                        onChange={(e) => handleChange('subjective', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-red-800 font-bold">O - Objetivo (Signos)</Label>
                    <Textarea
                        className="min-h-[120px] bg-red-50/30 border-red-100 focus-visible:ring-red-200"
                        placeholder="Signos vitales, exploración física..."
                        value={note.objective}
                        onChange={(e) => handleChange('objective', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-yellow-800 font-bold">A - Análisis (Diagnóstico)</Label>
                    <Textarea
                        className="min-h-[120px] bg-yellow-50/30 border-yellow-100 focus-visible:ring-yellow-200"
                        placeholder="Impresión diagnóstica..."
                        value={note.analysis}
                        onChange={(e) => handleChange('analysis', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-green-800 font-bold">P - Plan (Tratamiento)</Label>
                    <Textarea
                        className="min-h-[120px] bg-green-50/30 border-green-100 focus-visible:ring-green-200"
                        placeholder="Medicamentos, estudios, indicaciones..."
                        value={note.plan}
                        onChange={(e) => handleChange('plan', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} className="bg-[#1c334a] text-white">
                    <Save className="w-4 h-4 mr-2" /> Guardar Nota SOAP
                </Button>
            </div>
        </div>
    );
};
