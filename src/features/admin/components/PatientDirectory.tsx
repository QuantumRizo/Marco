import { useState, useMemo } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { PatientClinicalRecord } from './PatientClinicalRecord';
import type { Patient } from '../../appointments/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, MapPin, Phone, Mail, Trash2, Calendar, ArrowRight, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

interface PatientDirectoryProps {
    selectedHospitalId: string;
}

export const PatientDirectory = ({ selectedHospitalId }: PatientDirectoryProps) => {
    const { hospitals, appointments, patients, deletePatient, updatePatient, updateAppointment, loading } = useAppointments();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // --- Logic: Patients per Hospital ---
    const filteredPatients = useMemo(() => {
        // 1. Find all appointments for this hospital
        const hospitalAppts = appointments.filter(a => a.hospitalId === selectedHospitalId);

        // 2. Extract unique Patient IDs
        const patientIds = new Set(hospitalAppts.map(a => a.patientId));

        // 3. Get Patient objects
        const hospitalPatients = patients.filter(p => patientIds.has(p.id));

        // 4. Filter by Search Term
        const search = searchTerm.toLowerCase();
        return hospitalPatients.filter(p =>
            (p.name || '').toLowerCase().includes(search) ||
            (p.email || '').toLowerCase().includes(search)
        );
    }, [appointments, patients, selectedHospitalId, searchTerm]);

    // --- Global Autocomplete (Quick Jump) ---
    const globalSuggestions = useMemo(() => {
        if (searchTerm.length < 2) return [];
        const search = searchTerm.toLowerCase();

        // Find matches in ALL hospitals
        const matches: { patient: Patient, hospitalId: string, hospitalName: string }[] = [];
        const seen = new Set<string>(); // composite key patientId-hospitalId

        appointments.forEach(appt => {
            const patient = patients.find(p => p.id === appt.patientId);
            if (!patient) return;

            if (patient.name.toLowerCase().includes(search)) {
                const key = `${patient.id}-${appt.hospitalId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    matches.push({
                        patient,
                        hospitalId: appt.hospitalId,
                        hospitalName: hospitals.find(h => h.id === appt.hospitalId)?.name || 'Desconocido'
                    });
                }
            }
        });

        return matches.slice(0, 5);
    }, [appointments, patients, hospitals, searchTerm]);


    // --- Helpers for Patient Details ---
    const getPatientHistory = (patientId: string) => {
        const patientAppts = appointments
            .filter(a => a.patientId === patientId)
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.time);
                const dateB = new Date(b.date + 'T' + b.time);
                return dateB.getTime() - dateA.getTime(); // Newest first
            });

        const today = new Date();
        const upcoming = patientAppts.filter(a => {
            const apptDate = new Date(a.date + 'T' + a.time);
            return isAfter(apptDate, today) && a.status !== 'cancelled' && a.status !== 'blocked';
        });
        const history = patientAppts.filter(a => {
            const apptDate = new Date(a.date + 'T' + a.time);
            return !isAfter(apptDate, today) || a.status === 'cancelled' || a.status === 'blocked';
        });

        return { upcoming, history };
    };

    const handleSelectSuggestion = (suggestion: typeof globalSuggestions[0]) => {
        // Note: Logic to switch hospital is not in this component strictly, 
        // but for now we might just open the patient. 
        // Ideally we should tell parent to switch hospital, but keeping it simple for now.
        // We will just open the patient regardless.
        setSearchTerm(''); // Clear search to hide dropdown
        handleOpenPatient(suggestion.patient);
    };

    const handleOpenPatient = (patient: Patient) => {
        setSelectedPatient(patient);
    };

    const handleDeletePatient = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("¡ADVERTENCIA!\n\nEsta acción eliminará permanentemente al paciente y TODAS sus citas históricas.\n\n¿Estás seguro de continuar?")) {
            try {
                await deletePatient(id);
            } catch (error: any) {
                alert("Error al eliminar paciente: " + (error.message || JSON.stringify(error)));
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Search with Autocomplete */}
            <div className="relative z-50 w-full md:w-[300px]">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                    <Search className="w-4 h-4 ml-2 text-gray-400" />
                    <Input
                        placeholder="Buscar paciente..."
                        className="border-none shadow-none focus-visible:ring-0 flex-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Autocomplete Dropdown */}
                {globalSuggestions.length > 0 && searchTerm.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden max-h-[300px] overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-50 border-b">
                            Sugerencias Globales
                        </div>
                        {globalSuggestions.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectSuggestion(s)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                            >
                                <div>
                                    <div className="font-medium text-[#1c334a]">{s.patient.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {s.hospitalName}
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* PATIENTS TABLE */}
            <Card className="shadow-lg border-t-4 border-t-[#1c334a]">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Directorio de Pacientes
                        <Badge variant="secondary" className="ml-2">{filteredPatients.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Estado de la Cita</TableHead>
                                    <TableHead className="text-right">Expediente / Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 w-32 bg-gray-200" />
                                                <Skeleton className="h-4 w-24 bg-gray-100" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-24 bg-gray-100" />
                                                <Skeleton className="h-4 w-32 bg-gray-100" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-20 rounded-full bg-gray-100" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-9 w-24 bg-gray-200" />
                                                <Skeleton className="h-9 w-24 bg-gray-200" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No se encontraron pacientes en este hospital con el criterio de búsqueda.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Estado de la Cita</TableHead>
                                    <TableHead className="text-right">Expediente / Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.map((patient) => {
                                    const { upcoming, history } = getPatientHistory(patient.id);
                                    const nextAppt = upcoming[0];

                                    return (
                                        <TableRow key={patient.id} className="group hover:bg-gray-50 transition-colors">
                                            <TableCell>
                                                <div className="font-bold text-[#1c334a] text-lg">{patient.name}</div>
                                                {nextAppt && (
                                                    <div className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-full">
                                                        <Calendar className="w-3 h-3" />
                                                        Próxima: {format(parseISO(nextAppt.date), 'dd MMM', { locale: es })} - {nextAppt.time}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600 flex flex-col gap-1">
                                                    <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {patient.phone}</span>
                                                    <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {patient.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {upcoming.length > 0 && (
                                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 text-sm px-2 py-1">
                                                            {upcoming.length} Pendientes
                                                        </Badge>
                                                    )}
                                                    {history.length > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {history.length} Históricas
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                className="bg-[#1c334a] hover:bg-[#2a4560] shadow-sm"
                                                                onClick={() => handleOpenPatient(patient)}
                                                            >
                                                                <FileText className="w-4 h-4 mr-2" />
                                                                Ver Expediente
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl">Expediente Clínico</DialogTitle>
                                                            </DialogHeader>

                                                            {selectedPatient && (
                                                                <PatientClinicalRecord
                                                                    patient={selectedPatient}
                                                                    appointments={appointments}
                                                                    onUpdatePatient={updatePatient}
                                                                    onUpdateAppointment={updateAppointment}
                                                                />
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
                                                        onClick={(e) => handleDeletePatient(patient.id, e)}
                                                        title="Eliminar Paciente Completo"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
