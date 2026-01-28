import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, CalendarPlus, CheckCircle } from "lucide-react";

interface AddPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (patientData: { name: string, email: string, phone: string }) => Promise<any>;
    onBookAppointment: (patientData: any) => void;
}

export const AddPatientDialog = ({ open, onOpenChange, onSave, onBookAppointment }: AddPatientDialogProps) => {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [createdPatient, setCreatedPatient] = useState<any>(null);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        // Basic validation
        if (!formData.name || !formData.email || !formData.phone) {
            alert("Por favor complete nombre, correo y teléfono.");
            return;
        }

        setIsSubmitting(true);
        try {
            const newPatient = await onSave(formData);
            setCreatedPatient(newPatient); // Store for potential booking
            setStep('success');
        } catch (error: any) {
            alert(error.message || "Error al registrar paciente");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ name: '', email: '', phone: '' });
        setStep('form');
        setCreatedPatient(null);
    };

    const handleClose = () => {
        handleReset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) handleReset();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        {step === 'form' ? "Registrar Nuevo Paciente" : "¡Paciente Registrado!"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'form'
                            ? "Ingrese los datos del paciente para darlo de alta en el sistema."
                            : "El paciente ha sido registrado exitosamente. ¿Qué deseas hacer ahora?"}
                    </DialogDescription>
                </DialogHeader>

                {step === 'form' ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-name">Nombre Completo *</Label>
                            <Input
                                id="new-name"
                                placeholder="Ej: Maria Gonzalez"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-email">Correo Electrónico *</Label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-phone">Teléfono *</Label>
                                <Input
                                    id="new-phone"
                                    placeholder="55 1234 5678"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Registrar Paciente"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 space-y-6">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{createdPatient?.name}</h3>
                            <p className="text-gray-500">{createdPatient?.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-gray-50" onClick={handleClose}>
                                <CheckCircle className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold text-gray-700">Solo Registrar</span>
                                <span className="text-xs text-gray-400 font-normal">Finalizar y cerrar</span>
                            </Button>

                            <Button className="h-auto py-4 flex flex-col gap-2" onClick={() => {
                                handleClose();
                                onBookAppointment(formData);
                                // We pass formData because createdPatient structure might vary slightly or we just need these fields for the form
                            }}>
                                <CalendarPlus className="w-5 h-5" />
                                <span className="font-semibold">Agendar Cita</span>
                                <span className="text-xs font-normal opacity-80">Crear cita ahora</span>
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
