
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

export interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    notes: string; // Internal notes for the doctor
    history: string[]; // IDs of past appointments
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
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'blocked';
    notes?: string;
}

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
        durationMinutes: 90,
    },
    {
        id: 'srv-2',
        name: 'Limpieza Dental',
        durationMinutes: 90,
    },
    {
        id: 'srv-3',
        name: 'Ortodoncia (Revisión)',
        durationMinutes: 90,
    }
];
