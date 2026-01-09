import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Experience from "@/components/Experience";
import Layout from "@/layouts/Layout";

const Index = () => {
    return (
        <Layout>
            <Hero />
            <Services />
            <Experience />
        </Layout>
    );
};

export default Index;
