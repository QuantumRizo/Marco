import { useState, useMemo } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import type { AppointmentReason } from '../types';
import { HOSPITAL_SCHEDULES } from '../types';
import { StepHospital } from './StepHospital';
import { StepService } from './StepService';
import { StepDateTime } from './StepDateTime';
import { StepPatientInfo } from './StepPatientInfo';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export const BookingWizard = () => {
    const { hospitals, services, getAvailableSlots, saveAppointment } = useAppointments();

    const [step, setStep] = useState(1);
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>();
    const [selectedReason, setSelectedReason] = useState<AppointmentReason>();
    const [selectedServiceId, setSelectedServiceId] = useState<string>();
    const [serviceDescription, setServiceDescription] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState<string>();

    const [patientInfo, setPatientInfo] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const availableSlots = useMemo(() => {
        if (!selectedDate || !selectedHospitalId) return [];
        // Convert date to string YYYY-MM-DD for the mock logic
        const dateStr = selectedDate.toISOString().split('T')[0];
        return getAvailableSlots(dateStr, selectedHospitalId);
    }, [selectedDate, selectedHospitalId, getAvailableSlots]);

    const handleNext = () => setStep(p => p + 1);
    const handleBack = () => setStep(p => p - 1);

    const handleConfirm = async () => {
        setIsSubmitting(true);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            console.log("Starting appointment booking...");
            // Combine notes: Service Description + Patient Notes
            const combinedNotes = [
                selectedReason === 'specific-service' ? `Servicio: ${serviceDescription}` : '',
                patientInfo.notes
            ].filter(Boolean).join('\n\n');

            await saveAppointment({
                id: crypto.randomUUID(),
                hospitalId: selectedHospitalId!,
                patientId: '', // Will be assigned in hook
                serviceId: selectedServiceId, // Optional
                serviceName: selectedReason === 'specific-service' ? serviceDescription : undefined,
                reason: selectedReason!,
                date: selectedDate!.toISOString().split('T')[0],
                time: selectedTime!,
                status: 'confirmed',
                notes: combinedNotes
            }, {
                id: crypto.randomUUID(),
                ...patientInfo,
                history: []
            });

            console.log("Appointment booked successfully!");
            setIsSuccess(true);
        } catch (error: any) {
            console.error("Booking Error Detected:", error);
            // Show visible error to user
            toast.error(`Error al agendar: ${error.message || 'Error desconocido'}`);
            setIsSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-scale-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Cita Confirmada!</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Gracias {patientInfo.name}, hemos agendado tu cita para el <br />
                    <span className="font-semibold text-primary">
                        {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })} a las {selectedTime}
                    </span>.
                </p>
                <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto mb-8 text-left space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Sede:</span>
                        <span className="font-medium">{hospitals.find(h => h.id === selectedHospitalId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Motivo:</span>
                        <span className="font-medium capitalize">
                            {selectedReason === 'specific-service'
                                ? serviceDescription
                                : selectedReason?.replace('-', ' ')}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4 justify-center">
                    <Link to="/">
                        <Button variant="outline">Volver al Inicio</Button>
                    </Link>
                    {/* In a real app, maybe download receipt or add to calendar here */}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between mb-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex items-center ${i <= step ? 'text-primary' : 'text-gray-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${i <= step ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white'
                                }`}>
                                {i}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-xl shadow-lg border p-6 md:p-8 min-h-[400px]">
                {step === 1 && (
                    <StepHospital
                        hospitals={hospitals}
                        selectedHospitalId={selectedHospitalId}
                        onSelect={setSelectedHospitalId}
                        onNext={handleNext}
                    />
                )}

                {step === 2 && (
                    <StepService
                        services={services}
                        selectedReason={selectedReason}
                        selectedServiceId={selectedServiceId}
                        serviceDescription={serviceDescription}
                        onSelectReason={setSelectedReason}
                        onSelectService={setSelectedServiceId}
                        onServiceDescriptionChange={setServiceDescription}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {step === 3 && (
                    <StepDateTime
                        date={selectedDate}
                        time={selectedTime}
                        availableSlots={availableSlots}
                        onSelectDate={setSelectedDate}
                        onSelectTime={setSelectedTime}
                        onNext={handleNext}
                        onBack={handleBack}
                        allowedDays={selectedHospitalId ? HOSPITAL_SCHEDULES[selectedHospitalId]?.allowedDays : []}
                    />
                )}

                {step === 4 && (
                    <StepPatientInfo
                        info={patientInfo}
                        onChange={(field, value) => setPatientInfo(prev => ({ ...prev, [field]: value }))}
                        onSubmit={handleConfirm}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </div>
    );
};
