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
        ...(patient.medicalHistory || {}),
        address: { // Ensure nested address object exists
            street: '',
            number: '',
            neighborhood: '',
            municipality: '',
            city: '',
            state: '',
            zipCode: '',
            ...(patient.medicalHistory?.address || {})
        }
    });

    const handleChange = (field: keyof MedicalHistory, value: any) => {
        setHistory(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddressChange = (field: keyof NonNullable<MedicalHistory['address']>, value: string) => {
        setHistory(prev => ({
            ...prev,
            address: {
                ...(prev.address || { street: '', number: '', neighborhood: '', municipality: '', city: '', state: '', zipCode: '' }),
                [field]: value
            }
        }));
    };

    // Calculate Age from Date of Birth
    const calculateAge = (dobString?: string) => {
        if (!dobString) return '';
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    const handleSave = () => {
        onSave(history);
        toast.success("Historial médico actualizado");
    };

    return (
        <div className="space-y-8">
            {/* Section 1: DATOS GENERALES */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#1c334a] border-b pb-2">Datos Generales</h3>

                {/* Read-Only Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <Label className="text-xs text-gray-500 uppercase">Nombre Completo</Label>
                        <div className="font-medium text-sm">{patient.name}</div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500 uppercase">Email</Label>
                        <div className="font-medium text-sm">{patient.email}</div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500 uppercase">Celular</Label>
                        <div className="font-medium text-sm">{patient.phone}</div>
                    </div>
                </div>

                {/* Personal Info Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label>Fecha de Nacimiento</Label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.dateOfBirth || ''}
                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Edad</Label>
                        <div className="h-10 px-3 py-2 bg-gray-100 rounded-md text-sm border flex items-center text-gray-600">
                            {calculateAge(history.dateOfBirth) || '-'} años
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Sexo</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.sex || ''}
                            onChange={(e) => handleChange('sex', e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label>Estado Civil</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.maritalStatus || ''}
                            onChange={(e) => handleChange('maritalStatus', e.target.value)}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Soltero">Soltero(a)</option>
                            <option value="Casado">Casado(a)</option>
                            <option value="Divorciado">Divorciado(a)</option>
                            <option value="Viudo">Viudo(a)</option>
                            <option value="Unión Libre">Unión Libre</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label>Nombre del Cónyuge</Label>
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.spouseName || ''}
                            onChange={(e) => handleChange('spouseName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Ocupación</Label>
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.occupation || ''}
                            onChange={(e) => handleChange('occupation', e.target.value)}
                        />
                    </div>
                </div>

                {/* Phones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <Label>Tel. Casa</Label>
                        <input
                            type="tel"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.homePhone || ''}
                            onChange={(e) => handleChange('homePhone', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Tel. Oficina</Label>
                        <input
                            type="tel"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.officePhone || ''}
                            onChange={(e) => handleChange('officePhone', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Deportes</Label>
                        <input
                            type="text"
                            placeholder="¿Practica alguno?"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.sports || ''}
                            onChange={(e) => handleChange('sports', e.target.value)}
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                    <Label className="font-bold text-gray-700">Domicilio</Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs text-gray-500">Calle</Label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                                value={history.address?.street || ''}
                                onChange={(e) => handleAddressChange('street', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Número</Label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                                value={history.address?.number || ''}
                                onChange={(e) => handleAddressChange('number', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">C.P.</Label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                                value={history.address?.zipCode || ''}
                                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Colonia</Label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                                value={history.address?.neighborhood || ''}
                                onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Delegación / Municipio</Label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                                value={history.address?.municipality || ''}
                                onChange={(e) => handleAddressChange('municipality', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Ciudad</Label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                                value={history.address?.city || ''}
                                onChange={(e) => handleAddressChange('city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Estado</Label>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                                value={history.address?.state || ''}
                                onChange={(e) => handleAddressChange('state', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Medical Insurance & Misc */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="insurance"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={history.insurance || false}
                                onChange={(e) => handleChange('insurance', e.target.checked)}
                            />
                            <Label htmlFor="insurance" className="font-bold">¿Cuenta con Seguro Médico?</Label>
                        </div>
                        {history.insurance && (
                            <div className="space-y-1">
                                <Label>Cia. Aseguradora</Label>
                                <input
                                    type="text"
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                                    value={history.insuranceCompany || ''}
                                    onChange={(e) => handleChange('insuranceCompany', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <Label>Recomendado por</Label>
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={history.recommendedBy || ''}
                            onChange={(e) => handleChange('recommendedBy', e.target.value)}
                        />
                    </div>
                </div>

                {/* Basic Medical (Moved to Generales) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                        <Label>Tipo de Sangre</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                        <Label>Alergias (No / Si, cuales)</Label>
                        <Textarea
                            placeholder="Especifique..."
                            value={history.allergies}
                            onChange={(e) => handleChange('allergies', e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Enfermedades que padece (No / Si, cuales)</Label>
                        <Textarea
                            placeholder="Especifique..."
                            value={history.conditions}
                            onChange={(e) => handleChange('conditions', e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Toma Medicamentos (No / Si, cuales)</Label>
                        <Textarea
                            placeholder="Especifique..."
                            value={history.medications}
                            onChange={(e) => handleChange('medications', e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: HISTORIA CLÍNICA */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-[#1c334a] border-b pb-2">Historia Clínica</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Antecedentes personales no patológicos</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.nonPathologicalHistory || ''}
                            onChange={(e) => handleChange('nonPathologicalHistory', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Antecedentes personales patológicos</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.pathologicalHistory || ''} // This might now substitute the old 'familyHistory' or be separate
                            onChange={(e) => handleChange('pathologicalHistory', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Antecedentes Hereditarios</Label>
                        <Textarea
                            placeholder="Ej. Padre diabético..."
                            value={history.familyHistory || ''}
                            onChange={(e) => handleChange('familyHistory', e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Antecedentes gineco-obstétricos</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.gynecoObstetricHistory || ''}
                            onChange={(e) => handleChange('gynecoObstetricHistory', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Antecedentes perinatales</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.perinatalHistory || ''}
                            onChange={(e) => handleChange('perinatalHistory', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Padecimiento actual</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.currentCondition || ''}
                            onChange={(e) => handleChange('currentCondition', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Exploración física</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.physicalExploration || ''}
                            onChange={(e) => handleChange('physicalExploration', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Estudios de laboratorio y gabinete</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.labStudies || ''}
                            onChange={(e) => handleChange('labStudies', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tratamiento</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.treatment || ''}
                            onChange={(e) => handleChange('treatment', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Pronóstico</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={history.prognosis || ''}
                            onChange={(e) => handleChange('prognosis', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSave} className="bg-[#1c334a] text-white w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" /> Guardar Expediente Completo
                </Button>
            </div>
        </div>
    );
};
