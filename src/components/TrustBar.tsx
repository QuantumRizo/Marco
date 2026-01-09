import { Award, Building2, BookOpen } from "lucide-react";

const TrustBar = () => {
    return (
        <section className="bg-[#1c334a] py-12 border-t border-white/10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-center">

                    {/* Cédula */}
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-full bg-white/5 text-blue-300">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">Cédula Profesional</p>
                            <p className="text-white/60 text-sm">12832654 | 10814161</p>
                        </div>
                    </div>

                    {/* UNAM */}
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-full bg-white/5 text-blue-300">
                            <Award className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">Formación Académica</p>
                            <p className="text-white/60 text-sm">UNAM</p>
                        </div>
                    </div>

                    {/* Hospitales */}
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-full bg-white/5 text-blue-300">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">Sedes de Atención</p>
                            <p className="text-white/60 text-sm max-w-xs mx-auto leading-tight">
                                Angeles Lindavista • Star Médica Lomas Verdes • Star Médica Luna Parc
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TrustBar;
