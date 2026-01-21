import { useState } from 'react';
import type { Patient, Appointment } from '../../appointments/types';
import { MedicalHistoryEditor } from './MedicalHistoryEditor';
import { PatientFiles } from './PatientFiles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Phone, Mail, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientClinicalRecordProps {
    patient: Patient;
    appointments: Appointment[];
    onUpdatePatient: (patient: Patient) => Promise<void>;
    onUpdateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
}

export const PatientClinicalRecord = ({
    patient: initialPatient,
    appointments,
    onUpdatePatient,
    onUpdateAppointment
}: PatientClinicalRecordProps) => {
    // REMOVED useAppointments hook to avoid re-fetching data on every open
    const [patient, setPatient] = useState<Patient>(initialPatient);
    const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

    // Refresh local state when props change
    if (initialPatient.id !== patient.id) {
        setPatient(initialPatient);
    }

    const handleSaveHistory = async (history: any) => {
        const updated = { ...patient, medicalHistory: history };
        await onUpdatePatient(updated);
        setPatient(updated);
    };

    const handleNoteChange = (apptId: string, text: string) => {
        setEditingNotes(prev => ({ ...prev, [apptId]: text }));
    };

    const handleSaveNote = async (apptId: string) => {
        const textToSave = editingNotes[apptId];
        if (textToSave === undefined) return;

        try {
            await onUpdateAppointment(apptId, { notes: textToSave });

            // Clear editing state on success so UI reverts to showing SAVED note (which matches textToSave)
            setEditingNotes(prev => {
                const newState = { ...prev };
                delete newState[apptId];
                return newState;
            });

            toast.success("Nota de cita guardada correctamente");
        } catch (error) {
            console.error("Error saving note", error);
            toast.error("Error al guardar la nota");
        }
    };

    // Filter appointments for this patient
    const patientAppointments = appointments
        .filter(a => a.patientId === patient.id)
        .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

    return (
        <div className="flex flex-col h-[80vh]">
            {/* Header */}
            <div className="flex items-start gap-4 p-6 bg-slate-50 border-b">
                <div className="w-16 h-16 rounded-full bg-[#1c334a] text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
                    {patient.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#1c334a]">{patient.name}</h2>
                    <div className="flex gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border shadow-sm">
                            <Phone className="w-4 h-4" /> {patient.phone}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border shadow-sm text-xs">
                            <Mail className="w-4 h-4" /> {patient.email}
                        </span>
                        {patient.medicalHistory?.bloodType && (
                            <span className="flex items-center gap-1 bg-red-50 text-red-700 font-bold px-2 py-1 rounded-md border border-red-100 shadow-sm text-xs">
                                <Activity className="w-4 h-4" /> Tipo: {patient.medicalHistory.bloodType}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-hidden bg-white">
                <Tabs defaultValue="notes" className="h-full flex flex-col">
                    <div className="px-6 pt-4 border-b bg-white">
                        <TabsList className="grid w-full grid-cols-3 max-w-[650px]">
                            <TabsTrigger value="history">Historia Clínica</TabsTrigger>
                            <TabsTrigger value="notes">Notas de Evolución</TabsTrigger>
                            <TabsTrigger value="files">Archivos</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <TabsContent value="history" className="mt-0 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Antecedentes Médicos
                                    </CardTitle>
                                    <CardDescription>
                                        Registre alergias, padecimientos y antecedentes familiares.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <MedicalHistoryEditor patient={patient} onSave={handleSaveHistory} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0">
                            <div className="space-y-6">
                                <div className="text-sm text-gray-500 mb-4">
                                    Historial de consultas y notas.
                                </div>

                                {patientAppointments.length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">
                                        No hay consultas registradas.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {patientAppointments.map(appt => {
                                            const currentNote = editingNotes[appt.id] !== undefined ? editingNotes[appt.id] : (appt.notes || '');
                                            const hasChanges = currentNote !== (appt.notes || '');

                                            return (
                                                <Card key={appt.id} className="border-l-4 border-l-[#1c334a]">
                                                    <CardHeader className="py-3 px-4 bg-gray-50/50">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                                <span className="font-semibold text-gray-700">
                                                                    {format(parseISO(appt.date), 'dd MMMM yyyy', { locale: es })}
                                                                </span>
                                                                <span className="text-gray-400">|</span>
                                                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> {appt.time}
                                                                </span>
                                                            </div>
                                                            <Badge variant={appt.status === 'completed' ? 'default' : 'secondary'}>
                                                                {appt.status}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="py-4">
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Motivo</h4>
                                                                <p className="text-sm">{appt.reason === 'specific-service' ? (appt.serviceName || 'Servicio') : appt.reason}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                                                                    Notas de la Cita
                                                                    {hasChanges && (
                                                                        <span className="text-xs text-amber-600 font-normal animate-pulse">Cambios sin guardar</span>
                                                                    )}
                                                                </h4>
                                                                <textarea
                                                                    className="w-full min-h-[80px] text-sm p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 resize-none"
                                                                    placeholder="Escriba aquí las notas de la cita..."
                                                                    value={currentNote}
                                                                    onChange={(e) => handleNoteChange(appt.id, e.target.value)}
                                                                ></textarea>
                                                                {hasChanges && (
                                                                    <div className="flex justify-end">
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleSaveNote(appt.id)}
                                                                            className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            Guardar Notas
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="files" className="mt-0">
                            <PatientFiles patientId={patient.id} />
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    );
};
