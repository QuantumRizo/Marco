import { Award, GraduationCap, FileCheck } from "lucide-react";

const Experience = () => {
    return (
        <section id="about" className="bg-white py-20 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Experience Summary */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1c334a]/10 rounded-full w-fit mb-6">
                            <span className="text-xs font-semibold text-[#1c334a] uppercase tracking-wider">Experiencia</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            Trayectoria Profesional
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg max-w-2xl mx-auto">
                            Amplia experiencia en cirugía articular y artroscopia, actualmente certificado por el Consejo Mexicano de Ortopedia.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Formation */}
                        <div>
                            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                                <div className="p-2 bg-[#1c334a]/10 rounded-lg">
                                    <GraduationCap className="w-6 h-6 text-[#1c334a]" />
                                </div>
                                Formación
                            </h3>
                            <ul className="space-y-4">
                                <li className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-gray-800 font-medium">Especialidad en Ortopedia y Traumatología</p>
                                    <p className="text-sm text-[#1c334a] mt-1">UNAM</p>
                                </li>
                                <li className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-gray-800 font-medium">Alta Especialidad en Cirugía Articular y Artroscopia</p>
                                    <p className="text-sm text-[#1c334a] mt-1">La Salle</p>
                                </li>
                            </ul>
                        </div>

                        {/* Awards */}
                        <div>
                            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                                <div className="p-2 bg-[#1c334a]/10 rounded-lg">
                                    <Award className="w-6 h-6 text-[#1c334a]" />
                                </div>
                                Premios y Distinciones
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-gray-800 font-medium">Mención honorífica en la especialidad de Ortopedia</p>
                                <p className="text-sm text-[#1c334a] mt-1">UNAM</p>
                            </div>
                        </div>
                    </div>

                    {/* Certificates */}
                    <div>
                        <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
                            <div className="p-2 bg-[#1c334a]/10 rounded-lg">
                                <FileCheck className="w-6 h-6 text-[#1c334a]" />
                            </div>
                            Certificados
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="aspect-[4/3] bg-slate-50 rounded-lg border border-gray-100 flex items-center justify-center group hover:bg-gray-100 transition-colors cursor-pointer shadow-sm">
                                    <span className="text-xs text-gray-400 group-hover:text-[#1c334a] transition-colors text-center px-2">
                                        Certificado {i}<br />(Imagen)
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

export default Experience;
