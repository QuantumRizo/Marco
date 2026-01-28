import { useState } from 'react';
import type { Patient, Appointment } from '../../appointments/types';
import { MedicalHistoryEditor } from './MedicalHistoryEditor';
import { PatientFiles } from './PatientFiles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    hospitals: any[]; // Using any[] to avoid circular dependency or import type if available
    onUpdatePatient: (patient: Patient) => Promise<void>;
}

export const PatientClinicalRecord = ({
    patient: initialPatient,
    appointments,
    hospitals,
    onUpdatePatient
}: PatientClinicalRecordProps) => {
    // REMOVED useAppointments hook to avoid re-fetching data on every open
    const [patient, setPatient] = useState<Patient>(initialPatient);
    const [generalNotes, setGeneralNotes] = useState<string>(initialPatient.notes || '');

    // Refresh local state when props change
    if (initialPatient.id !== patient.id) {
        setPatient(initialPatient);
        setGeneralNotes(initialPatient.notes || '');
    }

    const handleSaveHistory = async (history: any) => {
        const updated = { ...patient, medicalHistory: history };
        await onUpdatePatient(updated);
        setPatient(updated);
    };

    const handleSaveGeneralNotes = async () => {
        try {
            const updated = { ...patient, notes: generalNotes };
            await onUpdatePatient(updated);
            setPatient(updated);
            toast.success("Notas guardadas correctamente");
        } catch (error) {
            console.error("Error saving notes", error);
            toast.error("Error al guardar las notas");
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
                <Tabs defaultValue="history" className="h-full flex flex-col">
                    <div className="px-6 pt-4 border-b bg-white">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-full md:max-w-[650px] gap-2 md:gap-0 h-auto md:h-10">
                            <TabsTrigger value="history">Datos / Historia</TabsTrigger>
                            <TabsTrigger value="appointments">Citas</TabsTrigger>
                            <TabsTrigger value="notes">Notas</TabsTrigger>
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



                        <TabsContent value="appointments" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Historial de Citas
                                    </CardTitle>
                                    <CardDescription>
                                        Lista completa de citas programadas y pasadas.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {patientAppointments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay citas registradas.
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/50">
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Hora</TableHead>
                                                    <TableHead>Sede</TableHead>
                                                    <TableHead>Motivo</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {patientAppointments.map((appt) => (
                                                    <TableRow key={appt.id}>
                                                        <TableCell className="font-medium">
                                                            {format(parseISO(appt.date), 'dd MMM yyyy', { locale: es })}
                                                        </TableCell>
                                                        <TableCell>{appt.time}</TableCell>
                                                        <TableCell>
                                                            {hospitals?.find(h => h.id === appt.hospitalId)?.name || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {appt.reason === 'specific-service' ? appt.serviceName : appt.reason}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={appt.status === 'cancelled' ? 'destructive' : 'default'} className={`text-xs ${appt.status !== 'cancelled' ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                                                                {appt.status === 'cancelled' ? 'Cancelada' : 'Confirmada'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0 h-full flex flex-col">
                            <Card className="flex-1 flex flex-col shadow-sm border-t-0 rounded-t-none">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <div className="p-2 bg-yellow-100/50 rounded-lg text-yellow-700">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                Cuaderno de Notas
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                Espacio para notas generales, seguimiento y observaciones del paciente. Recuerde guardar los cambios.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 flex flex-col relative min-h-[400px]">
                                    <div className="absolute inset-0 p-6">
                                        <textarea
                                            className="w-full h-full resize-none bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-white leading-8 p-4 text-base text-gray-700 focus:outline-none focus:ring-0 border-0"
                                            placeholder="Escriba aquí las notas clínicas del paciente..."
                                            value={generalNotes}
                                            onChange={(e) => setGeneralNotes(e.target.value)}
                                            style={{
                                                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
                                                backgroundSize: '100% 32px',
                                                lineHeight: '32px'
                                            }}
                                        ></textarea>
                                    </div>
                                </CardContent>
                                <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 italic">
                                        * Estas notas se guardan en el expediente general del paciente.
                                    </span>
                                    <Button
                                        onClick={handleSaveGeneralNotes}
                                        disabled={generalNotes === (patient.notes || '')}
                                        className={`${generalNotes !== (patient.notes || '') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 text-gray-500'}`}
                                    >
                                        {generalNotes !== (patient.notes || '') ? 'Guardar Cambios' : 'Sin cambios'}
                                    </Button>
                                </div>
                            </Card>
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
