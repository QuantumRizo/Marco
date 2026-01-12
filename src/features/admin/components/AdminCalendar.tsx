import { useState } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, User, Calendar, Edit2, Check } from 'lucide-react';
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

interface AdminCalendarProps {
    selectedHospitalId: string;
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

export const AdminCalendar = ({ selectedHospitalId }: AdminCalendarProps) => {
    const { appointments, patients, updateAppointmentStatus, updateAppointment, getAvailableSlots } = useAppointments();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

    // Calendar generation
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Appointments for selected hospital
    const getDayAppointments = (day: Date) => {
        return appointments.filter(a =>
            a.hospitalId === selectedHospitalId &&
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
            case 'waiting_room': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-500';
            case 'finished': return 'bg-gray-100 text-gray-800 border-gray-500';
            case 'blocked': return 'bg-gray-100 text-gray-600 border-gray-500';
            default: return 'bg-blue-50 text-blue-700 border-blue-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'waiting_room': return 'En Sala de Espera';
            case 'in_progress': return 'En Consulta';
            case 'finished': return 'Finalizada';
            case 'blocked': return 'Bloqueado';
            case 'cancelled': return 'Cancelada';
            default: return status;
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
                                                            {apt.time} - {patient?.name.split(' ')[0] || 'Cita'}
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
                                                                        {getAvailableSlots(editDate, selectedHospitalId).map(slot => (
                                                                            <option key={slot} value={slot}>{slot}</option>
                                                                        ))}
                                                                        <option value={apt.time}>{apt.time} (Actual)</option>
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
                                                                        <option value="waiting_room">En Sala de Espera</option>
                                                                        <option value="in_progress">En Consulta</option>
                                                                        <option value="finished">Finalizada</option>
                                                                        <option value="cancelled" className="text-red-600">Cancelar Cita</option>
                                                                    </select>
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
                                                                            {apt.time}
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
                                        {dayAppts.length > 3 && (
                                            <div className="text-[10px] text-gray-500 pl-1">
                                                + {dayAppts.length - 3} más
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile List View (Simplified) */}
                <div className="md:hidden space-y-4">
                    <div className="text-sm font-medium text-gray-500 uppercase px-1">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </div>
                    {/* Only show days with appointments or Today */}
                    {calendarDays.filter(day => isSameMonth(day, monthStart) && (
                        getDayAppointments(day).length > 0 || isToday(day)
                    )).map(day => {
                        const dayAppts = getDayAppointments(day);
                        return (
                            <div key={day.toISOString()} className={`rounded-lg border p-4 ${isToday(day) ? 'bg-blue-50/50 border-blue-200' : 'bg-white'}`}>
                                <div className="font-bold text-[#1c334a] mb-3 flex items-center justify-between">
                                    {format(day, "EEEE d", { locale: es })}
                                    {isToday(day) && <Badge>Hoy</Badge>}
                                </div>
                                {dayAppts.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Sin citas.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {dayAppts.map(apt => {
                                            const patient = patients.find(p => p.id === apt.patientId);
                                            return (
                                                <Dialog key={apt.id} onOpenChange={(open) => !open && cancelEditing()}>
                                                    <DialogTrigger asChild>
                                                        <div className="flex gap-3 items-center border-l-2 border-primary pl-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
                                                            <div className="text-sm font-bold text-gray-900 w-12">{apt.time}</div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium">{patient?.name}</div>
                                                                <div className="text-xs text-gray-500">{apt.reason === 'specific-service' ? apt.serviceName : (apt.reason === 'first-visit' ? 'Primera vez' : apt.reason)}</div>
                                                                <Badge variant="outline" className={`mt-1 text-[10px] ${getStatusColor(apt.status)}`}>
                                                                    {getStatusLabel(apt.status)}
                                                                </Badge>
                                                            </div>
                                                            <Edit2 className="w-4 h-4 text-gray-400" />
                                                        </div>
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
                                                                        {getAvailableSlots(editDate, selectedHospitalId).map(slot => (
                                                                            <option key={slot} value={slot}>{slot}</option>
                                                                        ))}
                                                                        <option value={apt.time}>{apt.time} (Actual)</option>
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
                                                                        <option value="waiting_room">En Sala de Espera</option>
                                                                        <option value="in_progress">En Consulta</option>
                                                                        <option value="finished">Finalizada</option>
                                                                        <option value="cancelled" className="text-red-600">Cancelar Cita</option>
                                                                    </select>
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
                                                                            {apt.time}
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
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

            </CardContent>
        </Card>
    );
};
