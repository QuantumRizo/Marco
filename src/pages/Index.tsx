import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import About from "@/components/About";
import Specialties from "@/components/Specialties";
import Layout from "@/layouts/Layout";

const Index = () => {
    return (
        <Layout>
            <Hero />
            <TrustBar />
            <About />
            <Specialties />
        </Layout>
    );
};

export default Index;
