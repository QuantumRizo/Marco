import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Textarea import removed as it was unused
import { useState } from "react";

interface PatientInfo {
    name: string;
    email: string;
    phone: string;
    notes: string;
}

interface StepPatientInfoProps {
    info: PatientInfo;
    onChange: (field: keyof PatientInfo, value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting?: boolean;
}

export const StepPatientInfo = ({
    info,
    onChange,
    onSubmit,
    onBack,
    isSubmitting = false
}: StepPatientInfoProps) => {
    const [errors, setErrors] = useState<Partial<PatientInfo>>({});

    const validate = () => {
        const newErrors: Partial<PatientInfo> = {};
        if (!info.name.trim()) newErrors.name = "El nombre es requerido";
        if (!info.email.trim()) newErrors.email = "El correo es requerido";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) newErrors.email = "Correo inválido";
        if (!info.phone.trim()) newErrors.phone = "El teléfono es requerido";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSubmit();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-primary">Tus Datos</h2>
                <p className="text-gray-500">Para poder contactarte y confirmar tu cita</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                        id="name"
                        placeholder="Juan Pérez"
                        value={info.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="juan@ejemplo.com"
                            value={info.email}
                            onChange={(e) => onChange('email', e.target.value)}
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                        <Input
                            id="phone"
                            placeholder="55 1234 5678"
                            value={info.phone}
                            onChange={(e) => onChange('phone', e.target.value)}
                            className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                    <textarea
                        id="notes"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="¿Algo más que debamos saber?"
                        value={info.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Atrás</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full md:w-auto min-w-[120px]">
                    {isSubmitting ? "Confirmando..." : "Confirmar Cita"}
                </Button>
            </div>
        </div>
    );
};
