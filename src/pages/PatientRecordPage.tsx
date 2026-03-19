import { useParams, useNavigate } from 'react-router-dom';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { PatientClinicalRecord } from '@/features/admin/components/PatientClinicalRecord';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PatientRecordPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { patients, appointments, updatePatient, deleteAppointment, updateAppointment, getAvailableSlots, loading, hospitals } = useAppointments();

    if (loading) {
        return <div className="p-8 text-center text-gray-500 bg-gray-50 min-h-screen">Cargando expediente...</div>;
    }

    const patient = patients.find(p => p.id === id);

    if (!patient) {
        return (
            <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold mb-4">Paciente no encontrado</h2>
                <Button onClick={() => navigate('/admin?tab=patients')}>Volver a pacientes</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-[#1c334a] text-white p-4 shadow-md sticky top-0 z-40 flex items-center">
                <Button variant="ghost" onClick={() => navigate('/admin?tab=patients')} className="text-white hover:bg-white/10 mr-4">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver
                </Button>
                <h1 className="text-xl font-bold">Expediente Médico</h1>
            </div>
            
            <div className="container mx-auto pt-6 px-4">
                <PatientClinicalRecord
                    patient={patient}
                    appointments={appointments}
                    hospitals={hospitals}
                    onUpdatePatient={updatePatient}
                    onDeleteAppointment={deleteAppointment}
                    onUpdateAppointment={updateAppointment}
                    getAvailableSlots={getAvailableSlots}
                />
            </div>
        </div>
    );
};

export default PatientRecordPage;
