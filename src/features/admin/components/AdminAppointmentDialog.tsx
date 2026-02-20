import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { HOSPITAL_SCHEDULES, type Hospital } from "@/features/appointments/types";
import { ArrowLeft, Building2 } from "lucide-react";

interface AdminAppointmentDialogProps {
    hospitals: Hospital[];
    onSave: (appointmentData: any, patientData: any) => Promise<boolean>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialPatientData?: { name: string, email: string, phone: string, notes?: string } | null;
}

export const AdminAppointmentDialog = ({ hospitals, onSave, open, onOpenChange, initialPatientData }: AdminAppointmentDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper helper
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    };

    // Controls the flow: if null, show selection screen. If set, show form.
    const [bookingHospitalId, setBookingHospitalId] = useState<string | null>(null);

    // Reset flow when dialog opens/closes
    useEffect(() => {
        if (open) {
            setBookingHospitalId(null); // Always ask "Where?" on open
            // If we have initial data, we might want to auto-select hospital if provided, but for now just prefill data
            if (initialPatientData) {
                setPatient({
                    name: initialPatientData.name,
                    email: initialPatientData.email,
                    emailError: '',
                    phone: initialPatientData.phone,
                    notes: initialPatientData.notes || ''
                });
            } else {
                // Reset to empty if no initial data
                setPatient({
                    name: '',
                    email: '',
                    emailError: '',
                    phone: '',
                    notes: ''
                });
            }
        }
    }, [open, initialPatientData]);

    // Form State
    const [patient, setPatient] = useState({
        name: '',
        email: '',
        emailError: '',
        phone: '',
        notes: ''
    });

    const [appointment, setAppointment] = useState({
        serviceId: '',
        serviceName: '', // Added for specific service description
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
        if (!bookingHospitalId) return;

        // Basic Validation
        if (!patient.name || !patient.phone || !appointment.date || !appointment.time || !appointment.reason) {
            alert("Por favor complete todos los campos obligatorios");
            return;
        }

        if (appointment.reason === 'specific-service' && !appointment.serviceName) {
            alert("Por favor describa el servicio específico");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(
                {
                    hospitalId: bookingHospitalId,
                    serviceId: null, // We are not using strict service IDs anymore in this flow
                    serviceName: appointment.reason === 'specific-service' ? appointment.serviceName : undefined,
                    date: appointment.date,
                    time: appointment.time,
                    reason: appointment.reason,
                    notes: patient.notes // Using patient notes as appointment/patient notes
                },
                patient
            );
            onOpenChange(false);
            // Reset form
            setPatient({ name: '', email: '', emailError: '', phone: '', notes: '' });
            setAppointment({ serviceId: '', serviceName: '', date: '', time: '', reason: '' });
            setBookingHospitalId(null);
        } catch (error) {
            console.error("Error scheduling:", error);
            alert("Error al agendar la cita. Verifique los datos.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedHospital = hospitals.find(h => h.id === bookingHospitalId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {bookingHospitalId && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 mr-1" onClick={() => setBookingHospitalId(null)}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {bookingHospitalId ? `Agendar en ${selectedHospital?.name}` : "Seleccione Hospital"}
                    </DialogTitle>
                    <DialogDescription>
                        {bookingHospitalId
                            ? "Ingrese los datos del paciente y detalles de la cita."
                            : "¿En qué sucursal desea agendar la nueva cita?"}
                    </DialogDescription>
                </DialogHeader>

                {!bookingHospitalId ? (
                    // STEP 1: Select Hospital
                    <div className="grid gap-4 py-4">
                        {hospitals.map(hospital => (
                            <button
                                key={hospital.id}
                                onClick={() => setBookingHospitalId(hospital.id)}
                                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-primary">{hospital.name}</h3>
                                    <p className="text-sm text-gray-500">{hospital.address}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    // STEP 2: Form
                    <div className="grid gap-6 py-4 animate-in slide-in-from-right-4 fade-in duration-300">
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
                                <Label htmlFor="admin-email">Correo Electrónico (Opcional)</Label>
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

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-reason">Motivo de la Cita</Label>
                                    <select
                                        id="admin-reason"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={appointment.reason}
                                        onChange={(e) => handleAppointmentChange('reason', e.target.value)}
                                    >
                                        <option value="">Seleccionar motivo...</option>
                                        <option value="first-visit">Primera Vez</option>
                                        <option value="follow-up">Seguimiento</option>
                                        <option value="specific-service">Servicio Específico</option>
                                    </select>
                                </div>

                                {appointment.reason === 'specific-service' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="admin-service-desc">Descripción del Servicio</Label>
                                        <Input
                                            id="admin-service-desc"
                                            value={appointment.serviceName || ''}
                                            onChange={(e) => handleAppointmentChange('serviceName', e.target.value)}
                                            placeholder="Ej: Consulta de tal, Revisión..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-date">Fecha *</Label>
                                    <div className="text-xs text-blue-600 font-medium mb-1">
                                        Días disponibles para este hospital: {
                                            HOSPITAL_SCHEDULES[bookingHospitalId]?.allowedDays
                                                .map(d => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d])
                                                .join(', ') || 'Consultar Horario'
                                        }
                                    </div>
                                    <Input
                                        id="admin-date"
                                        type="date"
                                        value={appointment.date}
                                        onChange={(e) => {
                                            const dateVal = e.target.value;
                                            if (dateVal) {
                                                //const [year, month, day] = dateVal.split('-').map(Number);
                                                //const dateObj = new Date(year, month - 1, day);
                                                //const dayOfWeek = dateObj.getDay();
                                                
                                            }
                                            handleAppointmentChange('date', dateVal);
                                        }}
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
                                        {Array.from({ length: 23 }).map((_, i) => { // 9:00 to 20:00 every 30 mins
                                            const startHour = 9;
                                            const totalMinutes = i * 30;
                                            const hour = startHour + Math.floor(totalMinutes / 60);
                                            const minutes = totalMinutes % 60;
                                            const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                            return <option key={time} value={time}>{formatTime(time)}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 mt-2">
                                <span className="font-semibold">Recordatorio Importante: </span>
                                Recuerda completar los datos completos de historia clínica del paciente en la sección pacientes después de agendar.
                            </div>


                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? "Agendando..." : "Confirmar Cita"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
