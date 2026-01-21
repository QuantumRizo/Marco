import { useState } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar as CalendarIcon, LayoutDashboard, Users, Lock, ChevronDown, CalendarPlus, LogOut, Menu, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AdminOverview } from './AdminOverview';
import { AdminCalendar } from './AdminCalendar';
import { PatientDirectory } from './PatientDirectory';
import { AdminAppointmentDialog } from './AdminAppointmentDialog';
import { GlobalSearch } from './GlobalSearch';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
    const { hospitals, blockSlot, saveAppointment } = useAppointments();
    const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id);
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
    const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="space-y-8 bg-gray-50/30 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-[#1c334a] text-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 py-3 lg:py-4">
                    <div className="flex flex-col gap-4">
                        {/* Top Row: Logo & Mobile Toggle */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                                    <img
                                        src="/imagenes/logo.jpeg"
                                        alt="Logo Dr. Marco Alvarado"
                                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-2 border-white/20"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-lg lg:text-xl font-bold tracking-tight leading-none">Panel Médico</h1>
                                    <span className="text-[10px] lg:text-xs text-white/60 font-medium">Dr. Marco Alvarado</span>
                                </div>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden text-white hover:bg-white/10"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </Button>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Global Search - Always Visible on Mobile (Full Width), Centered on Desktop */}
                            <div className="w-full lg:flex-1 lg:max-w-xl lg:px-6 order-1 lg:order-none">
                                <GlobalSearch />
                            </div>

                            {/* Controls - Hidden on Mobile unless menu open, Visible on Desktop */}
                            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto order-2 border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0`}>
                                <div className="relative w-full lg:w-auto">
                                    <select
                                        className="w-full lg:w-64 pl-9 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer hover:bg-white/20 transition-colors"
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

                                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full lg:w-auto">
                                    <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="secondary" className="bg-red-500/90 text-white hover:bg-red-600 border-0 shadow-lg font-medium justify-start lg:justify-center">
                                                <Lock className="w-3.5 h-3.5 mr-2" />
                                                <span>Reservar Horario</span>
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

                                    <Button
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90 text-white shadow-lg gap-2 justify-start lg:justify-center"
                                        onClick={() => setIsAppointmentDialogOpen(true)}
                                    >
                                        <CalendarPlus className="w-4 h-4" />
                                        <span>Agendar Cita</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-white hover:bg-white/20 gap-2 justify-start lg:justify-center"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Cerrar Sesión</span>
                                    </Button>
                                </div>

                                <AdminAppointmentDialog
                                    selectedHospitalId={selectedHospitalId}
                                    hospitals={hospitals}
                                    onSave={saveAppointment}
                                    open={isAppointmentDialogOpen}
                                    onOpenChange={setIsAppointmentDialogOpen}
                                />
                            </div>
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
                        <AdminOverview
                            selectedHospitalId={selectedHospitalId}
                            onOpenAppointmentDialog={() => setIsAppointmentDialogOpen(true)}
                        />
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
