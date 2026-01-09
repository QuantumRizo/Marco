import { Activity, Bone, Move } from "lucide-react";

const Specialties = () => {
    return (
        <section id="specialties" className="bg-[#1c334a] py-20 px-4 md:px-6 text-white text-center">
            <div className="container mx-auto">

                <div className="max-w-2xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                        <span className="text-xs font-semibold text-[#94c021] uppercase tracking-wider">Tratamientos</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Especialidades Médicas
                    </h2>
                    <p className="text-white/70 text-lg">
                        Atención experta para recuperar tu movilidad
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8">

                    {/* Lesiones de rodilla */}
                    <div className="w-full md:w-[calc(50%-2rem)] lg:w-[30%] group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#94c021]/20 rounded-full flex items-center justify-center group-hover:bg-[#94c021]/30 transition-colors">
                            <Bone className="w-8 h-8 text-[#94c021]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Lesiones de rodilla</h3>
                        <p className="text-white/60 leading-relaxed">
                            Diagnóstico y tratamiento avanzado para dolor y desgaste articular.
                        </p>
                    </div>

                    {/* Artroscopia */}
                    <div className="w-full md:w-[calc(50%-2rem)] lg:w-[30%] group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#94c021]/20 rounded-full flex items-center justify-center group-hover:bg-[#94c021]/30 transition-colors">
                            <Activity className="w-8 h-8 text-[#94c021]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Artroscopia</h3>
                        <p className="text-white/60 leading-relaxed">
                            Preservación de meniscos y cartílago articular. Lesiones ligamentarias.
                        </p>
                    </div>

                    {/* Reemplazos Articulares */}
                    <div className="w-full md:w-[calc(50%-2rem)] lg:w-[30%] group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#94c021]/20 rounded-full flex items-center justify-center group-hover:bg-[#94c021]/30 transition-colors">
                            <Activity className="w-8 h-8 text-[#94c021]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Reemplazos Articulares</h3>
                        <p className="text-white/60 leading-relaxed">
                            Ofrecemos soluciones avanzadas para restaurar tus articulaciones. Tecnología de última generación para una recuperación eficiente y mejor calidad de vida.
                        </p>
                    </div>

                    {/* Ortopedia deportiva */}
                    <div className="w-full md:w-[calc(50%-2rem)] lg:w-[30%] group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#94c021]/20 rounded-full flex items-center justify-center group-hover:bg-[#94c021]/30 transition-colors">
                            <Move className="w-8 h-8 text-[#94c021]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Ortopedia deportiva</h3>
                        <p className="text-white/60 leading-relaxed">
                            Recuperación funcional para atletas de alto rendimiento y aficionados.
                        </p>
                    </div>

                    {/* Traumatología */}
                    <div className="w-full md:w-[calc(50%-2rem)] lg:w-[30%] group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#94c021]/20 rounded-full flex items-center justify-center group-hover:bg-[#94c021]/30 transition-colors">
                            <Bone className="w-8 h-8 text-[#94c021]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Traumatología</h3>
                        <p className="text-white/60 leading-relaxed">
                            Atención especializada en fracturas, luxaciones y esguinces para restaurar la integridad ósea.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Specialties;
