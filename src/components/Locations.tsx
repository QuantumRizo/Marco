import { MapPin, Phone, Globe, ExternalLink } from "lucide-react";

const Locations = () => {
    const locations = [
        {
            name: "Hospital Angeles Lindavista",
            mapQuery: "Hospital+Angeles+Lindavista",
            phones: [
                { number: "+525557544128", display: "55 5754 4128" },
                { number: "+525560004312", display: "55 6000 4312" }
            ],
            website: "https://hospitalangeles.com/lindavista",
            mapLink: "https://maps.app.goo.gl/qMjNAcxeuxTsoGUY8"
        },
        {
            name: "Star Médica Lomas Verdes",
            mapQuery: "Star+Medica+Lomas+Verdes",
            phones: [
                { number: "+525557544253", display: "55 5754 4253" },
                { number: "+525560004312", display: "55 6000 4312" }
            ],
            website: "https://www.starmedica.com/",
            mapLink: "https://maps.app.goo.gl/uNoB4KWTqbToKQbY8"
        },
        {
            name: "Star Médica Luna Parc",
            mapQuery: "Star+Medica+Luna+Parc",
            phones: [
                { number: "+525558646464", display: "(55) 5864 6464" },
                { number: "+525537117674", display: "55 3711 7674" }
            ],
            website: "https://www.starmedica.com/",
            mapLink: "https://maps.app.goo.gl/Zsm6tbED9rahDtidA"
        }
    ];

    return (
        <section id="locations" className="bg-[#1c334a] py-20 px-4 md:px-6">
            <div className="container mx-auto">

                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                        <span className="text-xs font-semibold text-[#94c021] uppercase tracking-wider">Ubicación</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Sedes de Atención
                    </h2>
                    <p className="text-white/60">
                        Encuentra el consultorio más cercano a ti
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {locations.map((loc, index) => (
                        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col h-full group">
                            {/* Map Frame */}
                            <div className="h-56 w-full relative bg-gray-200">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    title={`Mapa ${loc.name}`}
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={`https://maps.google.com/maps?q=${loc.mapQuery}&z=15&output=embed`}
                                    className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-300"
                                ></iframe>
                                <a
                                    href={loc.mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md text-[#1c334a] hover:bg-[#94c021]/10 transition-colors"
                                    title="Ver en Google Maps"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-grow space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-[#1c334a] mb-2">{loc.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4 shrink-0 text-[#94c021]" />
                                        <span>Consultorio Especializado</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Números para agendar cita:</p>
                                    {loc.phones.map((phone, i) => (
                                        <a
                                            key={i}
                                            href={`tel:${phone.number}`}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#94c021]/10 text-gray-700 hover:text-[#94c021] transition-colors border border-gray-100 group-hover:border-[#94c021]/20"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span className="font-medium">{phone.display}</span>
                                        </a>
                                    ))}

                                    <a
                                        href={loc.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-[#94c021]/10 text-gray-700 hover:text-[#94c021] transition-colors border border-gray-100 group-hover:border-[#94c021]/20"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span className="font-medium">Visitar Sitio Web</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Locations;
