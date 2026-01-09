import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import About from "@/components/About";
import Specialties from "@/components/Specialties";
import Reviews from "@/components/Reviews";
import Locations from "@/components/Locations";
import Layout from "@/layouts/Layout";

const Index = () => {
    return (
        <Layout>
            <Hero />
            <TrustBar />
            <About />
            <Specialties />
            <Reviews />
            <Locations />
        </Layout>
    );
};

export default Index;
