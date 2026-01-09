import { useState, useMemo } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import type { Patient } from '../../appointments/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isAfter, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, MapPin, User, Calendar, Clock, FileText, ArrowRight, Phone, Mail, History } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const AdminDashboard = () => {
    const { hospitals, appointments, patients, updatePatient } = useAppointments();
    const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id);
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
            return isAfter(apptDate, today) && a.status !== 'cancelled';
        });
        const history = patientAppts.filter(a => {
            const apptDate = new Date(a.date + 'T' + a.time);
            return !isAfter(apptDate, today) || a.status === 'cancelled';
        });

        return { upcoming, history };
    };

    const handleSelectSuggestion = (suggestion: typeof globalSuggestions[0]) => {
        setSelectedHospitalId(suggestion.hospitalId);
        setSearchTerm(''); // Clear search to hide dropdown
        handleOpenPatient(suggestion.patient); // Open details immediately since search is cleared
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1c334a]">Gestion de Pacientes</h1>
                    <p className="text-gray-500 mt-1">Hospital: {hospitals.find(h => h.id === selectedHospitalId)?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1c334a] text-white flex items-center justify-center font-bold text-lg">DM</div>
                </div>
            </div>

            {/* Controls: Hospital Tabs & Search */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Hospital Tabs */}
                    <div className="bg-white p-1 rounded-lg border shadow-sm inline-flex overflow-x-auto">
                        {hospitals.map(hospital => (
                            <button
                                key={hospital.id}
                                onClick={() => setSelectedHospitalId(hospital.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${selectedHospitalId === hospital.id
                                    ? 'bg-[#1c334a] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <MapPin className="w-4 h-4" />
                                {hospital.name}
                            </button>
                        ))}
                    </div>

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
                </div>

                {/* PATIENTS TABLE */}
                <Card>
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
                                    <TableRow>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Expediente</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPatients.map((patient) => {
                                        const { upcoming, history } = getPatientHistory(patient.id);
                                        const nextAppt = upcoming[0];

                                        return (
                                            <TableRow key={patient.id} className="group">
                                                <TableCell>
                                                    <div className="font-medium text-[#1c334a] text-lg">{patient.name}</div>
                                                    {nextAppt && (
                                                        <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
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
                                                        <Badge variant="outline" className="text-xs">
                                                            {upcoming.length} Pendientes
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {history.length} Históricas
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="bg-[#1c334a] hover:bg-[#2a4560]"
                                                                onClick={() => handleOpenPatient(patient)}
                                                            >
                                                                Ver Historial
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl">Expediente Clínico</DialogTitle>
                                                            </DialogHeader>

                                                            {selectedPatient && (
                                                                <div className="grid gap-6 py-4">
                                                                    {/* Patient Header */}
                                                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                                                                        <div className="w-16 h-16 rounded-full bg-[#1c334a] text-white flex items-center justify-center text-2xl font-bold">
                                                                            {selectedPatient.name.charAt(0)}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h2 className="text-2xl font-bold text-[#1c334a]">{selectedPatient.name}</h2>
                                                                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                                                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedPatient.phone}</span>
                                                                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedPatient.email}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid md:grid-cols-2 gap-6">
                                                                        {/* Left Col: Notes */}
                                                                        <div className="space-y-3">
                                                                            <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                                                                <FileText className="w-5 h-5" /> Notas Clínicas
                                                                            </h3>
                                                                            <textarea
                                                                                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c334a]"
                                                                                placeholder="Escribir notas de seguimiento..."
                                                                                value={noteText}
                                                                                onChange={(e) => setNoteText(e.target.value)}
                                                                            />
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
                                                                                    <h4 className="text-xs font-bold text-green-700 uppercase mb-2">Próximas</h4>
                                                                                    {getPatientHistory(selectedPatient.id).upcoming.map(apt => (
                                                                                        <div key={apt.id} className="p-3 bg-green-50 border border-green-100 rounded-lg mb-2 text-sm">
                                                                                            <div className="font-bold text-green-900">
                                                                                                {format(parseISO(apt.date), 'dd MMM yyyy', { locale: es })} - {apt.time}
                                                                                            </div>
                                                                                            <div className="text-green-800">{hospitals.find(h => h.id === apt.hospitalId)?.name}</div>
                                                                                            <div className="text-xs text-green-700 mt-1">{apt.reason === 'specific-service' ? apt.serviceName || 'Servicio Específico' : apt.reason}</div>
                                                                                            {apt.notes && <div className="text-xs text-gray-500 mt-1 italic">"{apt.notes}"</div>}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {/* Past List */}
                                                                            <div>
                                                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Anteriores</h4>
                                                                                <div className="max-h-[200px] overflow-y-auto space-y-2">
                                                                                    {getPatientHistory(selectedPatient.id).history.map(apt => (
                                                                                        <div key={apt.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm">
                                                                                            <div className="flex justify-between">
                                                                                                <span className="font-medium">
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
                                                                                        </div>
                                                                                    ))}
                                                                                    {getPatientHistory(selectedPatient.id).history.length === 0 && (
                                                                                        <p className="text-sm text-gray-400 italic">No hay historial previo.</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
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
        </div>
    );
};
