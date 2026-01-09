import { BadgeCheck, GraduationCap, Stethoscope } from "lucide-react";

const About = () => {
    return (
        <section id="about" className="bg-white py-12 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Image + Quote + Focus */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Profile Image */}
                        <div className="w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl relative z-10">
                            <img
                                src="/imagenes/sobremi.jpeg"
                                alt="Dr. Marco Alvarado Sanchez"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Quote */}
                        <div className="max-w-sm mx-auto bg-[#94c021]/10 p-4 rounded-xl border border-[#94c021]/20">
                            <p className="text-gray-600 italic text-center">
                                "Mi prioridad es que mis pacientes recuperen su calidad de vida con tratamientos efectivos y claros."
                            </p>
                        </div>


                    </div>

                    {/* Right Column: Header + Credentials */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#94c021]/10 rounded-full w-fit mb-4">
                                <span className="text-xs font-semibold text-[#1c334a] uppercase tracking-wider">Sobre el Especialista</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-[#1c334a] mb-2">
                                Dr. Marco Alvarado Sanchez
                            </h2>
                            <p className="text-xl text-[#94c021] font-medium">
                                Especialista en Ortopedia y Traumatología
                            </p>
                        </div>

                        {/* Credentials Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Formación */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                    <GraduationCap className="w-5 h-5 text-[#1c334a]" />
                                    <h4 className="font-bold text-gray-900">Formación Académica</h4>
                                </div>
                                <div className="space-y-2 text-gray-600">
                                    <div>
                                        <h5 className="font-semibold text-gray-900">Licenciatura</h5>
                                        <p className="text-sm">UNAM - FES IZTACALA</p>
                                        <p className="text-xs text-gray-500">Céd. Prof: 10814161</p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900">Especialidad</h5>
                                        <p className="text-sm">UNAM Hospital Juárez de México</p>
                                        <p className="text-xs text-gray-500">Céd. Esp: 12832654</p>
                                    </div>
                                </div>
                            </div>

                            {/* Membresías */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                    <BadgeCheck className="w-5 h-5 text-[#1c334a]" />
                                    <h4 className="font-bold text-gray-900">Certificaciones y Membresías</h4>
                                </div>
                                <div className="space-y-2 text-gray-600">
                                    <div>
                                        <h5 className="font-semibold text-gray-900">Avalado por el Consejo</h5>
                                        <p className="text-sm">
                                            Avalado por el consejo mexicano de ortopedia y traumatología 15/6243/22
                                        </p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900">Miembro Activo</h5>
                                        <p className="text-sm">
                                            SLARD (Sociedad Latinoamericana de Artroscopia, Reconstrucción Articular y Trauma Deportivo)
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Enfoque Clínico moved to right column */}
                        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm w-fit">
                            <div className="p-3 bg-[#1c334a]/5 rounded-lg shrink-0">
                                <Stethoscope className="w-6 h-6 text-[#1c334a]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Enfoque Clínico</h4>
                                <p className="text-sm text-gray-600">Cirugía Articular y Artroscopia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
