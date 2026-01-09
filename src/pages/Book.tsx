import { BookingWizard } from "@/features/appointments/components/BookingWizard";
import Layout from "@/layouts/Layout";

const Book = () => {
    return (
        <Layout>
            <div className="pt-32 pb-12">
                <BookingWizard />
            </div>
        </Layout>
    );
};

export default Book;
