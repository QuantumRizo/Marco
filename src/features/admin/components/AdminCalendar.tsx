import { useState } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, User, Calendar, Edit2, Check, Building2 } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    parseISO,
    isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";

// No props needed for Global View
interface AdminCalendarProps {
}

interface Appointment {
    id: string;
    date: string;
    time: string;
    status: string;
    patientId: string;
    reason: string;
    serviceName?: string;
    notes?: string;
}

export const AdminCalendar = (_props: AdminCalendarProps) => {
    const { appointments, patients, hospitals, updateAppointmentStatus, updateAppointment, getAvailableSlots } = useAppointments();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return format(date, 'h:mm a', { locale: es });
    };

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

    // Calendar generation
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es, weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { locale: es, weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Appointments for selected hospital
    const getDayAppointments = (day: Date) => {
        return appointments.filter(a =>
            isSameDay(parseISO(a.date), day) &&
            a.status !== 'cancelled'
        ).sort((a, b) => a.time.localeCompare(b.time));
    };

    const handleStatusChange = async (apptId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value;
        try {
            await updateAppointmentStatus(apptId, newStatus);
        } catch (e) {
            alert('Error al actualizar estado');
        }
    };

    const startEditing = (appt: Appointment) => {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-500';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-500';
            case 'blocked': return 'bg-gray-100 text-gray-600 border-gray-500';
            default: return 'bg-green-100 text-green-800 border-green-500'; // Default everything else to confirmed visual
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'cancelled': return 'Cancelada';
            case 'blocked': return 'Bloqueado';
            default: return 'Confirmada'; // Map legacy statuses to Confirmada
        }
    };

    return (
        <Card className="h-full border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-4 space-y-4 md:space-y-0">
                <CardTitle className="text-xl font-bold capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </CardTitle>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>Hoy</Button>
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 md:p-6">

                {/* Desktop Calendar Grid */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-7 bg-gray-50 border-b">
                        {weekDays.map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 auto-rows-[120px]">
                        {calendarDays.map((day, idx) => {
                            const dayAppts = getDayAppointments(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`
                                        border-b border-r p-2 transition-colors hover:bg-gray-50/50 flex flex-col gap-1 relative overflow-hidden
                                        ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-400' : 'bg-white'}
                                        ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                                        ${isToday(day) ? 'bg-blue-50/30' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                                            ${isToday(day) ? 'bg-[#1c334a] text-white' : ''}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayAppts.length > 0 && (
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                {dayAppts.length}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-full no-scrollbar">
                                        {dayAppts.slice(0, 3).map(apt => {
                                            const patient = patients.find(p => p.id === apt.patientId);
                                            return (
                                                <Dialog key={apt.id} onOpenChange={(open) => !open && cancelEditing()}>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            className={`
                                                                text-[10px] text-left px-1.5 py-1 rounded truncate w-full border-l-2 font-medium transition-all hover:brightness-95
                                                                ${getStatusColor(apt.status)}
                                                            `}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] font-bold bg-[#1c334a]/10 text-[#1c334a] px-1 rounded uppercase">
                                                                    {hospitals.find(h => h.id === apt.hospitalId)?.name.substring(0, 3)}
                                                                </span>
                                                                {formatTime(apt.time)} - {patient?.name.split(' ')[0] || 'Cita'}
                                                            </div>
                                                        </button>
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
                                                                {/* Status Selector */}
                                                                <div className="full-w bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-slate-700">Estado Actual:</span>
                                                                    <select
                                                                        className="h-8 w-[180px] rounded-md border border-input bg-white px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                                        value={apt.status}
                                                                        onChange={(e) => handleStatusChange(apt.id, e)}
                                                                        disabled={apt.status === 'blocked'}
                                                                    >
                                                                        <option value="confirmed">Confirmada</option>
                                                                        <option value="cancelled" className="text-red-600">Cancelar Cita</option>
                                                                    </select>
                                                                </div>

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
                                                                    {apt.reason === 'specific-service' ? apt.serviceName : (apt.reason === 'first-visit' ? 'Primera vez' : apt.reason)}
                                                                </div>
                                                                {apt.notes && (
                                                                    <div className="bg-yellow-50 p-3 rounded-md text-sm border border-yellow-100">
                                                                        <span className="font-semibold text-yellow-800 block mb-1">Notas:</span>
                                                                        {apt.notes}
                                                                    </div>
                                                                )}

                                                                {/* Edit Button */}
                                                                {apt.status !== 'blocked' && apt.status !== 'cancelled' && (
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                                        onClick={() => startEditing(apt)}
                                                                    >
                                                                        <Edit2 className="w-4 h-4 mr-2" /> Reprogramar Cita
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            );
                                        })}
                                    </div>
                                    {dayAppts.length > 3 && (
                                        <button
                                            className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-[#1c334a] text-white text-[10px] font-bold shadow-md hover:bg-[#152738] transition-all z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDay(day);
                                            }}
                                        >
                                            +{dayAppts.length - 3}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Dialog for Viewing All Appointments on a specific day */}
                <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                Citas del {selectedDay && format(selectedDay, "d 'de' MMMM", { locale: es })}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
                            {selectedDay && getDayAppointments(selectedDay).map(apt => {
                                const patient = patients.find(p => p.id === apt.patientId);
                                return (
                                    <div
                                        key={apt.id}
                                        className="p-3 flex gap-3 items-center hover:bg-gray-50 transition-colors cursor-pointer border rounded-lg active:bg-gray-100"
                                        onClick={() => {
                                            setSelectedDay(null); // Close day view
                                            startEditing(apt); // Open edit/detail view
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center min-w-[3.5rem] py-1 bg-gray-100 rounded text-gray-700 font-bold text-sm">
                                            {formatTime(apt.time).split(' ')[0]}
                                            <span className="text-[10px] font-normal text-gray-500">{formatTime(apt.time).split(' ')[1]}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
                                                {patient?.name}
                                                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100">
                                                    {hospitals.find(h => h.id === apt.hospitalId)?.name}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                <span className="truncate max-w-[150px]">
                                                    {apt.reason === 'specific-service' ? apt.serviceName : (apt.reason === 'first-visit' ? 'Primera vez' : apt.reason)}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <Badge variant="outline" className={`text-[9px] h-4 px-1 ${getStatusColor(apt.status)} border-0`}>
                                                    {getStatusLabel(apt.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Mobile List View */}
                <div className="md:hidden space-y-6 pb-20">
                    <div className="sticky top-0 bg-white/95 backdrop-blur z-30 py-3 px-1 border-b shadow-sm flex justify-between items-center">
                        <div className="text-lg font-bold text-[#1c334a]">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                            {format(currentDate, 'yyyy', { locale: es })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {calendarDays.filter(day => isSameMonth(day, monthStart) && (getDayAppointments(day).length > 0 || isToday(day))).map(day => {
                            const dayAppts = getDayAppointments(day);
                            const isCurrentDay = isToday(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`rounded-xl border shadow-sm overflow-hidden ${isCurrentDay ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100 bg-white'}`}
                                >
                                    <div className={`px-4 py-2 border-b flex justify-between items-center ${isCurrentDay ? 'bg-blue-100/50' : 'bg-gray-50/50'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-700 capitalize">
                                                {format(day, "EEEE d", { locale: es })}
                                            </span>
                                            {isCurrentDay && (
                                                <Badge variant="default" className="text-[10px] h-5 bg-blue-600">Hoy</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{dayAppts.length} citas</span>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {dayAppts.length === 0 ? (
                                            <div className="p-6 text-center text-gray-400 italic text-sm">
                                                No hay citas programadas para hoy.
                                            </div>
                                        ) : (
                                            dayAppts.map(apt => {
                                                const patient = patients.find(p => p.id === apt.patientId);
                                                return (
                                                    <Dialog key={apt.id} onOpenChange={(open) => !open && cancelEditing()}>
                                                        <DialogTrigger asChild>
                                                            <div className="p-3 flex gap-3 items-center hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100">
                                                                <div className="flex flex-col items-center justify-center min-w-[3.5rem] py-1 bg-gray-100 rounded text-gray-700 font-bold text-sm">
                                                                    {formatTime(apt.time).split(' ')[0]}
                                                                    <span className="text-[10px] font-normal text-gray-500">{formatTime(apt.time).split(' ')[1]}</span>
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
                                                                        {patient?.name}
                                                                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-100">
                                                                            {hospitals.find(h => h.id === apt.hospitalId)?.name}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                                        <span className="truncate max-w-[150px]">
                                                                            {apt.reason === 'specific-service' ? apt.serviceName : (apt.reason === 'first-visit' ? 'Primera vez' : apt.reason)}
                                                                        </span>
                                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                        <Badge variant="outline" className={`text-[9px] h-4 px-1 ${getStatusColor(apt.status)} border-0`}>
                                                                            {getStatusLabel(apt.status)}
                                                                        </Badge>
                                                                    </div>
                                                                </div>

                                                                <Edit2 className="w-4 h-4 text-gray-300" />
                                                            </div>
                                                        </DialogTrigger>

                                                        {/* Reuse existing Desktop Modal Content Logic */}
                                                        <DialogContent className="sm:max-w-[425px] max-w-[95%] rounded-lg">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    {isEditing ? 'Reprogramar Cita' : 'Detalles de la Cita'}
                                                                </DialogTitle>
                                                            </DialogHeader>

                                                            {isEditing && selectedAppointmentId === apt.id ? (
                                                                <div className="space-y-4 py-2">
                                                                    {/* ... reuse existing edit form logic ... */}
                                                                    <div className="grid gap-2">
                                                                        <Label>Nueva Fecha</Label>
                                                                        <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label>Nuevo Horario</Label>
                                                                        <select
                                                                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
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
                                                                            <Check className="w-4 h-4 mr-2" /> Guardar
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid gap-4 py-2">
                                                                    {/* ... reuse existing view detail logic ... */}
                                                                    <div className="full-w bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-slate-700">Estado:</span>
                                                                        <select
                                                                            className="h-8 w-auto rounded-md border border-input bg-white px-2 py-1 text-xs"
                                                                            value={apt.status}
                                                                            onChange={(e) => handleStatusChange(apt.id, e)}
                                                                            disabled={apt.status === 'blocked'}
                                                                        >
                                                                            <option value="confirmed">Confirmada</option>
                                                                            <option value="waiting_room">En Sala</option>
                                                                            <option value="in_progress">En Consulta</option>
                                                                            <option value="finished">Finalizada</option>
                                                                            <option value="cancelled">Cancelar</option>
                                                                        </select>
                                                                    </div>

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
                                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                                            <User className="w-5 h-5" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="font-bold text-base truncate">{patient?.name}</div>
                                                                            <div className="text-sm text-gray-500 truncate">{patient?.phone}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                                                                        <span className="font-semibold text-gray-700 block mb-1">Motivo:</span>
                                                                        {apt.reason === 'specific-service' ? apt.serviceName : (apt.reason === 'first-visit' ? 'Primera vez' : apt.reason)}
                                                                    </div>

                                                                    {apt.status !== 'blocked' && apt.status !== 'cancelled' && (
                                                                        <Button
                                                                            variant="outline"
                                                                            className="w-full mt-2"
                                                                            onClick={() => startEditing(apt)}
                                                                        >
                                                                            <Edit2 className="w-4 h-4 mr-2" /> Reprogramar
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};
