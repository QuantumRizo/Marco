
const NotFound = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="text-gray-600">Página no encontrada</p>
            <a href="/" className="text-primary hover:underline">Volver al inicio</a>
        </div>
    );
};

export default NotFound;
