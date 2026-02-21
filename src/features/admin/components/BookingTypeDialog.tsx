import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, UserCheck, Search, ArrowLeft, ArrowRight, User } from "lucide-react";
import type { Patient } from "../../appointments/types";

interface BookingTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onNewPatient: () => void;
    onExistingPatient: (patient: Patient) => void;
    patients: Patient[];
}

export const BookingTypeDialog = ({ open, onOpenChange, onNewPatient, onExistingPatient, patients }: BookingTypeDialogProps) => {
    const [view, setView] = useState<'options' | 'search'>('options');
    const [searchTerm, setSearchTerm] = useState('');

    // Reset state on open/close
    const handleOpenChange = (val: boolean) => {
        if (!val) {
            setTimeout(() => {
                setView('options');
                setSearchTerm('');
            }, 300);
        }
        onOpenChange(val);
    };

    const isSearching = searchTerm.length >= 2;

    const displayedPatients = useMemo(() => {
        if (!isSearching) return patients; // Show all patients when not searching
        const search = searchTerm.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.email.toLowerCase().includes(search) ||
            p.phone.includes(search)
        );
    }, [patients, searchTerm, isSearching]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 pb-2 shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        {view === 'search' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 mr-1 -ml-2" onClick={() => setView('options')}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {view === 'options' ? "Agendar Cita" : "Buscar Paciente"}
                    </DialogTitle>
                    <DialogDescription>
                        {view === 'options'
                            ? "Seleccione el tipo de paciente para continuar."
                            : "Seleccione un paciente de la lista o escriba para buscar."}
                    </DialogDescription>
                </DialogHeader>

                {view === 'options' ? (
                    <div className="grid grid-cols-2 gap-4 p-4 pt-2">
                        <button
                            onClick={() => setView('search')}
                            className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-semibold text-gray-900 text-sm">Paciente Registrado</h3>
                                <p className="text-xs text-gray-500">Buscar en el directorio</p>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                handleOpenChange(false);
                                onNewPatient();
                            }}
                            className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-500/50 hover:bg-green-50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-semibold text-gray-900 text-sm">Nuevo Paciente</h3>
                                <p className="text-xs text-gray-500">Crear registro nuevo</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-6 py-2 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre, email o teléfono..."
                                    className="pl-9"
                                    autoFocus
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/50 border-t">
                            {displayedPatients.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center text-sm">
                                    <User className="w-8 h-8 opacity-20 mb-2" />
                                    No se encontraron pacientes
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 bg-white">
                                    {displayedPatients.map(patient => (
                                        <button
                                            key={patient.id}
                                            onClick={() => {
                                                handleOpenChange(false);
                                                onExistingPatient(patient);
                                            }}
                                            className="w-full text-left px-6 py-3 hover:bg-primary/5 transition-colors flex items-center justify-between group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{patient.name}</div>
                                                {isSearching && (
                                                    <div className="text-xs text-gray-500 flex gap-2 truncate">
                                                        <span>{patient.email}</span>
                                                        <span>•</span>
                                                        <span>{patient.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary shrink-0 ml-2" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
