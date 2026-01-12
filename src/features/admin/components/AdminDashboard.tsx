import { useState } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar as CalendarIcon, LayoutDashboard, Users, Lock, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AdminOverview } from './AdminOverview';
import { AdminCalendar } from './AdminCalendar';
import { PatientDirectory } from './PatientDirectory';

export const AdminDashboard = () => {
    const { hospitals, blockSlot } = useAppointments();
    const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id);
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

    // Block Schedule State
    const [blockDate, setBlockDate] = useState('');
    const [blockTime, setBlockTime] = useState('');
    const [isBlocking, setIsBlocking] = useState(false);

    const handleBlockSlot = async () => {
        if (!blockDate || !blockTime) return;
        setIsBlocking(true);
        try {
            await blockSlot(selectedHospitalId, blockDate, blockTime);
            setBlockDate('');
            setBlockTime('');
            setIsBlockDialogOpen(false);
        } catch (error) {
            console.error("Failed to block", error);
            alert("Error al bloquear horario");
        } finally {
            setIsBlocking(false);
        }
    };

    return (
        <div className="space-y-8 bg-gray-50/30 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-[#1c334a] text-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                                    <img
                                        src="/imagenes/logo.jpeg"
                                        alt="Logo Dr. Marco Alvarado"
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight leading-none">Panel Médico</h1>
                                    <span className="text-xs text-white/60 font-medium">Dr. Marco Alvarado</span>
                                </div>
                            </div>
                        </div>

                        {/* Hospital Selector & Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <select
                                    className="w-full md:w-64 pl-9 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                                    value={selectedHospitalId}
                                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                                >
                                    {hospitals.map(h => (
                                        <option key={h.id} value={h.id} className="text-gray-900">
                                            {h.name}
                                        </option>
                                    ))}
                                </select>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                            </div>

                            <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="secondary" className="bg-red-500/90 text-white hover:bg-red-600 border-0 shadow-lg font-medium hidden md:flex">
                                        <Lock className="w-3.5 h-3.5 mr-2" />
                                        Bloquear
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-red-500" />
                                            Bloquear Horario
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Fecha</label>
                                            <Input
                                                type="date"
                                                value={blockDate}
                                                onChange={(e) => setBlockDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Hora</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={blockTime}
                                                onChange={(e) => setBlockTime(e.target.value)}
                                            >
                                                <option value="">Seleccionar hora...</option>
                                                {Array.from({ length: 10 }).map((_, i) => {
                                                    const hour = 9 + i;
                                                    const time = `${hour.toString().padStart(2, '0')}:00`;
                                                    const time30 = `${hour.toString().padStart(2, '0')}:30`;
                                                    return (
                                                        <>
                                                            <option key={time} value={time}>{time}</option>
                                                            <option key={time30} value={time30}>{time30}</option>
                                                        </>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <Button onClick={handleBlockSlot} disabled={isBlocking || !blockDate || !blockTime} className="bg-red-600 hover:bg-red-700">
                                            {isBlocking ? "Bloqueando..." : "Confirmar Bloqueo"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto lg:mx-0">
                        <TabsTrigger value="overview" className="gap-2">
                            <LayoutDashboard className="w-4 h-4" /> Tablero
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2">
                            <CalendarIcon className="w-4 h-4" /> Calendario
                        </TabsTrigger>
                        <TabsTrigger value="patients" className="gap-2">
                            <Users className="w-4 h-4" /> Pacientes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <AdminOverview selectedHospitalId={selectedHospitalId} />
                    </TabsContent>

                    <TabsContent value="calendar">
                        <AdminCalendar selectedHospitalId={selectedHospitalId} />
                    </TabsContent>

                    <TabsContent value="patients">
                        <PatientDirectory selectedHospitalId={selectedHospitalId} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
