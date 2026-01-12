import { useState, useMemo } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import type { Patient } from '../../appointments/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, MapPin, Phone, Mail, FileText, History, Trash2, Calendar, ArrowRight, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientDirectoryProps {
    selectedHospitalId: string;
}

export const PatientDirectory = ({ selectedHospitalId }: PatientDirectoryProps) => {
    const { hospitals, appointments, patients, updatePatient, deleteAppointment, deletePatient } = useAppointments();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [noteText, setNoteText] = useState('');

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
        setNoteText(patient.notes || '');
    };

    const handleSaveNote = () => {
        if (selectedPatient) {
            const updatedPatient = { ...selectedPatient, notes: noteText };
            updatePatient(updatedPatient);
            setSelectedPatient(updatedPatient);
        }
    };

    const handleDeleteAppointment = async (id: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta cita permanentemente?")) {
            try {
                await deleteAppointment(id);
            } catch (error: any) {
                alert("Error al eliminar cita: " + (error.message || JSON.stringify(error)));
            }
        }
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
                    {filteredPatients.length === 0 ? (
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
                                                                variant="default"
                                                                className="bg-[#1c334a] hover:bg-[#2a4560] shadow-sm"
                                                                onClick={() => handleOpenPatient(patient)}
                                                            >
                                                                Ver Citas/Historial
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="hover:bg-gray-200 shadow-sm"
                                                                onClick={() => handleOpenPatient(patient)}
                                                            >
                                                                <FileText className="w-4 h-4 mr-2" />
                                                                Agregar Notas
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl">Expediente Clínico</DialogTitle>
                                                            </DialogHeader>

                                                            {selectedPatient && (
                                                                <div className="grid gap-6 py-4">
                                                                    {/* Patient Header */}
                                                                    <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                                                        <div className="w-16 h-16 rounded-full bg-[#1c334a] text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
                                                                            {selectedPatient.name.charAt(0)}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h2 className="text-2xl font-bold text-[#1c334a]">{selectedPatient.name}</h2>
                                                                            <div className="flex gap-4 text-sm text-gray-500 mt-2">
                                                                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border"><Phone className="w-4 h-4" /> {selectedPatient.phone}</span>
                                                                                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border text-xs"><Mail className="w-4 h-4" /> {selectedPatient.email}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid md:grid-cols-2 gap-6">
                                                                        {/* Left Col: Notes */}
                                                                        <div className="space-y-3">
                                                                            <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                                                                <FileText className="w-5 h-5" /> Notas Clínicas
                                                                            </h3>
                                                                            <div className="relative">
                                                                                <textarea
                                                                                    className="flex min-h-[200px] w-full rounded-md border border-input bg-yellow-50/20 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c334a] leading-relaxed"
                                                                                    placeholder="Escribir notas de seguimiento..."
                                                                                    value={noteText}
                                                                                    onChange={(e) => setNoteText(e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <Button onClick={handleSaveNote} className="w-full bg-[#1c334a]">
                                                                                Guardar Notas
                                                                            </Button>
                                                                        </div>

                                                                        {/* Right Col: History */}
                                                                        <div className="space-y-4">
                                                                            <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                                                                <History className="w-5 h-5" /> Historial de Citas
                                                                            </h3>

                                                                            {/* Upcoming List */}
                                                                            {getPatientHistory(selectedPatient.id).upcoming.length > 0 && (
                                                                                <div className="mb-4">
                                                                                    <h4 className="text-xs font-bold text-green-700 uppercase mb-2 ml-1">Próximas</h4>
                                                                                    {getPatientHistory(selectedPatient.id).upcoming.map(apt => (
                                                                                        <div key={apt.id} className="p-3 bg-green-50 border border-green-100 rounded-lg mb-2 text-sm relative group">
                                                                                            <div className="font-bold text-green-900 pr-24">
                                                                                                {format(parseISO(apt.date), 'dd MMM yyyy', { locale: es })} - {apt.time}
                                                                                            </div>
                                                                                            <div className="text-green-800">{hospitals.find(h => h.id === apt.hospitalId)?.name}</div>
                                                                                            <div className="text-xs text-green-700 mt-1">{apt.reason === 'specific-service' ? apt.serviceName || 'Servicio Específico' : apt.reason}</div>
                                                                                            {apt.notes && <div className="text-xs text-gray-500 mt-1 italic">"{apt.notes}"</div>}

                                                                                            {/* Delete Button */}
                                                                                            <Button
                                                                                                onClick={() => handleDeleteAppointment(apt.id)}
                                                                                                variant="destructive"
                                                                                                size="sm"
                                                                                                className="absolute top-2 right-2 h-7 px-2 text-xs bg-red-500 hover:bg-red-600 shadow-sm"
                                                                                                title="Eliminar cita"
                                                                                            >
                                                                                                <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                                                                                            </Button>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {/* Past List */}
                                                                            <div>
                                                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Anteriores</h4>
                                                                                <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
                                                                                    {getPatientHistory(selectedPatient.id).history.map(apt => (
                                                                                        <div key={apt.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm relative group">
                                                                                            <div className="flex justify-between pr-24">
                                                                                                <span className="font-medium text-gray-700">
                                                                                                    {format(parseISO(apt.date), 'dd MMM yyyy', { locale: es })}
                                                                                                </span>
                                                                                                <Badge variant="outline" className="text-[10px] h-5">
                                                                                                    {apt.status}
                                                                                                </Badge>
                                                                                            </div>
                                                                                            <div className="text-gray-500 text-xs mt-1">
                                                                                                {apt.reason === 'specific-service' ? apt.serviceName || 'Servicio Específico' : apt.reason}
                                                                                            </div>
                                                                                            {apt.notes && <div className="text-xs text-gray-400 mt-1 italic">"{apt.notes}"</div>}

                                                                                            {/* Delete Button */}
                                                                                            <Button
                                                                                                onClick={() => handleDeleteAppointment(apt.id)}
                                                                                                variant="destructive"
                                                                                                size="sm"
                                                                                                className="absolute top-2 right-2 h-7 px-2 text-xs bg-red-500 hover:bg-red-600 shadow-sm"
                                                                                                title="Eliminar registro"
                                                                                            >
                                                                                                <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                                                                                            </Button>
                                                                                        </div>
                                                                                    ))}
                                                                                    {getPatientHistory(selectedPatient.id).history.length === 0 && (
                                                                                        <p className="text-sm text-gray-400 italic text-center py-4">No hay historial previo.</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
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
                                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Paciente
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
