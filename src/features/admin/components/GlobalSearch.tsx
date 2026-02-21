
import { useState, useRef, useEffect } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { useAppointments } from "../../appointments/hooks/useAppointments";
import type { Patient, Appointment } from "../../appointments/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface GlobalSearchProps {
    onSelectPatient?: (patient: Patient) => void;
}

export const GlobalSearch = ({ onSelectPatient }: GlobalSearchProps) => {
    const { patients, appointments, hospitals } = useAppointments();
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Patient Preview Dialog State
    const [previewPatient, setPreviewPatient] = useState<Patient | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const suggestions = patients.filter((p: Patient) => {
        if (searchTerm.length < 2) return false;
        const search = searchTerm.toLowerCase();
        return (
            (p.name || '').toLowerCase().includes(search) ||
            (p.email || '').toLowerCase().includes(search)
        );
    }).slice(0, 5);

    const handleSelect = (patient: Patient) => {
        setSearchTerm("");
        setIsOpen(false);
        if (onSelectPatient) {
            onSelectPatient(patient);
        } else {
            setPreviewPatient(patient);
        }
    };

    const getPatientHospitalName = (patientId: string) => {
        // Find most recent appointment to guess hospital
        const lastAppt = appointments
            .filter((a: Appointment) => a.patientId === patientId)
            .sort((a: Appointment, b: Appointment) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (!lastAppt) return "Sin historial";
        return hospitals.find((h: any) => h.id === lastAppt.hospitalId)?.name || "Desconocido";
    };

    return (
        <div className="relative w-full max-w-xl mx-auto md:mx-0" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                    className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    placeholder="Buscar paciente global..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && searchTerm.length >= 2 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-50 border-b">
                        Resultados de búsqueda
                    </div>
                    {suggestions.map((patient: Patient) => (
                        <button
                            key={patient.id}
                            onClick={() => handleSelect(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                        >
                            <div>
                                <div className="font-medium text-[#1c334a]">{patient.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {getPatientHospitalName(patient.id)}
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                        </button>
                    ))}
                </div>
            )}

            {/* Quick Preview Dialog for Global Search */}
            <Dialog open={!!previewPatient} onOpenChange={(open) => !open && setPreviewPatient(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalle Rápido: {previewPatient?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-xs text-slate-500">Email</label>
                                <div className="font-medium">{previewPatient?.email}</div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Teléfono</label>
                                <div className="font-medium">{previewPatient?.phone}</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-2">Historial de Citas</h4>
                            <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                                {appointments
                                    .filter((a: Appointment) => a.patientId === previewPatient?.id)
                                    .sort((a: Appointment, b: Appointment) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((appt: Appointment) => (
                                        <div key={appt.id} className="p-2 text-sm flex justify-between items-center bg-white">
                                            <div>
                                                <div className="font-medium text-[#1c334a]">
                                                    {format(parseISO(appt.date), "dd MMM yyyy", { locale: es })}
                                                </div>
                                                <div className="text-xs text-gray-500">{appt.serviceName || (appt.reason === 'first-visit' ? 'Primera vez' : appt.reason === 'follow-up' ? 'Seguimiento' : appt.reason)}</div>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full capitalize ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                appt.status === 'finished' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-blue-50 text-blue-700'
                                                }`}>
                                                {appt.status === 'waiting_room' ? 'En espera' :
                                                    appt.status === 'in_progress' ? 'En consulta' :
                                                        appt.status}
                                            </div>
                                        </div>
                                    ))}
                                {appointments.filter((a: Appointment) => a.patientId === previewPatient?.id).length === 0 && (
                                    <div className="p-3 text-center text-gray-400 text-xs">Sin historial de citas</div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded text-sm text-slate-600">
                            Para ver el expediente completo o editar, por favor vaya a la pestaña <b>Pacientes</b> y busque en el hospital correspondiente.
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
