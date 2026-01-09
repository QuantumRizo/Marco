import { Star, CheckCircle, MapPin, Quote } from "lucide-react";

const Reviews = () => {
    const reviews = [
        {
            name: "Jorge Martinez",
            verified: true,
            text: "El trato siempre ha sido amable, en cada consulta me explica de forma detallada el avance de mi operación.",
            date: "22 de octubre de 2025",
            location: "Hospital Star Médica Luna Parc / Consultorio 801",
            rating: 5,
        },
        {
            name: "Carlos Alarcón",
            verified: true,
            text: "Valoración, cirugía y seguimiento. Trato amable y atento.",
            date: "22 de octubre de 2025",
            location: "Hospital Star Médica Luna Parc / Consultorio 801",
            detail: "Visitas sucesivas Ortopedia",
            rating: 5,
        },
        {
            name: "Norma Ledesma",
            verified: true,
            text: "Excelente médico Ortopedista. Muy dedicado, humano, honesto, acertado con su diagnóstico, gracias por sanar a mi familia y siempre estar atento.",
            date: "13 de octubre de 2023",
            location: "Hospital Angeles Lindavista / Consultorio 400",
            detail: "Visita Ortopedia",
            rating: 5,
        },
    ];

    return (
        <section id="reviews" className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">

                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#94c021]/10 rounded-full w-fit">
                        <span className="text-xs font-semibold text-[#1c334a] uppercase tracking-wider">Testimonios</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1c334a]">
                        Lo que dicen mis pacientes
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Star className="w-6 h-6 fill-current" />
                        <Star className="w-6 h-6 fill-current" />
                        <Star className="w-6 h-6 fill-current" />
                        <Star className="w-6 h-6 fill-current" />
                        <Star className="w-6 h-6 fill-current" />
                        <span className="text-gray-400 text-sm ml-2 font-medium">(Exclusivo Doctoralia)</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-[#94c021]/20 rotate-180" />

                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="mb-4">
                                    <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
                                    {review.verified && (
                                        <div className="flex items-center gap-1.5 mt-1 text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-xs font-medium">Número de teléfono verificado</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 mb-4 text-yellow-400">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                                    "{review.text}"
                                </p>

                                {/* Footer */}
                                <div className="pt-6 border-t border-gray-200 mt-auto space-y-2">
                                    <div className="flex items-start gap-2 text-xs text-gray-500">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{review.location}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>{review.date}</span>
                                        {review.detail && <span>• {review.detail}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Reviews;
