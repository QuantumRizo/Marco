import { BadgeCheck, GraduationCap, Stethoscope } from "lucide-react";

const About = () => {
    return (
        <section id="about" className="bg-white py-20 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Image + Quote + Focus */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Profile Image */}
                        <div className="w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden shadow-2xl relative z-10">
                            <img
                                src="/imagenes/sobremi.jpeg"
                                alt="Dr. Marco Alvarado Sanchez"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Quote */}
                        <div className="max-w-sm mx-auto bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <p className="text-gray-600 italic text-center">
                                "Mi prioridad es que mis pacientes recuperen su calidad de vida con tratamientos efectivos y claros."
                            </p>
                        </div>

                        {/* Enfoque Clínico Mobile */}
                        <div className="max-w-sm mx-auto flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-3 bg-[#1c334a]/5 rounded-lg shrink-0">
                                <Stethoscope className="w-6 h-6 text-[#1c334a]" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Enfoque Clínico</h4>
                                <p className="text-sm text-gray-600">Cirugía Articular y Artroscopia</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Header + Credentials */}
                    <div className="lg:col-span-7 space-y-10">

                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full w-fit mb-4">
                                <span className="text-xs font-semibold text-[#1c334a] uppercase tracking-wider">Sobre el Especialista</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-[#1c334a] mb-2">
                                Dr. Marco Alvarado Sanchez
                            </h2>
                            <p className="text-xl text-blue-600 font-medium">
                                Especialista en Ortopedia y Traumatología
                            </p>
                        </div>

                        {/* Credentials Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Formación */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                    <GraduationCap className="w-5 h-5 text-[#1c334a]" />
                                    <h4 className="font-bold text-gray-900">Formación Académica</h4>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Médico Cirujano (UNAM) <br />
                                        Especialista en Ortopedia y Traumatología
                                    </p>
                                    <img
                                        src="/imagenes/titulo.jpeg"
                                        alt="Título Profesional"
                                        className="w-64 h-auto rounded-lg shadow-sm border border-gray-100 hover:scale-105 transition-transform mx-auto lg:mx-0"
                                    />
                                </div>
                            </div>

                            {/* Membresías */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                    <BadgeCheck className="w-5 h-5 text-[#1c334a]" />
                                    <h4 className="font-bold text-gray-900">Membresías</h4>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Miembro de la Sociedad Latinoamericana de Artroscopia, Rodilla y Deporte (SLARD)
                                    </p>
                                    <img
                                        src="/imagenes/slard.jpeg"
                                        alt="Miembro SLARD"
                                        className="w-80 h-auto rounded-lg shadow-sm border border-gray-100 hover:scale-105 transition-transform mx-auto lg:mx-0"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
