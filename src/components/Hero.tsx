import { ArrowRight, CheckCircle2 } from "lucide-react";

const Hero = () => {
    return (
        <section id="hero" className="relative pt-32 pb-0 overflow-hidden bg-white">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                {/* Soft gradient blob top right */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-60 animate-float" />
                {/* Soft gradient blob bottom left */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#94c021]/10 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="container px-4 md:px-6 mx-auto h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-end h-full">

                    {/* Left Column: Text */}
                    <div className="flex flex-col gap-6 md:gap-8 z-10 pb-12 self-center md:mb-12">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full w-fit shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Médico Avalado por el Consejo Mexicano de Ortopedia y Traumatología 15/6243/22</span>
                        </div>

                        {/* Headlines */}
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                                Recupera tu <span className="text-[#94c021]">Movimiento</span>,<br />
                                Recupera tu <span className="text-[#94c021]">Vida.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                                Ortopedia de vanguardia y cirugía de mínima invasión.
                                Tecnología avanzada para tu bienestar articular.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <button className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-primary rounded-full shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] group">
                                Agendar Consulta
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                            </button>

                            <button className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-primary active:scale-[0.98]">
                                Conocer Servicios
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center gap-6 pt-4 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                <span>Atención Personalizada</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                <span>Tecnología Avanzada</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image */}
                    <div className="relative z-10 flex justify-center animate-fade-in group h-full items-end">
                        {/* Visual Context Element (Glass Panel behind) */}
                        {/* Removed as per instruction, but not explicitly in the provided diff. Assuming it's part of the "adjust image positioning" */}
                        {/* Abstract Circle Graphic - Adjusted position */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[90%] bg-gradient-to-b from-[#1c334a] to-white rounded-t-full rounded-b-none z-0 border-x border-t border-[#1c334a]/30 shadow-2xl" />

                        {/* Image Container - Aligned to bottom */}
                        <div className="relative z-10 w-full max-w-md mx-auto flex items-end justify-center h-full">
                            <img
                                src="/imagenes/marco.png"
                                alt="Dr. Marco"
                                className="relative z-20 object-contain w-full h-auto drop-shadow-2xl scale-110 origin-bottom"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
