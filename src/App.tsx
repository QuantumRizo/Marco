import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
// import Book from "./pages/Book";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { Button } from "@/components/ui/button";
import PatientRecordPage from "./pages/PatientRecordPage";

const queryClient = new QueryClient();

import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected Route Component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, appId } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1c334a]"></div>
          <p className="text-gray-500 text-sm animate-pulse">Cargando perfil médico...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Extra security: if we have a user but NO appId after loading, something is wrong
  if (!appId) {
    return (
       <div className="min-h-screen flex items-center justify-center p-4 text-center">
         <div className="max-w-md space-y-4">
           <h2 className="text-xl font-bold text-red-600">Error de Configuración</h2>
           <p className="text-gray-600">Tu cuenta no tiene un perfil médico asociado. Contacta al administrador.</p>
           <Button onClick={() => window.location.href = '/login'}>Volver al Login</Button>
         </div>
       </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/pacientes/:id"
              element={
                <PrivateRoute>
                  <PatientRecordPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
