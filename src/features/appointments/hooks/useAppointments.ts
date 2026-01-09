import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, Patient } from '../types';
import { HOSPITALS, SERVICES } from '../types';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch Appointments
            // Mapping DB columns snake_case to camelCase manually for now to match UI types
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from('appointments')
                .select('*');

            if (appointmentsError) throw appointmentsError;

            const mappedAppointments: Appointment[] = (appointmentsData || []).map(a => ({
                id: a.id,
                hospitalId: a.hospital_id,
                serviceId: a.service_id,
                patientId: a.patient_id,
                reason: a.reason,
                date: a.date.split('T')[0], // Extract YYYY-MM-DD
                time: new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // Extract HH:MM
                status: a.status,
                serviceName: a.service_name, // Optional if we add this to DB or join
                notes: a.notes // Fetching the notes where we saved the custom description
            }));

            // Fetch Patients
            const { data: patientsData, error: patientsError } = await supabase
                .from('patients')
                .select('*');

            if (patientsError) throw patientsError;

            setAppointments(mappedAppointments);
            setPatients(patientsData as Patient[] || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Optional: Realtime subscription could go here
    }, []);

    const saveAppointment = async (appointmentData: Partial<Appointment>, patientData: Patient) => {
        try {
            console.log("saveAppointment: Starting process for", patientData.email);

            // 1. Check patient by email
            const { data: existingPatient, error: searchError } = await supabase
                .from('patients')
                .select('id')
                .eq('email', patientData.email)
                .maybeSingle(); // Use maybeSingle to avoid 406/PGRST116 error if not found

            if (searchError) {
                console.error("saveAppointment: Error searching patient", searchError);
                throw searchError;
            }

            let patientId = existingPatient?.id;
            console.log("saveAppointment: Patient check result:", patientId ? "Found" : "Not Found");

            if (patientId) {
                // Update existing patient info (Name/Phone may have changed)
                console.log("saveAppointment: Updating existing patient...", patientId);
                const { error: updateError } = await supabase
                    .from('patients')
                    .update({
                        name: patientData.name,
                        phone: patientData.phone
                    })
                    .eq('id', patientId);

                if (updateError) {
                    console.error("saveAppointment: Error updating patient", updateError);
                    throw updateError;
                }
            } else {
                // Create new patient
                console.log("saveAppointment: Creating new patient...");
                const { data: newPatient, error: createError } = await supabase
                    .from('patients')
                    .insert([{
                        name: patientData.name,
                        email: patientData.email,
                        phone: patientData.phone,
                        notes: patientData.notes
                    }])
                    .select()
                    .single();

                if (createError) {
                    console.error("saveAppointment: Error creating patient", createError);
                    throw createError;
                }
                patientId = newPatient.id;
                console.log("saveAppointment: New patient created:", patientId);
            }

            // 2. Create Appointment
            console.log("saveAppointment: Creating appointment record...");
            // Combine Date + Time into ISO string for DB
            const isoDateTime = `${appointmentData.date}T${appointmentData.time}:00`;

            const { error: appointmentError } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: patientId,
                    hospital_id: appointmentData.hospitalId,
                    service_id: appointmentData.serviceId || null, // Ensure null if undefined
                    reason: appointmentData.reason,
                    date: isoDateTime,
                    status: 'confirmed',
                    notes: appointmentData.notes // Saving the combined notes here
                }]);

            if (appointmentError) {
                console.error("saveAppointment: Error creating appointment", appointmentError);
                throw appointmentError;
            }

            // Refresh state
            console.log("saveAppointment: Success! Refreshing data...");
            await fetchData();
            return true;

        } catch (error) {
            console.error('Error saving appointment:', error);
            throw error;
        }
    };

    const updatePatient = async (patient: Patient) => {
        try {
            const { error } = await supabase
                .from('patients')
                .update({ notes: patient.notes })
                .eq('id', patient.id);

            if (error) throw error;
            await fetchData(); // Refresh to show updates
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

    const getAvailableSlots = (date: string, hospitalId: string) => {
        // Generate slots every 90 minutes starting from 9:00 AM to 6:00 PM
        const slots: string[] = [];
        const startHour = 9;
        const endHour = 18;

        // Existing appointments for this day and hospital from STATE
        const existingForDay = appointments.filter(a =>
            a.date === date &&
            a.hospitalId === hospitalId &&
            a.status !== 'cancelled'
        );

        let currentTime = new Date(`2000-01-01T${startHour.toString().padStart(2, '0')}:00:00`);
        const endTime = new Date(`2000-01-01T${endHour.toString().padStart(2, '0')}:00:00`);

        while (currentTime < endTime) {
            const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            // Check if blocked
            const isBlocked = existingForDay.some(a => a.time === timeString);

            if (!isBlocked) {
                slots.push(timeString);
            }

            // Add 90 minutes
            currentTime.setMinutes(currentTime.getMinutes() + 90);
        }

        return slots;
    };

    const getAppointmentsByHospital = (hospitalId: string) => {
        return appointments.filter(a => a.hospitalId === hospitalId);
    };

    return {
        appointments,
        patients,
        saveAppointment,
        getAvailableSlots,
        getAppointmentsByHospital,
        hospitals: HOSPITALS,
        services: SERVICES,
        updatePatient,
        loading
    };
};
