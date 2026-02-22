import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Appointment, Patient } from '../types';
import { HOSPITALS, SERVICES /*, HOSPITAL_SCHEDULES */ } from '../types';
import { isAppointmentPast } from '@/lib/dateUtils';

const APP_ID = 'marco'; // Hardcoded for this specific application

export const useAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
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
    }, []); // stable reference — supabase and APP_ID are module-level constants

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('realtime:appointments')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments', filter: `app_id=eq.${APP_ID}` },
                () => { fetchData(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'patients', filter: `app_id=eq.${APP_ID}` },
                () => { fetchData(); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData]); // fetchData is stable (useCallback + empty deps) — safe to include

    const saveAppointment = async (appointmentData: Partial<Appointment>, patientData: Patient) => {
        try {
            console.log("saveAppointment: Starting process for", patientData.email);

            // 1. Check patient
            let query = supabase.from('patients').select('id').eq('app_id', APP_ID); // FILTER ADDED

            if (patientData.email) {
                // Priority 1: Match by Email OR Match by Name + Phone (to avoid duplicates if they later provide email)
                const safeEmail = patientData.email.replace(/"/g, '');
                const safeName = patientData.name.replace(/"/g, '');
                const safePhone = patientData.phone.replace(/"/g, '');
                query = query.or(`email.eq."${safeEmail}",and(name.eq."${safeName}",phone.eq."${safePhone}")`);
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

            // 2. Conflict Validation (Double booking prevention)
            console.log("saveAppointment: Checking for conflicts...");
            // Combine Date + Time into ISO string for DB
            const isoDateTime = `${appointmentData.date}T${appointmentData.time}:00`;

            const { data: conflictAppointments, error: conflictError } = await supabase
                .from('appointments')
                .select('id')
                .eq('app_id', APP_ID)
                .eq('date', isoDateTime)
                .neq('status', 'cancelled');

            if (conflictError) throw conflictError;

            if (conflictAppointments && conflictAppointments.length > 0) {
                console.warn("saveAppointment: Conflict detected!");
                throw new Error("Lo sentimos, este horario acaba de ser ocupado. Por favor seleccione otro.");
            }

            // 3. Create Appointment
            console.log("saveAppointment: Creating appointment record...");
            const { error: appointmentError } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: patientId,
                    hospital_id: appointmentData.hospitalId,
                    service_id: appointmentData.serviceId || null,
                    reason: appointmentData.reason,
                    date: isoDateTime,
                    status: 'confirmed',
                    notes: appointmentData.notes,
                    app_id: APP_ID
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

    const getAvailableSlots = (date: string, _hospitalId: string) => {
        /* Commented out as part of allowing any day scheduling
        const schedule = HOSPITAL_SCHEDULES[hospitalId];
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay(); // 0-6

        if (!schedule || !schedule.allowedDays.includes(dayOfWeek)) {
            return [];
        }
        */

        const slots: string[] = [];
        const startHour = 9;
        const endHour = 20.5; // 8 PM inclusive
        const interval = 30;

        // Existing appointments for this day (GLOBAL across hospitals) from STATE
        const existingForDay = appointments.filter(a =>
            a.date === date &&
            a.status !== 'cancelled'
        );

        // Calculate now explicitly for Mexico timezone to avoid local PC issues
        const mxTimeString = new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
        const now = new Date(mxTimeString);

        const [year, month, day] = date.split('-').map(Number);

        let currentMinute = startHour * 60;
        const endMinute = endHour * 60;

        while (currentMinute < endMinute) {
            const h = Math.floor(currentMinute / 60);
            const m = currentMinute % 60;
            const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            // Skip slots in the past (compare local datetimes — no UTC conversion needed)
            const slotDateTime = new Date(year, month - 1, day, h, m);
            if (slotDateTime <= now) {
                currentMinute += interval;
                continue;
            }

            // Check if already booked/blocked
            const isBlocked = existingForDay.some(a => a.time === timeString);
            if (!isBlocked) {
                slots.push(timeString);
            }

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

            const existing = appointments.find(a => a.id === appointmentId);
            if (existing && isAppointmentPast(existing.date, existing.time)) {
                throw new Error("No se pueden eliminar citas que ya han pasado.");
            }

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

            // Conflict Validation (GLOBAL)
            const { data: conflictAppointments, error: conflictError } = await supabase
                .from('appointments')
                .select('id')
                .eq('app_id', APP_ID)
                .eq('date', isoDateTime)
                .neq('status', 'cancelled');

            if (conflictError) throw conflictError;
            if (conflictAppointments && conflictAppointments.length > 0) {
                throw new Error("Este horario ya está ocupado.");
            }

            const { error } = await supabase
                .from('appointments')
                .insert([{
                    patient_id: blockPatientId,
                    hospital_id: hospitalId,
                    reason: 'specific-service',
                    status: 'blocked',
                    date: isoDateTime,
                    notes: 'Horario Bloqueado Manualmente',
                    app_id: APP_ID
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
            const existing = appointments.find(a => a.id === appointmentId);
            if (existing && isAppointmentPast(existing.date, existing.time)) {
                throw new Error("No se puede modificar el estado de citas pasadas.");
            }

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
            const existing = appointments.find(a => a.id === appointmentId);
            if (existing && isAppointmentPast(existing.date, existing.time)) {
                throw new Error("No se pueden modificar citas que ya han finalizado.");
            }

            // Adjust payload for DB (camelCase → snake_case)
            const dbUpdates: any = {};
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.notes) dbUpdates.notes = updates.notes;
            if (updates.serviceId) dbUpdates.service_id = updates.serviceId;
            if (updates.clinicalData) dbUpdates.clinical_data = updates.clinicalData;
            if (updates.date && updates.time) {
                const newIsoDateTime = `${updates.date}T${updates.time}:00`;

                // Conflict Validation (GLOBAL)
                const { data: conflictAppointments, error: conflictError } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('app_id', APP_ID)
                    .eq('date', newIsoDateTime)
                    .neq('id', appointmentId) // Exclude current appointment
                    .neq('status', 'cancelled');

                if (conflictError) throw conflictError;
                if (conflictAppointments && conflictAppointments.length > 0) {
                    throw new Error("Este horario ya está ocupado.");
                }

                dbUpdates.date = newIsoDateTime;
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
                const safeEmail = patientData.email.replace(/"/g, '');
                const safeName = patientData.name.replace(/"/g, '');
                const safePhone = patientData.phone.replace(/"/g, '');
                query = query.or(`email.eq."${safeEmail}",and(name.eq."${safeName}",phone.eq."${safePhone}")`);
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

