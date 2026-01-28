import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Clock, MapPin } from 'lucide-react';
import { format, isToday, parseISO, isThisWeek, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminOverviewProps {
    // Props removed as they are no longer used in this component
}

export const AdminOverview = ({ }: AdminOverviewProps) => {
    const { appointments, patients, hospitals } = useAppointments();

    // ... rest of code ...

    // (This replace is large if I include everything, let me narrow it down)
    // Actually, I can just replace the Interface and the Component start, 
    // AND then a second chunk for the button? No, replace_file_content is single chunk.
    // multi_replace is better.

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
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex flex-col items-center justify-center w-10 h-10 bg-white border rounded-md shadow-sm shrink-0">
                                                    <span className="text-sm font-bold text-[#1c334a]">{apt.time}</span>
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
                                                            {apt.reason === 'specific-service' ? apt.serviceName : apt.reason}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${apt.status === 'cancelled'
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : 'bg-green-50 text-green-700 border-green-100'}`}>
                                                    {apt.status === 'cancelled' ? 'Cancelada' : 'Confirmada'}
                                                </span>
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
                                            <div key={apt.id} className="flex items-start gap-2.5 pb-2 border-b last:border-0 last:pb-0">
                                                <div className="mt-1 bg-blue-50 p-1 rounded-full text-blue-600 shrink-0">
                                                    <Clock className="w-2.5 h-2.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-xs text-gray-800 truncate">{patient?.name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">
                                                        {format(parseISO(apt.date), "dd MMM", { locale: es })} • {apt.time}
                                                    </p>
                                                </div>
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
    );
};
