import type { Service, AppointmentReason } from '../types';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Stethoscope, UserPlus, CalendarCheck } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

interface StepServiceProps {
    services: Service[];
    selectedReason?: AppointmentReason;
    selectedServiceId?: string; // Kept for type compatibility but might be unused
    serviceDescription?: string;
    onSelectReason: (reason: AppointmentReason) => void;
    onSelectService: (serviceId: string) => void;
    onServiceDescriptionChange?: (text: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export const StepService = ({
    selectedReason,
    serviceDescription = '',
    onSelectReason,
    onServiceDescriptionChange,
    onNext,
    onBack
}: StepServiceProps) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-primary">Motivo de la Cita</h2>
                <p className="text-gray-500">Cuéntanos por qué nos visitas</p>
            </div>

            <div className="space-y-6">
                <RadioGroup
                    value={selectedReason}
                    onValueChange={(val: string) => onSelectReason(val as AppointmentReason)}
                    className="grid md:grid-cols-3 gap-4"
                >
                    <Label
                        htmlFor="r-first"
                        className={`flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${selectedReason === 'first-visit' ? 'border-primary bg-primary/5' : ''
                            }`}
                    >
                        <RadioGroupItem value="first-visit" id="r-first" className="sr-only" />
                        <UserPlus className="mb-3 h-8 w-8 text-primary" />
                        <span className="text-base font-semibold">Primera Vez</span>
                    </Label>

                    <Label
                        htmlFor="r-follow"
                        className={`flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${selectedReason === 'follow-up' ? 'border-primary bg-primary/5' : ''
                            }`}
                    >
                        <RadioGroupItem value="follow-up" id="r-follow" className="sr-only" />
                        <CalendarCheck className="mb-3 h-8 w-8 text-primary" />
                        <span className="text-base font-semibold">Seguimiento</span>
                    </Label>

                    <Label
                        htmlFor="r-service"
                        className={`flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${selectedReason === 'specific-service' ? 'border-primary bg-primary/5' : ''
                            }`}
                    >
                        <RadioGroupItem value="specific-service" id="r-service" className="sr-only" />
                        <Stethoscope className="mb-3 h-8 w-8 text-primary" />
                        <span className="text-base font-semibold">Servicio Específico</span>
                    </Label>
                </RadioGroup>

                {selectedReason === 'specific-service' && (
                    <div className="animate-in fade-in slide-in-from-top-4 pt-4">
                        <Label htmlFor="service-desc" className="text-lg font-medium mb-3 block">Describe el servicio o síntoma</Label>
                        <Textarea
                            id="service-desc"
                            placeholder="Ej: Dolor de rodilla, revisión de cirugía, plantilla ortopédica..."
                            className="min-h-[100px]"
                            value={serviceDescription}
                            onChange={(e) => onServiceDescriptionChange?.(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>Atrás</Button>
                <Button
                    onClick={onNext}
                    disabled={!selectedReason || (selectedReason === 'specific-service' && !serviceDescription.trim())}
                    className="w-full md:w-auto"
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
};
