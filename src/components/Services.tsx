import { Check, Star } from "lucide-react";

const Services = () => {
    return (
        <section id="services" className="bg-[#1c334a] py-20 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit mb-6">
                            <span className="text-xs font-semibold text-primary-foreground uppercase tracking-wider">Nuestros Servicios</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Comprometidos con tu <span className="text-blue-300">bienestar integral</span> y recuperación.
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                            Ofrecemos un enfoque multidisciplinario para el diagnóstico y tratamiento de lesiones musculoesqueléticas, utilizando las técnicas más avanzadas.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Cirugía de Mínima Invasión",
                                "Rehabilitación Deportiva",
                                "Prótesis de Cadera y Rodilla",
                                "Tratamiento de Fracturas"
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-gray-200">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-blue-300" />
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:translate-y-[-2px]">
                                <div className="w-12 h-12 bg-white/10 rounded-xl mb-4 flex items-center justify-center text-blue-300">
                                    <Star className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
                                </div>
                                <h3 className="font-bold text-white mb-2">Ortopedia {i}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Diagnóstico preciso y tratamiento efectivo para recuperar tu movilidad.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
