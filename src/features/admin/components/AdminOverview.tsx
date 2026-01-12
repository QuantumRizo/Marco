import { useAppointments } from '../../appointments/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, isToday, parseISO, isThisWeek, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminOverviewProps {
    selectedHospitalId: string;
    onOpenAppointmentDialog: () => void;
}

export const AdminOverview = ({ selectedHospitalId, onOpenAppointmentDialog }: AdminOverviewProps) => {
    const { appointments, patients, hospitals } = useAppointments();

    const hospitalName = hospitals.find(h => h.id === selectedHospitalId)?.name || 'Hospital';

    // Metrics
    const todayAppointments = appointments.filter(a =>
        a.hospitalId === selectedHospitalId &&
        isToday(parseISO(a.date)) &&
        a.status !== 'cancelled'
    );

    const activePatients = new Set(
        appointments
            .filter(a => a.hospitalId === selectedHospitalId && a.status !== 'cancelled')
            .map(a => a.patientId)
    ).size;

    // const newPatientsThisWeek = ... // Removed unused variable

    const weekAppointments = appointments.filter(a =>
        a.hospitalId === selectedHospitalId &&
        isThisWeek(parseISO(a.date)) &&
        a.status !== 'cancelled'
    );

    const totalActivePatients = new Set(
        appointments
            .filter(a => a.status !== 'cancelled')
            .map(a => a.patientId)
    ).size;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Citas Hoy
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayAppointments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {todayAppointments.length === 0 ? "Sin citas programadas" : "Pacientes agendados"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pacientes
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{totalActivePatients}</div>
                        <p className="text-xs text-muted-foreground">
                            Activos Globalmente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pacientes Activos
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activePatients}</div>
                        <p className="text-xs text-muted-foreground">
                            En {hospitalName}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Citas esta Semana
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weekAppointments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Próximos 7 días
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Acciones Rápidas
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Button size="sm" className="w-full bg-[#1c334a]" onClick={onOpenAppointmentDialog}>
                            Nueva Cita
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Today's Agenda */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Agenda de Hoy</CardTitle>
                        <CardDescription>
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todayAppointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Calendar className="h-10 w-10 mb-2 opacity-20" />
                                <p>No hay citas programadas para hoy.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map(apt => {
                                    const patient = patients.find(p => p.id === apt.patientId);
                                    return (
                                        <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white border rounded-md shadow-sm">
                                                    <span className="text-lg font-bold text-[#1c334a]">{apt.time}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{patient?.name || 'Paciente Desconocido'}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {apt.reason === 'specific-service' ? apt.serviceName : apt.reason}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {apt.status === 'confirmed' ? 'Confirmada' :
                                                        apt.status === 'pending' ? 'Pendiente' : apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity / Next Up */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Próximas Citas</CardTitle>
                        <CardDescription>
                            Siguientes en la cola
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {weekAppointments
                                .filter(a => !isToday(parseISO(a.date)) && isAfter(parseISO(a.date), new Date()))
                                .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
                                .slice(0, 5)
                                .map(apt => {
                                    const patient = patients.find(p => p.id === apt.patientId);
                                    return (
                                        <div key={apt.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                            <div className="mt-1 bg-blue-50 p-1.5 rounded-full text-blue-600">
                                                <Clock className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-800">{patient?.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(parseISO(apt.date), "dd MMM", { locale: es })} • {apt.time}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            {weekAppointments.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Sin actividad próxima.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
