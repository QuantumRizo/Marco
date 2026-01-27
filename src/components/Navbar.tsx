import { useState, useEffect } from "react";
import { Menu, X, Instagram, Facebook, Mail } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Inicio", href: "#hero" },
        { name: "Sobre Mí", href: "#about" },
        { name: "Especialidades", href: "#specialties" },
        { name: "Testimonios", href: "#reviews" },
        { name: "Ubicación", href: "#locations" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
                isScrolled
                    ? "bg-[#1c334a] shadow-md py-3 border-none"
                    : "bg-[#1c334a] py-5 border-none"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img
                        src="/imagenes/logo.jpeg"
                        alt="Logo Dr. Marco Alvarado"
                        className="w-20 h-20 object-contain"
                    />
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-2xl font-bold tracking-tight transition-colors text-white leading-none",
                        )}>
                            Dr. Marco Alvarado
                        </span>
                        <span className="text-sm font-medium text-white/80 tracking-wide uppercase mt-0.5">
                            Ortopedista
                        </span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={location.pathname === "/" ? link.href : `/${link.href}`}
                            className="text-sm font-medium text-white/90 hover:text-white transition-colors hover:translate-y-[-1px] transform duration-200"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <a
                            href="https://wa.me/5577350109"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
                            aria-label="WhatsApp"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>
                        <a
                            href="https://instagram.com/dr.alvarado_ortopedista"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-5 h-5 text-[#E1306C] group-hover:scale-110 transition-transform" />
                        </a>
                        <a
                            href="https://www.facebook.com/p/Dr-Marco-A-Alvarado-Sanchez-Ortopedia-y-Traumatolog%C3%ADa-100089970213223/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
                            aria-label="Facebook"
                        >
                            <Facebook className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
                        </a>
                        <a
                            href="mailto:marcoalvarado.ortopedia@gmail.com"
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
                            aria-label="Email"
                        >
                            <Mail className="w-5 h-5 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                    <a href="#locations">
                        <button className="bg-white text-primary px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                            Agendar Cita
                        </button>
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white hover:text-white/80 transition-colors p-2"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl animate-fade-in">
                    <div className="flex flex-col p-4 gap-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={location.pathname === "/" ? link.href : `/${link.href}`}
                                className="text-base font-medium text-gray-700 hover:text-primary py-2 border-b border-gray-50 last:border-0"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <a href="#locations" onClick={() => setIsMobileMenuOpen(false)}>
                            <button className="w-full bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md mt-2">
                                Agendar Consulta
                            </button>
                        </a>

                        <div className="flex items-center justify-center gap-4 mt-2 pt-4 border-t border-gray-100">
                            <a
                                href="https://wa.me/5577350109"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group"
                                aria-label="WhatsApp"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                            <a
                                href="https://instagram.com/dr.alvarado_ortopedista"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5 text-[#E1306C] group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="https://www.facebook.com/p/Dr-Marco-A-Alvarado-Sanchez-Ortopedia-y-Traumatolog%C3%ADa-100089970213223/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="mailto:marcoalvarado.ortopedia@gmail.com"
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors group"
                                aria-label="Email"
                            >
                                <Mail className="w-5 h-5 text-gray-700 group-hover:text-primary group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
