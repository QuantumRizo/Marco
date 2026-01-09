import { AdminDashboard } from "@/features/admin/components/AdminDashboard";


const Admin = () => {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 md:px-8 py-8">
                <AdminDashboard />
            </div>
        </div>
    );
};

export default Admin;
