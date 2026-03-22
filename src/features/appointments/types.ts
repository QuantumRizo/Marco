
export interface Hospital {
    id: string;
    name: string;
    address: string;
    image: string;
}

export type AppointmentReason = 'first-visit' | 'follow-up' | 'specific-service' | 'blocked';

export interface Service {
    id: string;
    name: string;
    description?: string;
    durationMinutes: number; // default 90 (1.5h)
    price?: number;
}

export interface MedicalHistory {
    // Datos Generales
    sex?: 'Masculino' | 'Femenino';
    dateOfBirth?: string; // YYYY-MM-DD
    maritalStatus?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión Libre';
    spouseName?: string;
    homePhone?: string;
    officePhone?: string;
    occupation?: string;
    address?: {
        street: string;
        number: string;
        neighborhood: string; // Colonia
        municipality?: string; // Delegación o Municipio
        city: string;
        state: string;
        zipCode: string;
    };
    insurance?: boolean;
    insuranceCompany?: string;
    sports?: string;
    recommendedBy?: string;

    // Existing fields moved to General Data section in UI, keeping same keys
    bloodType?: string;
    allergies: string;
    conditions: string; // Enfermedades
    medications: string;
    surgeries: string; // Not explicitly requested in "Datos Generales" list but good to keep, maybe in Clinical History? User said "Enfermedades q padece... toma medicamentos... recomendado por: y ya". 
    // Wait, "Enfermedades q padece" is conditions. 
    // I will keep surgeries available.
    familyHistory: string; // Antecedentes Hereditarios - might map to "Antecedentes personales patológicos" or similar, but user asked for specific new sections in Clinical History.
    // User asked for "Antecedentes personales no patológicos", "Antecedentes personales patológicos", etc.
    // I will add the new Clinical History fields.

    // Historia Clínica (New Sections)
    nonPathologicalHistory?: string; // Antecedentes personales no patológicos
    pathologicalHistory?: string; // Antecedentes personales patológicos
    gynecoObstetricHistory?: string; // Antecedentes gineco obstetricos
    perinatalHistory?: string; // Antecedentes perinatales
    currentCondition?: string; // Padecimiento actual
    physicalExploration?: string; // Exploración física
    labStudies?: string; // Estudios de laboratorio y gabinete
    diagnosis?: string; // Diagnóstico
    treatment?: string; // Tratamiento
    prognosis?: string; // Pronóstico
}

export interface SoapNote {
    subjective: string; // Síntomas descritos por paciente
    objective: string;  // Signos vitales, exploración física
    analysis: string;   // Diagnóstico
    plan: string;       // Tratamiento, estudios
}

export interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    notes: string; // Internal notes for the doctor
    history: string[]; // IDs of past appointments
    medicalHistory?: MedicalHistory; // JSONB from DB
    appId?: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    patient?: Patient;
    hospitalId: string;
    serviceName?: string; // Denormalized for easier display
    reason: AppointmentReason;
    date: string; // ISO String
    time: string; // "10:30"
    specificService?: string;
    appId?: string;
}

export const APPOINTMENT_CONFIG = {
    START_HOUR: 9, // 9:00 AM
    END_HOUR: 15,  // 3:00 PM
    INTERVAL_MINUTES: 30
};


export const SERVICES: Service[] = [
    {
        id: 'srv-1',
        name: 'Consulta General',
        durationMinutes: 60,
    },
    {
        id: 'srv-2',
        name: 'Consulta de Seguimiento',
        durationMinutes: 30,
    }
];
