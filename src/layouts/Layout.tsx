import type { ReactNode } from "react";
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
            <footer className="bg-slate-50 border-t border-gray-100 py-12 md:py-16">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <img
                                    src="/imagenes/logo.jpeg"
                                    alt="Logo Dr. Marco Alvarado"
                                    className="w-10 h-10 object-contain rounded-full"
                                />
                                <span className="text-xl font-bold text-gray-900">Dr. Marco Alvarado</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                                Especialista en ortopedia y traumatología, dedicado a recuperar tu movimiento con tecnología de vanguardia.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Enlaces</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Inicio</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Servicios</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Testimonios</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Contacto</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>Ubicación consultorio</li>
                                <li>+52 123 456 7890</li>
                                <li>contacto@drmarco.com</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 mt-12 pt-8 text-center text-sm text-gray-400">
                        © {new Date().getFullYear()} Dr. Marco. Todos los derechos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
