import type { ReactNode } from "react";
import { Instagram } from "lucide-react";
import Navbar from "@/components/Navbar";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <footer id="contact" className="bg-slate-50 border-t border-gray-100 py-12 md:py-16">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-8">

                        {/* Name & Cédula */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-[#1c334a]">Dr. Marco Alvarado Sanchez</h3>
                            <div className="space-y-1">
                                <p className="text-gray-500 font-medium">Cédula Profesional</p>
                                <p className="text-gray-400">12832654 | 10814161</p>
                            </div>
                        </div>

                        {/* Social Networks */}
                        <div className="flex items-center gap-6">
                            <a
                                href="https://wa.me/5577350109"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-110 shadow-sm group"
                                aria-label="WhatsApp"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#25D366]">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                            <a
                                href="https://instagram.com/dr.alvarado_ortopedista"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-6 h-6 text-[#E1306C]" />
                            </a>
                            <a
                                href="https://www.facebook.com/p/Dr-Marco-A-Alvarado-Sanchez-Ortopedia-y-Traumatolog%C3%ADa-100089970213223/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                                aria-label="Facebook"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#1877F2]">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="mailto:marcoalvarado.ortopedia@gmail.com"
                                className="w-12 h-12 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                                aria-label="Email"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-700">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </a>
                        </div>

                        {/* Legal / COFEPRIS */}
                        <div className="max-w-3xl mx-auto space-y-4 pt-8 border-t border-gray-100 w-full">
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Este sitio cumple con la normatividad aplicable en materia de publicidad para servicios de salud, conforme a la Ley General de Salud y su Reglamento en Materia de Publicidad.
                            </p>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 text-xs text-gray-500 font-medium">
                                <span>Responsable sanitario: Dr. Marco Alvarado Sanchez</span>
                                <span className="hidden md:inline text-gray-300">|</span>
                                <span>Aviso de Publicidad COFEPRIS: folio pendiente</span>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="text-xs text-gray-300">
                            © {new Date().getFullYear()} Dr. Marco Alvarado. Todos los derechos reservados.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
