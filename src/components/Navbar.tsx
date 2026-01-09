import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
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
        { name: "Especialidades", href: "#services" },
        { name: "Sobre Mí", href: "#about" },
        { name: "Ubicación", href: "#contact" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
                isScrolled
                    ? "bg-[#1c334a] shadow-md py-3 border-none"
                    : "bg-[#1c334a]/95 py-5 border-none"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img
                        src="/imagenes/logo.jpeg"
                        alt="Logo Dr. Marco Alvarado"
                        className="w-16 h-16 object-contain"
                    />
                    <span className={cn(
                        "text-xl font-bold tracking-tight transition-colors text-white",
                    )}>
                        Dr. Marco Alvarado
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-white/90 hover:text-white transition-colors hover:translate-y-[-1px] transform duration-200"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-wide">55 7735 0109</span>
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
                                href={link.href}
                                className="text-base font-medium text-gray-700 hover:text-primary py-2 border-b border-gray-50 last:border-0"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <button className="w-full bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md mt-2">
                            Agendar Consulta
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
