import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, Patient } from '../types';
import { HOSPITALS, SERVICES, HOSPITAL_SCHEDULES } from '../types';

const APP_ID = 'marco'; // Hardcoded for this specific application

export const useAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch Appointments - FILTERED BY APP_ID
            // Mapping DB columns snake_case to camelCase manually for now to match UI types
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from('appointments')
                .select('*')
                .eq('app_id', APP_ID); // FILTER ADDED

            if (appointmentsError) throw appointmentsError;

            const mappedAppointments: Appointment[] = (appointmentsData || []).map((a: any) => {
                // Handle Date/Time extraction treating UTC as "Clinic Wall Clock"
                // DB Format: "YYYY-MM-DD HH:MM:SS+00" or ISO
                let dateStr = a.date;
                let timeStr = "";

                if (dateStr.includes('T')) {
                    const parts = dateStr.split('T');
                    dateStr = parts[0];
                    timeStr = parts[1].substring(0, 5); // Extract HH:MM
                } else if (dateStr.includes(' ')) {
                    const parts = dateStr.split(' ');
                    dateStr = parts[0];
                    timeStr = parts[1].substring(0, 5); // Extract HH:MM
                }

                return {
                    id: a.id,
                    hospitalId: a.hospital_id,
                    serviceId: a.service_id,
                    patientId: a.patient_id,
                    reason: a.reason,
                    date: dateStr,
                    time: timeStr,
                    status: a.status,
                    serviceName: a.service_name,
                    notes: a.notes,
                    clinicalData: a.clinical_data,
                    appId: a.app_id
                };
            });

            // Fetch Patients - FILTERED BY APP_ID
            const { data: patientsData, error: patientsError } = await supabase
                .from('patients')
                .select('*')
                .eq('app_id', APP_ID); // FILTER ADDED

            if (patientsError) throw patientsError;

            const mappedPatients = (patientsData || []).map((p: any) => ({
                ...p,
                medicalHistory: p.medical_history, // JSONB from DB
                appId: p.app_id
            }));

            setAppointments(mappedAppointments);
            setPatients(mappedPatients as Patient[] || []);

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

            // 1. Check patient
            let query = supabase.from('patients').select('id').eq('app_id', APP_ID); // FILTER ADDED

            if (patientData.email) {
                // Priority 1: Match by Email
                query = query.eq('email', patientData.email);
            } else {
                // Priority 2: Match by Name + Phone (Exact Match)
                query = query.eq('name', patientData.name).eq('phone', patientData.phone);
            }

            const { data: existingPatient, error: searchError } = await query.maybeSingle();

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
                        phone: patientData.phone,
                        email: patientData.email || null // Update email if provided, or set to null if empty
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
                        email: patientData.email || null, // EXPLICITLY NULL if empty string
                        phone: patientData.phone,
                        // notes: patientData.notes,
                        app_id: APP_ID // APP_ID ADDED
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
                    notes: appointmentData.notes, // Saving the combined notes here
                    app_id: APP_ID // APP_ID ADDED
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
                .update({
                    notes: patient.notes,
                    medical_history: patient.medicalHistory
                })
                .eq('id', patient.id);

            if (error) throw error;
            await fetchData(); // Refresh to show updates
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

    const getAvailableSlots = (date: string, hospitalId: string) => {
        // Find hospital schedule
        const schedule = HOSPITAL_SCHEDULES[hospitalId];

        // Parse date to check day of week
        // date string is YYYY-MM-DD
        const [year, month, day] = date.split('-').map(Number);
        // helper to get day of week for YYYY-MM-DD safely
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay(); // 0-6

        // If day not allowed for this hospital, return empty
        if (!schedule || !schedule.allowedDays.includes(dayOfWeek)) {
            return [];
        }

        const slots: string[] = [];
        const startHour = 9;
        const endHour = 20.5; // 8 PM inclusive
        const interval = 30;

        // Existing appointments for this day and hospital from STATE
        const existingForDay = appointments.filter(a =>
            a.date === date &&
            a.hospitalId === hospitalId &&
            a.status !== 'cancelled'
        );

        let currentMinute = startHour * 60;
        const endMinute = endHour * 60;

        while (currentMinute < endMinute) {
            const h = Math.floor(currentMinute / 60);
            const m = currentMinute % 60;
            // Deterministic HH:MM format
            const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            // Check if blocked
            const isBlocked = existingForDay.some(a => a.time === timeString);

            if (!isBlocked) {
                slots.push(timeString);
            }

            // Add 30 minutes
            currentMinute += interval;
        }

        return slots;
    };

    const getAppointmentsByHospital = (hospitalId: string) => {
        return appointments.filter(a => a.hospitalId === hospitalId);
    };

    const deleteAppointment = async (appointmentId: string) => {
        try {
            console.log("deleteAppointment: Deleting", appointmentId);
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', appointmentId);

            if (error) throw error;
            await fetchData();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    };

    const deletePatient = async (patientId: string) => {
        try {
            console.log("deletePatient: Deleting patient", patientId);
            // 1. Delete all appointments first (handled by cascade usually, but manual here for safety)
            const { error: apptError } = await supabase
                .from('appointments')
                .delete()
                .eq('patient_id', patientId);

            if (apptError) throw apptError;

            // 2. Delete patient
            const { error: patientError } = await supabase
                .from('patients')
                .delete()
                .eq('id', patientId);
            if (patientError) throw patientError;

            await fetchData();
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    };

    const blockSlot = async (hospitalId: string, date: string, time: string) => {
        try {
            // Check if patient "System Block" exists, if not create it
            let blockPatientId;
            const { data: existingBlockPatient } = await supabase
                .from('patients')
                .select('id')
                .eq('email', 'system@block.com')
                .eq('app_id', APP_ID) // FILTER ADDED
                .maybeSingle();

            if (existingBlockPatient) {
                blockPatientId = existingBlockPatient.id;
            } else {
                const { data: newBlockPatient, error: createError } = await supabase
                    .from('patients')
                    .insert([{
                        name: 'BLOQUEO DE HORARIO',
                        email: 'system@block.com',
                        phone: '0000000000',
                        notes: 'Usuario sistema para bloqueos',
                        app_id: APP_ID // APP_ID ADDED
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                blockPatientId = newBlockPatient.id;
            }

            const isoDateTime = `${date}T${time}:00`;

            const { error } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: blockPatientId,
                    hospital_id: hospitalId,
                    reason: 'specific-service',
                    status: 'blocked',
                    date: isoDateTime,
                    notes: 'Horario Bloqueado Manualmente',
                    app_id: APP_ID // APP_ID ADDED
                }]);

            if (error) throw error;
            await fetchData();

        } catch (error) {
            console.error('Error blocking slot:', error);
            throw error;
        }
    };

    const updateAppointmentStatus = async (appointmentId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', appointmentId);

            if (error) throw error;
            await fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    };

    const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
        try {
            // If date/time is updated, we need to construct the ISO string
            let updatePayload: any = { ...updates };

            if (updates.date && updates.time) {
                updatePayload.date = `${updates.date}T${updates.time}:00`;
                delete updatePayload.time; // Remove UI-only time field
            } else if (updates.date) {
                // Changing date but keeping time? Need to fetch original time.
                // For simplicity, we assume generic update passes both if datetime changes.
                // Or we can just trust the caller passes valid 'date' column string if they mapped it back.
                // But our mapper splits them. 
                // Let's assume the caller will pass 'date' as YYYY-MM-DD and 'time' as HH:MM if they want to reschedule.
                // Actually the DB column is 'date' (timestamp).
            }

            // Adjust payload for DB
            // updates comes with camelCase, we might need snake_case if using exact row update
            // But our 'saveAppointment' does manual mapping. 
            // Let's handle just status/notes/date/time for simplified logic
            const dbUpdates: any = {};
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.notes) dbUpdates.notes = updates.notes;
            if (updates.serviceId) dbUpdates.service_id = updates.serviceId;
            if (updates.clinicalData) dbUpdates.clinical_data = updates.clinicalData;
            if (updates.date && updates.time) {
                dbUpdates.date = `${updates.date}T${updates.time}:00`;
            }

            const { error } = await supabase
                .from('appointments')
                .update(dbUpdates)
                .eq('id', appointmentId);

            if (error) throw error;
            await fetchData();
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    };

    const addPatient = async (patientData: { name: string, email: string, phone: string, notes?: string }) => {
        try {
            setLoading(true);
            // 1. Check if patient exists
            let query = supabase.from('patients').select('id').eq('app_id', APP_ID); // FILTER ADDED

            if (patientData.email) {
                query = query.eq('email', patientData.email);
            } else {
                query = query.eq('name', patientData.name).eq('phone', patientData.phone);
            }

            const { data: existingPatient, error: searchError } = await query.maybeSingle();

            if (searchError) throw searchError;

            if (existingPatient) {
                // If exists, inform the user
                throw new Error(patientData.email
                    ? "El paciente ya está registrado con este correo."
                    : "Ya existe un paciente con este nombre y teléfono.");
            }

            // 2. Create new patient
            const { data: newPatient, error: createError } = await supabase
                .from('patients')
                .insert([{
                    name: patientData.name,
                    email: patientData.email || null, // Convert empty string to null
                    phone: patientData.phone,
                    notes: patientData.notes || '',
                    app_id: APP_ID // APP_ID ADDED
                }])
                .select()
                .single();

            if (createError) throw createError;

            await fetchData(); // Refresh list
            return newPatient;

        } catch (error) {
            console.error("Error adding patient:", error);
            throw error;
        } finally {
            setLoading(false);
        }
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
        deleteAppointment,
        deletePatient,
        updateAppointmentStatus,
        updateAppointment,
        blockSlot,
        addPatient,
        loading
    };
};

