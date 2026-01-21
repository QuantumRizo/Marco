import type { Hospital } from '../types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface StepHospitalProps {
    hospitals: Hospital[];
    selectedHospitalId?: string;
    onSelect: (hospitalId: string) => void;
    onNext: () => void;
}

export const StepHospital = ({ hospitals, selectedHospitalId, onSelect, onNext }: StepHospitalProps) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-primary">Elige tu Sede</h2>
                <p className="text-gray-500">Selecciona el hospital más cercano a ti</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {hospitals.map((hospital) => (
                    <Card
                        key={hospital.id}
                        className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 flex items-center p-4 gap-4 ${selectedHospitalId === hospital.id
                            ? 'border-[#94c021] bg-[#94c021]/5 ring-1 ring-[#94c021]'
                            : 'border-transparent hover:border-gray-100'
                            }`}
                        onClick={() => onSelect(hospital.id)}
                    >
                        <div className={`p-4 rounded-full ${selectedHospitalId === hospital.id ? 'bg-[#94c021]/20' : 'bg-gray-100'
                            }`}>
                            <MapPin className={`w-8 h-8 ${selectedHospitalId === hospital.id ? 'text-[#94c021]' : 'text-gray-400'
                                }`} />
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-[#1c334a]">{hospital.name}</h3>
                            <p className="text-sm text-gray-500">{hospital.address}</p>
                            {hospital.id === 'hosp-angeles' && <p className="text-xs text-primary font-medium">Días: Miércoles y Sábado</p>}
                            {hospital.id === 'hosp-star-lomas' && <p className="text-xs text-primary font-medium">Días: Martes y Viernes</p>}
                            {hospital.id === 'hosp-star-luna' && <p className="text-xs text-primary font-medium">Días: Lunes y Jueves</p>}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={onNext}
                    disabled={!selectedHospitalId}
                    size="lg"
                    className="w-full md:w-auto"
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
};
