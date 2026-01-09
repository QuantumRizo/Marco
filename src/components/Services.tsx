import { Stethoscope, MapPin } from "lucide-react";

const Services = () => {
    return (
        <section id="services" className="bg-[#1c334a] py-20 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* Left Column: Locations */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit mb-6">
                                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Ubicaciones</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                                Sedes de Atención
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    "Hospital Angeles Lindavista",
                                    "Hospital Star Medica Lomas Verdes",
                                    "Hospital Star Medica Luna Parc"
                                ].map((hospital, index) => (
                                    <li key={index} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-blue-300/10 rounded-lg shrink-0">
                                            <MapPin className="w-5 h-5 text-blue-300" />
                                        </div>
                                        <span className="text-gray-200 font-medium mt-1">{hospital}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Diseases Treated */}
                    <div className="lg:col-span-8 bg-white/5 rounded-3xl p-8 border border-white/10">
                        <h3 className="flex items-center gap-3 text-2xl font-bold text-white mb-8">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Stethoscope className="w-6 h-6 text-blue-300" />
                            </div>
                            Enfermedades Tratadas
                        </h3>

                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-4">
                            {[
                                "Lesiones deportivas",
                                "Lesiones de cartílago articular",
                                "Enfermedad articular degenerativa",
                                "Lesión de Ligamentarias de Rodilla",
                                "Fracturas",
                                "Luxación Acromioclavicular",
                                "Tendinitis del manguito de los rotadores",
                                "Ciática",
                                "Síndrome de pinzamiento del hombro",
                                "Lesiones de Menisco",
                                "Lesiones del tendón rotuliano",
                                "Lesiones ligamentarias en mano y muñeca",
                                "Fracturas y luxaciones"
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3 group break-inside-avoid mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                    <span className="text-gray-300 group-hover:text-white transition-colors leading-relaxed text-sm">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Services;
