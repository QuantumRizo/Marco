import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Clock, MapPin, Edit2, Check, Building2, User, Trash2 } from 'lucide-react';
import { format, isToday, parseISO, isThisWeek, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

interface AdminOverviewProps { }

export const AdminOverview = ({ }: AdminOverviewProps) => {
    const { appointments, patients, hospitals, updateAppointment, getAvailableSlots, deleteAppointment } = useAppointments();

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    };

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

    // Delete confirmation state
    const [apptToDelete, setApptToDelete] = useState<string | null>(null);
    const [isDeletingAppt, setIsDeletingAppt] = useState(false);

    const startEditing = (appt: any) => {
        setIsEditing(true);
        setEditDate(appt.date);
        setEditTime(appt.time);
        setSelectedAppointmentId(appt.id);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSelectedAppointmentId(null);
    };

    const saveReschedule = async () => {
        if (!selectedAppointmentId || !editDate || !editTime) return;
        try {
            await updateAppointment(selectedAppointmentId, {
                date: editDate,
                time: editTime
            });
            setIsEditing(false);
            setSelectedAppointmentId(null);
        } catch (e) {
            alert('Error al reprogramar cita');
        }
    };



    // Metric calculations for Global View

    // Metrics
    // Metrics (Global Aggregation)
    const todayAppointments = appointments.filter(a =>
        isToday(parseISO(a.date)) &&
        a.status !== 'cancelled'
    );

    const activeHospitalsCount = new Set(
        appointments.filter(a => a.status !== 'cancelled').map(a => a.hospitalId)
    ).size;

    // const newPatientsThisWeek = ... // Removed unused variable

    const weekAppointments = appointments.filter(a =>
        isThisWeek(parseISO(a.date)) &&
        a.status !== 'cancelled'
    );

    const totalActivePatients = new Set(
        appointments
            .filter(a => a.status !== 'cancelled')
            .map(a => a.patientId)
    ).size;

    return (
        <>
            <div className="space-y-4 animate-fade-in">
                {/* KPI Grid - Compact 4 Columns */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Citas Hoy
                            </CardTitle>
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                            <div className="text-xl font-bold">{todayAppointments.length}</div>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {todayAppointments.length === 0 ? "Sin citas" : "Agendadas"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Pacientes
                            </CardTitle>
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                            <div className="text-xl font-bold text-primary">{totalActivePatients}</div>
                            <p className="text-[10px] text-muted-foreground truncate">
                                Activos Globalmente
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Sedes Activas
                            </CardTitle>
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                            <div className="text-xl font-bold">{activeHospitalsCount}</div>
                            <p className="text-[10px] text-muted-foreground truncate">
                                Con actividad
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Esta Semana
                            </CardTitle>
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                            <div className="text-xl font-bold">{weekAppointments.length}</div>
                            <p className="text-[10px] text-muted-foreground truncate">
                                Próximos 7 días
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-12 items-start">
                    {/* Main Column: Toda's Agenda (Now smaller 6 cols) */}
                    <Card className="md:col-span-6 lg:col-span-6 shadow-sm flex flex-col h-full">
                        <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm">Agenda de Hoy</CardTitle>
                            <CardDescription className="text-xs">
                                {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {todayAppointments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                                    <Calendar className="h-6 w-6 mb-1 opacity-20" />
                                    <p className="text-xs">No hay citas programadas para hoy.</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {todayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map(apt => {
                                        const patient = patients.find(p => p.id === apt.patientId);
                                        return (
                                            <div key={apt.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-white border rounded-md shadow-sm shrink-0">
                                                        <span className="text-[10px] font-bold text-[#1c334a] leading-none text-center">
                                                            {formatTime(apt.time).split(' ')[0]}<br />
                                                            <span className="text-[8px] font-normal">{formatTime(apt.time).split(' ')[1]}</span>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-xs truncate">{patient?.name || 'Paciente Desconocido'}</h4>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-[10px] text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-2 h-2" />
                                                                {hospitals.find(h => h.id === apt.hospitalId)?.name}
                                                            </span>
                                                            <span className="hidden sm:inline text-gray-300">|</span>
                                                            <span className="truncate">
                                                                {apt.reason === 'specific-service' ? apt.serviceName : (
                                                                    apt.reason === 'first-visit' ? 'Primera vez' :
                                                                        apt.reason === 'follow-up' ? 'Seguimiento' :
                                                                            apt.reason
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 pl-2">
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${apt.status === 'cancelled'
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : 'bg-green-50 text-green-700 border-green-100'}`}>
                                                        {apt.status === 'cancelled' ? 'Cancelada' : 'Confirmada'}
                                                    </span>
                                                    <Dialog onOpenChange={(open) => !open && cancelEditing()}>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" className="h-7 text-xs px-2 bg-[#1c334a] text-white hover:bg-[#152738]">
                                                                Modificar
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    {isEditing ? 'Reprogramar Cita' : 'Detalles de la Cita'}
                                                                </DialogTitle>
                                                            </DialogHeader>

                                                            {isEditing && selectedAppointmentId === apt.id ? (
                                                                <div className="space-y-4 py-2">
                                                                    <div className="grid gap-2">
                                                                        <Label>Nueva Fecha</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={editDate}
                                                                            onChange={(e) => setEditDate(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Nuevo Horario</Label>
                                                                        <select
                                                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                            value={editTime}
                                                                            onChange={(e) => setEditTime(e.target.value)}
                                                                        >
                                                                            <option value="" disabled>Seleccionar hora</option>
                                                                            {getAvailableSlots(editDate, apt.hospitalId).map(slot => (
                                                                                <option key={slot} value={slot}>{formatTime(slot)}</option>
                                                                            ))}
                                                                            <option value={apt.time}>{formatTime(apt.time)} (Actual)</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2 pt-2">
                                                                        <Button variant="outline" size="sm" onClick={cancelEditing}>Cancelar</Button>
                                                                        <Button size="sm" onClick={saveReschedule} className="bg-[#1c334a]">
                                                                            <Check className="w-4 h-4 mr-2" /> Guardar Cambios
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid gap-4 py-4">
                                                                    <div className="flex items-center gap-3 bg-blue-50/50 p-2 rounded-lg border border-blue-100 mb-2">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                                            <Building2 className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-xs text-gray-500 block">Sede</span>
                                                                            <span className="text-sm font-semibold text-[#1c334a]">
                                                                                {hospitals.find(h => h.id === apt.hospitalId)?.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                                            <User className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-lg">{patient?.name}</div>
                                                                            <div className="text-sm text-gray-500">{patient?.email}</div>
                                                                            <div className="text-sm text-gray-500">{patient?.phone}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded">
                                                                            <Calendar className="w-4 h-4 text-[#1c334a]" />
                                                                            <div>
                                                                                <span className="block text-xs text-gray-400">Fecha</span>
                                                                                {format(parseISO(apt.date), "PPP", { locale: es })}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded">
                                                                            <Clock className="w-4 h-4 text-[#1c334a]" />
                                                                            <div>
                                                                                <span className="block text-xs text-gray-400">Hora</span>
                                                                                {formatTime(apt.time)}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                                                                        <span className="font-semibold text-gray-700 block mb-1">Motivo:</span>
                                                                        {apt.reason === 'specific-service' ? apt.serviceName : (apt.reason === 'first-visit' ? 'Primera vez' : apt.reason === 'follow-up' ? 'Seguimiento' : apt.reason)}
                                                                    </div>
                                                                    {apt.notes && (
                                                                        <div className="bg-yellow-50 p-3 rounded-md text-sm border border-yellow-100">
                                                                            <span className="font-semibold text-yellow-800 block mb-1">Notas:</span>
                                                                            {apt.notes}
                                                                        </div>
                                                                    )}

                                                                    {apt.status !== 'blocked' && apt.status !== 'cancelled' && (
                                                                        <Button
                                                                            variant="outline"
                                                                            className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                                            onClick={() => startEditing(apt)}
                                                                        >
                                                                            <Edit2 className="w-4 h-4 mr-2" /> Reprogramar Cita
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50"
                                                                        onClick={() => setApptToDelete(apt.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Cita
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Next Up & Hospital Stats (Wider to balance) */}
                    <div className="md:col-span-6 lg:col-span-6 space-y-4">
                        {/* Next Up */}
                        <Card className="shadow-sm">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm">Próximas Citas</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="space-y-3">
                                    {weekAppointments
                                        .filter(a => !isToday(parseISO(a.date)) && isAfter(parseISO(a.date), new Date()))
                                        .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
                                        .slice(0, 5)
                                        .map(apt => {
                                            const patient = patients.find(p => p.id === apt.patientId);
                                            return (
                                                <div key={apt.id} className="flex items-center justify-between pb-2 border-b last:border-0 last:pb-0 p-2 -mx-2 rounded hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start gap-2.5 min-w-0">
                                                        <div className="mt-1 bg-blue-50 p-1 rounded-full text-blue-600 shrink-0">
                                                            <Clock className="w-2.5 h-2.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-xs text-gray-800 truncate">{patient?.name}</p>
                                                            <p className="text-[10px] text-gray-500 truncate">
                                                                {format(parseISO(apt.date), "dd MMM", { locale: es })} • {formatTime(apt.time)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Dialog onOpenChange={(open) => !open && cancelEditing()}>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" className="h-6 text-[10px] px-2 bg-[#1c334a] text-white hover:bg-[#152738]">
                                                                Modificar
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    {isEditing ? 'Reprogramar Cita' : 'Detalles de la Cita'}
                                                                </DialogTitle>
                                                            </DialogHeader>

                                                            {isEditing && selectedAppointmentId === apt.id ? (
                                                                <div className="space-y-4 py-2">
                                                                    <div className="grid gap-2">
                                                                        <Label>Nueva Fecha</Label>
                                                                        <Input
                                                                            type="date"
                                                                            value={editDate}
                                                                            onChange={(e) => setEditDate(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Nuevo Horario</Label>
                                                                        <select
                                                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                            value={editTime}
                                                                            onChange={(e) => setEditTime(e.target.value)}
                                                                        >
                                                                            <option value="" disabled>Seleccionar hora</option>
                                                                            {getAvailableSlots(editDate, apt.hospitalId).map(slot => (
                                                                                <option key={slot} value={slot}>{formatTime(slot)}</option>
                                                                            ))}
                                                                            <option value={apt.time}>{formatTime(apt.time)} (Actual)</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="flex justify-end gap-2 pt-2">
                                                                        <Button variant="outline" size="sm" onClick={cancelEditing}>Cancelar</Button>
                                                                        <Button size="sm" onClick={saveReschedule} className="bg-[#1c334a]">
                                                                            <Check className="w-4 h-4 mr-2" /> Guardar Cambios
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid gap-4 py-4">
                                                                    <div className="flex items-center gap-3 bg-blue-50/50 p-2 rounded-lg border border-blue-100 mb-2">
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                                            <Building2 className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-xs text-gray-500 block">Sede</span>
                                                                            <span className="text-sm font-semibold text-[#1c334a]">
                                                                                {hospitals.find(h => h.id === apt.hospitalId)?.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                                            <User className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-lg">{patient?.name}</div>
                                                                            <div className="text-sm text-gray-500">{patient?.email}</div>
                                                                            <div className="text-sm text-gray-500">{patient?.phone}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded">
                                                                            <Calendar className="w-4 h-4 text-[#1c334a]" />
                                                                            <div>
                                                                                <span className="block text-xs text-gray-400">Fecha</span>
                                                                                {format(parseISO(apt.date), "PPP", { locale: es })}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded">
                                                                            <Clock className="w-4 h-4 text-[#1c334a]" />
                                                                            <div>
                                                                                <span className="block text-xs text-gray-400">Hora</span>
                                                                                {formatTime(apt.time)}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                                                                        <span className="font-semibold text-gray-700 block mb-1">Motivo:</span>
                                                                        {apt.reason === 'specific-service' ? apt.serviceName : (
                                                                            apt.reason === 'first-visit' ? 'Primera vez' :
                                                                                apt.reason === 'follow-up' ? 'Seguimiento' :
                                                                                    apt.reason
                                                                        )}
                                                                    </div>
                                                                    {apt.notes && (
                                                                        <div className="bg-yellow-50 p-3 rounded-md text-sm border border-yellow-100">
                                                                            <span className="font-semibold text-yellow-800 block mb-1">Notas:</span>
                                                                            {apt.notes}
                                                                        </div>
                                                                    )}

                                                                    {apt.status !== 'blocked' && apt.status !== 'cancelled' && (
                                                                        <Button
                                                                            variant="outline"
                                                                            className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                                            onClick={() => startEditing(apt)}
                                                                        >
                                                                            <Edit2 className="w-4 h-4 mr-2" /> Reprogramar Cita
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50"
                                                                        onClick={() => setApptToDelete(apt.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Cita
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            )
                                        })
                                    }
                                    {weekAppointments.length === 0 && (
                                        <p className="text-xs text-muted-foreground text-center py-2">Sin actividad próxima.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Consolidated Hospital Stats */}
                        <Card className="shadow-sm">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm">Estado de Sedes</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="space-y-3">
                                    {hospitals.map(hospital => {
                                        const hospitalAppts = appointments.filter(a => a.hospitalId === hospital.id && a.status !== 'cancelled');
                                        // const hospitalPatients = new Set(hospitalAppts.map(a => a.patientId)).size;
                                        const todayHospitalAppts = hospitalAppts.filter(a => isToday(parseISO(a.date))).length;

                                        return (
                                            <div key={hospital.id} className="flex items-center justify-between pb-2 border-b last:border-0 last:pb-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="p-1.5 bg-gray-100 rounded-md shrink-0">
                                                        <MapPin className="w-3 h-3 text-gray-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-medium text-gray-900 truncate">{hospital.name}</p>
                                                        <p className="text-[10px] text-gray-500 truncate">{hospital.address || 'Ubicación registrada'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-xs font-bold text-[#1c334a]">{todayHospitalAppts}</span>
                                                    <span className="text-[10px] text-gray-400">citas hoy</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={!!apptToDelete}
                onOpenChange={(open) => !open && setApptToDelete(null)}
                title="¿Eliminar Cita?"
                description="Esta acción eliminará permanentemente la cita. No se puede deshacer."
                confirmText="Eliminar Cita"
                isLoading={isDeletingAppt}
                onConfirm={async () => {
                    if (!apptToDelete) return;
                    setIsDeletingAppt(true);
                    try {
                        await deleteAppointment(apptToDelete);
                        setApptToDelete(null);
                    } catch {
                        alert('Error al eliminar la cita');
                    } finally {
                        setIsDeletingAppt(false);
                    }
                }}
            />
        </>
    );
};
