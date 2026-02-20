import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";

interface StepDateTimeProps {
    date: Date | undefined;
    time: string | undefined;
    availableSlots: string[];
    onSelectDate: (date: Date | undefined) => void;
    onSelectTime: (time: string) => void;
    onNext: () => void;
    onBack: () => void;
    allowedDays?: number[]; // Array of allowed days (0-6)
}

export const StepDateTime = ({
    date,
    time,
    availableSlots,
    onSelectDate,
    onSelectTime,
    onNext,
    onBack,
    allowedDays
}: StepDateTimeProps) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-primary">Fecha y Hora</h2>
                <p className="text-gray-500">¿Cuándo te gustaría venir?</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center">
                <div className="flex-1 max-w-sm mx-auto md:mx-0">
                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={onSelectDate}
                            disabled={(date: Date) => {
                            const isPast = date < new Date() || date < new Date("1900-01-01");
                            const isNotAllowedDay = allowedDays ? !allowedDays.includes(date.getDay()) : false;
                            return isPast || isNotAllowedDay;
                            }}
                            initialFocus
                            className="rounded-md"
                            locale={es}
                        />
                    </div>
                </div>

                <div className="flex-1 max-w-sm mx-auto md:mx-0 w-full">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Horarios Disponibles {date ? `para el ${format(date, 'd/MM', { locale: es })}` : ''}
                    </h3>

                    {!date ? (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed rounded-lg">
                            Selecciona una fecha primero
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-gray-500 text-sm border rounded-lg bg-gray-50 p-4 text-center">
                            {allowedDays && !allowedDays.includes(date.getDay())
                                ? "Este hospital no abre este día. Por favor selecciona otro día."
                                : "No hay horarios disponibles para este día"}
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="grid grid-cols-2 gap-3">
                                {availableSlots.map((slot) => (
                                    <Button
                                        key={slot}
                                        variant={time === slot ? "default" : "outline"}
                                        className={`w-full ${time === slot ? 'bg-primary text-white' : ''}`}
                                        onClick={() => onSelectTime(slot)}
                                    >
                                        {slot}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack}>Atrás</Button>
                <Button
                    onClick={onNext}
                    disabled={!date || !time}
                    className="w-full md:w-auto"
                >
                    Continuar
                </Button>
            </div>
        </div>
    );
};
