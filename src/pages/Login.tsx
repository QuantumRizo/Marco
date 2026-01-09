import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setError(error.message === 'Invalid login credentials'
                    ? 'Correo o contraseña incorrectos'
                    : 'Error al iniciar sesión');
                return;
            }

            // Redirect to admin on success
            navigate('/admin');
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-[#1c334a] rounded-full flex items-center justify-center text-white mb-2">
                        <Lock className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-[#1c334a]">Admin Access</CardTitle>
                    <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Correo Electrónico</label>
                            <Input
                                type="email"
                                placeholder="doctor@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contraseña</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#1c334a] hover:bg-[#1c334a]/90"
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
