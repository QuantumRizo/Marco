import { useState } from 'react';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Calendar } from 'lucide-react';
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

interface AdminCalendarProps {
    selectedHospitalId: string;
}

export const AdminCalendar = ({ selectedHospitalId }: AdminCalendarProps) => {
    const { appointments, patients, hospitals } = useAppointments();
    const [currentDate, setCurrentDate] = useState(new Date());
    // const [selectedDay, setSelectedDay] = useState<Date | null>(null); // Removed unused state

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
                                // onClick={() => setSelectedDay(day)} // Removed unused handler
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
                                                <Dialog key={apt.id}>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            className={`
                                                                text-[10px] text-left px-1.5 py-1 rounded truncate w-full border-l-2 font-medium transition-all hover:brightness-95
                                                                ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-500' :
                                                                    apt.status === 'blocked' ? 'bg-gray-100 text-gray-600 border-gray-500' :
                                                                        'bg-blue-50 text-blue-700 border-blue-400'}
                                                            `}
                                                            onClick={(e) => e.stopPropagation()} // Prevent opening day view if we have a direct detail view? Actually let's just use the day view for now
                                                        >
                                                            {apt.time} - {patient?.name.split(' ')[0] || 'Cita'}
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Detalles de la Cita</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                                    <User className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold">{patient?.name}</div>
                                                                    <div className="text-sm text-gray-500">{patient?.email}</div>
                                                                    <div className="text-sm text-gray-500">{patient?.phone}</div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {format(parseISO(apt.date), "PPP", { locale: es })}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <Clock className="w-4 h-4" />
                                                                    {apt.time}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                                                    <MapPin className="w-4 h-4" />
                                                                    {hospitals.find(h => h.id === apt.hospitalId)?.name}
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-md text-sm">
                                                                <span className="font-semibold text-gray-700 block mb-1">Motivo:</span>
                                                                {apt.reason === 'specific-service' ? apt.serviceName : apt.reason}
                                                            </div>
                                                            {apt.notes && (
                                                                <div className="bg-yellow-50 p-3 rounded-md text-sm border border-yellow-100">
                                                                    <span className="font-semibold text-yellow-800 block mb-1">Notas:</span>
                                                                    {apt.notes}
                                                                </div>
                                                            )}
                                                        </div>
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
                                                <div key={apt.id} className="flex gap-3 items-start border-l-2 border-primary pl-3">
                                                    <div className="text-sm font-bold text-gray-900 w-12">{apt.time}</div>
                                                    <div>
                                                        <div className="text-sm font-medium">{patient?.name}</div>
                                                        <div className="text-xs text-gray-500">{apt.reason === 'specific-service' ? apt.serviceName : apt.reason}</div>
                                                    </div>
                                                </div>
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
