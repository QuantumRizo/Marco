import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AdminAppointmentDialogProps {
    selectedHospitalId: string;
    services: any[];
    onSave: (appointmentData: any, patientData: any) => Promise<boolean>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AdminAppointmentDialog = ({ selectedHospitalId, services, onSave, open, onOpenChange }: AdminAppointmentDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [patient, setPatient] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const [appointment, setAppointment] = useState({
        serviceId: '',
        date: '',
        time: '',
        reason: ''
    });

    const handlePatientChange = (key: string, value: string) => {
        setPatient(prev => ({ ...prev, [key]: value }));
    };

    const handleAppointmentChange = (key: string, value: string) => {
        setAppointment(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!patient.name || !patient.email || !patient.phone || !appointment.date || !appointment.time) {
            alert("Por favor complete todos los campos obligatorios");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(
                {
                    hospitalId: selectedHospitalId,
                    serviceId: appointment.serviceId,
                    date: appointment.date,
                    time: appointment.time,
                    reason: appointment.reason || 'Agendado por Admin',
                    notes: patient.notes // Using patient notes as appointment/patient notes
                },
                patient
            );
            onOpenChange(false);
            // Reset form
            setPatient({ name: '', email: '', phone: '', notes: '' });
            setAppointment({ serviceId: '', date: '', time: '', reason: '' });
        } catch (error) {
            console.error("Error scheduling:", error);
            alert("Error al agendar la cita. Verifique los datos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Agendar Nueva Cita</DialogTitle>
                    <DialogDescription>
                        Ingrese los datos del paciente y detalles de la cita para el hospital seleccionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Section: Datos del Paciente */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Datos del Paciente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="admin-name">Nombre Completo *</Label>
                                <Input
                                    id="admin-name"
                                    value={patient.name}
                                    onChange={(e) => handlePatientChange('name', e.target.value)}
                                    placeholder="Nombre del paciente"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-phone">Teléfono *</Label>
                                <Input
                                    id="admin-phone"
                                    value={patient.phone}
                                    onChange={(e) => handlePatientChange('phone', e.target.value)}
                                    placeholder="55 1234 5678"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-email">Correo Electrónico *</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                value={patient.email}
                                onChange={(e) => handlePatientChange('email', e.target.value)}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                    </div>

                    {/* Section: Detalles de la Cita */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Detalles de la Cita</h3>

                        <div className="space-y-2">
                            <Label htmlFor="admin-service">Servicio</Label>
                            <select
                                id="admin-service"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={appointment.serviceId}
                                onChange={(e) => handleAppointmentChange('serviceId', e.target.value)}
                            >
                                <option value="">Seleccionar servicio...</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="admin-date">Fecha *</Label>
                                <Input
                                    id="admin-date"
                                    type="date"
                                    value={appointment.date}
                                    onChange={(e) => handleAppointmentChange('date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-time">Hora *</Label>
                                <select
                                    id="admin-time"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={appointment.time}
                                    onChange={(e) => handleAppointmentChange('time', e.target.value)}
                                >
                                    <option value="">Seleccionar hora...</option>
                                    {Array.from({ length: 19 }).map((_, i) => { // 9:00 to 18:00 every 30 mins
                                        const startHour = 9;
                                        const totalMinutes = i * 30;
                                        const hour = startHour + Math.floor(totalMinutes / 60);
                                        const minutes = totalMinutes % 60;
                                        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                                        // Just showing up to 19:00 maybe? Let's stick strictly to what AdminDashboard.tsx had or slightly better.
                                        // AdminDashboard had intervals too.
                                        return <option key={time} value={time}>{time}</option>;
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin-notes">Notas / Motivo</Label>
                            <Textarea
                                id="admin-notes"
                                value={patient.notes}
                                onChange={(e) => handlePatientChange('notes', e.target.value)}
                                placeholder="Notas adicionales sobre el paciente o la cita..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Agendando..." : "Confirmar Cita"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
