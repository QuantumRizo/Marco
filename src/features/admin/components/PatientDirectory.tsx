import { useState, useMemo } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { PatientClinicalRecord } from './PatientClinicalRecord';
import { AddPatientDialog } from './AddPatientDialog';
import type { Patient } from '../../appointments/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, MapPin, Phone, Mail, Trash2, Calendar, ArrowRight, User, FileText, UserPlus, CalendarPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";

interface PatientDirectoryProps {
    onBookAppointment?: (patientData: any) => void;
}

export const PatientDirectory = ({ onBookAppointment }: PatientDirectoryProps) => {
    const { hospitals, appointments, patients, deletePatient, updatePatient, addPatient, loading } = useAppointments();

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return format(date, 'h:mm a', { locale: es });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('all');

    // --- Logic: Patients per Hospital or Global ---
    const filteredPatients = useMemo(() => {
        let basePatients = patients;

        if (selectedHospitalFilter !== 'all') {
            // 1. Find all appointments for this hospital
            const hospitalAppts = appointments.filter(a => a.hospitalId === selectedHospitalFilter);

            // 2. Extract unique Patient IDs
            const patientIds = new Set(hospitalAppts.map(a => a.patientId));

            // 3. Get Patient objects
            basePatients = patients.filter(p => patientIds.has(p.id));
        }

        // 4. Filter by Search Term
        const search = searchTerm.toLowerCase();
        return basePatients.filter(p =>
            (p.name?.toLowerCase() || '').includes(search) ||
            (p.email?.toLowerCase() || '').includes(search)
        );
    }, [appointments, patients, selectedHospitalFilter, searchTerm]);

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

            if (patient.name?.toLowerCase().includes(search)) {
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Search with Autocomplete */}
                <div className="relative z-30 w-full md:w-[300px]">
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
                <Button
                    className="bg-[#1c334a] hover:bg-[#2a4560] shadow-sm ml-auto md:ml-2 w-full md:w-auto mt-2 md:mt-0"
                    onClick={() => setIsAddDialogOpen(true)}
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Paciente
                </Button>
            </div>

            {/* PATIENTS TABLE */}
            <Card className="shadow-lg border-t-4 border-t-[#1c334a]">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Directorio de Pacientes
                        <div className="flex items-center gap-4">
                            <select
                                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={selectedHospitalFilter}
                                onChange={(e) => setSelectedHospitalFilter(e.target.value)}
                            >
                                <option value="all">Todos los Hospitales</option>
                                {hospitals.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                            <Badge variant="secondary">{filteredPatients.length}</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Contacto</TableHead>
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
                            {selectedHospitalFilter !== 'all'
                                ? "No se encontraron pacientes en este hospital con el criterio de búsqueda."
                                : "No hay pacientes registrados en el sistema."}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="min-w-[200px]">Paciente</TableHead>
                                            <TableHead className="hidden md:table-cell">Contacto</TableHead>
                                            <TableHead className="text-right min-w-[150px]">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.map((patient) => {
                                            const { upcoming } = getPatientHistory(patient.id);
                                            const nextAppt = upcoming[0];

                                            return (
                                                <TableRow key={patient.id} className="group hover:bg-gray-50 transition-colors">
                                                    <TableCell>
                                                        <div className="font-bold text-[#1c334a] text-lg">{patient.name}</div>
                                                        {nextAppt && (
                                                            <div className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium bg-green-50 w-fit px-2 py-0.5 rounded-full">
                                                                <Calendar className="w-3 h-3" />
                                                                Próxima: {format(parseISO(nextAppt.date), 'dd MMM', { locale: es })} - {formatTime(nextAppt.time)}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="text-sm text-gray-600 flex flex-col gap-1">
                                                            <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {patient.phone}</span>
                                                            <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {patient.email}</span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-[#1c334a] hover:bg-[#2a4560] text-white shadow-sm"
                                                                onClick={() => onBookAppointment && onBookAppointment({
                                                                    id: patient.id,
                                                                    name: patient.name,
                                                                    email: patient.email,
                                                                    phone: patient.phone
                                                                })}
                                                                title="Agendar Cita"
                                                            >
                                                                <CalendarPlus className="w-4 h-4 mr-2" />
                                                                Agendar
                                                            </Button>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-[#1c334a] hover:bg-[#2a4560] shadow-sm"
                                                                        onClick={() => handleOpenPatient(patient)}
                                                                    >
                                                                        <FileText className="w-4 h-4 mr-2" />
                                                                        Expediente
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
                                                                            hospitals={hospitals}
                                                                            onUpdatePatient={updatePatient}
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
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {filteredPatients.map((patient) => {
                                    const { upcoming } = getPatientHistory(patient.id);
                                    const nextAppt = upcoming[0];

                                    return (
                                        <div key={patient.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-[#1c334a] text-lg">{patient.name}</div>
                                                    <div className="text-sm text-gray-500 flex flex-col gap-0.5 mt-1">
                                                        <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {patient.phone}</span>
                                                        <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {patient.email}</span>
                                                    </div>
                                                </div>
                                                {nextAppt && (
                                                    <div className="text-[10px] text-green-700 bg-green-50 px-2 py-1 rounded-full font-semibold border border-green-100 text-center leading-tight">
                                                        <div className="flex items-center justify-center gap-1 mb-0.5">
                                                            <Calendar className="w-3 h-3" />
                                                            PRÓXIMA
                                                        </div>
                                                        {format(parseISO(nextAppt.date), 'dd MMM', { locale: es })}
                                                        <div className="font-normal">{formatTime(nextAppt.time)}</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-[#1c334a] hover:bg-[#2a4560] text-white shadow-sm h-10"
                                                    onClick={() => onBookAppointment && onBookAppointment({
                                                        id: patient.id,
                                                        name: patient.name,
                                                        email: patient.email,
                                                        phone: patient.phone
                                                    })}
                                                >
                                                    <CalendarPlus className="w-4 h-4 mr-1.5" />
                                                    Agendar
                                                </Button>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full border-[#1c334a] text-[#1c334a] hover:bg-blue-50 h-10"
                                                            onClick={() => handleOpenPatient(patient)}
                                                        >
                                                            <FileText className="w-4 h-4 mr-1.5" />
                                                            Expediente
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-[95%] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 md:p-6">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl">Expediente Clínico</DialogTitle>
                                                        </DialogHeader>

                                                        {selectedPatient && (
                                                            <PatientClinicalRecord
                                                                patient={selectedPatient}
                                                                appointments={appointments}
                                                                hospitals={hospitals}
                                                                onUpdatePatient={updatePatient}
                                                            />
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
                                                onClick={(e) => handleDeletePatient(patient.id, e)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1.5" />
                                                Eliminar Paciente
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <AddPatientDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSave={addPatient}
                onBookAppointment={(data: any) => {
                    if (onBookAppointment) onBookAppointment(data);
                }}
            />
        </div >
    );
};
