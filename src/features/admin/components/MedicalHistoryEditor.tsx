import { useState } from 'react';
import type { Patient, MedicalHistory } from '../../appointments/types';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for multi-line input
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface MedicalHistoryEditorProps {
    patient: Patient;
    onSave: (history: MedicalHistory) => void;
}

const DEFAULT_HISTORY: MedicalHistory = {
    allergies: '',
    conditions: '',
    surgeries: '',
    medications: '',
    familyHistory: '',
    bloodType: ''
};

export const MedicalHistoryEditor = ({ patient, onSave }: MedicalHistoryEditorProps) => {
    // Merge default with existing to ensure all fields exist even if DB has partial data
    const [history, setHistory] = useState<MedicalHistory>({
        ...DEFAULT_HISTORY,
        ...(patient.medicalHistory || {})
    });

    const handleChange = (field: keyof MedicalHistory, value: string) => {
        setHistory(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        onSave(history);
        toast.success("Historial médico actualizado");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Tipo de Sangre</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={history.bloodType || ''}
                            onChange={(e) => handleChange('bloodType', e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Alergias</Label>
                        <Textarea
                            placeholder="Ej. Penicilina, Polvo..."
                            value={history.allergies}
                            onChange={(e) => handleChange('allergies', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Padecimientos Crónicos</Label>
                        <Textarea
                            placeholder="Ej. Diabetes, Hipertensión..."
                            value={history.conditions}
                            onChange={(e) => handleChange('conditions', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Medicamentos Actuales</Label>
                        <Textarea
                            placeholder="Ej. Metformina 850mg..."
                            value={history.medications}
                            onChange={(e) => handleChange('medications', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cirugías Previas</Label>
                        <Textarea
                            placeholder="Ej. Apendicectomía 2010..."
                            value={history.surgeries}
                            onChange={(e) => handleChange('surgeries', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Antecedentes Hereditarios</Label>
                        <Textarea
                            placeholder="Ej. Padre diabético..."
                            value={history.familyHistory}
                            onChange={(e) => handleChange('familyHistory', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} className="bg-[#1c334a] text-white">
                    <Save className="w-4 h-4 mr-2" /> Guardar Historial
                </Button>
            </div>
        </div>
    );
};
