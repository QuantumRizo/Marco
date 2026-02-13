
export interface Hospital {
    id: string;
    name: string;
    address: string;
    image: string;
}

export type AppointmentReason = 'first-visit' | 'follow-up' | 'specific-service';

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
    hospitalId: string;
    serviceId?: string;
    serviceName?: string; // Denormalized for easier display
    reason: AppointmentReason;
    date: string; // ISO String
    time: string; // "10:30"
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'blocked' | 'waiting_room' | 'in_progress' | 'finished';
    notes?: string;
    clinicalData?: SoapNote; // JSONB from DB
    appId?: string;
}

export interface HospitalSchedule {
    allowedDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export const APPOINTMENT_CONFIG = {
    START_HOUR: 9, // 9:00 AM
    END_HOUR: 15,  // 3:00 PM
    INTERVAL_MINUTES: 30
};

export const HOSPITAL_SCHEDULES: Record<string, HospitalSchedule> = {
    'hosp-angeles': {
        allowedDays: [3, 6] // Wednesday (3), Saturday (6)
    },
    'hosp-star-lomas': {
        allowedDays: [2, 5] // Tuesday (2), Friday (5)
    },
    'hosp-star-luna': {
        allowedDays: [1, 4] // Monday (1), Thursday (4)
    }
};

export const HOSPITALS: Hospital[] = [
    {
        id: 'hosp-angeles',
        name: 'Hospital Angeles Lindavista',
        address: 'Ciudad de México',
        image: '/placeholder.svg'
    },
    {
        id: 'hosp-star-lomas',
        name: 'Star Médica Lomas Verdes',
        address: 'Naucalpan de Juárez, Méx.',
        image: '/placeholder.svg'
    },
    {
        id: 'hosp-star-luna',
        name: 'Star Médica Luna Parc',
        address: 'Cuautitlán Izcalli, Méx.',
        image: '/placeholder.svg'
    }
];

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
