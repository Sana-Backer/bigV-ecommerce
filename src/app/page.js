import Footer from "@/components/Footer";
import BrandHighlights from "@/components/home/BrandHighlights";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import ConnectWithUs from "@/components/home/ConnectWithUs";
import Hero from "@/components/home/Hero";
import PicksForYou from "@/components/home/PicksForYou";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
  <>
    <Hero />
    <PicksForYou />
    <CategoryShowcase />
    <BrandHighlights />
    <Testimonials />
    <ConnectWithUs />
    <Footer />
  </>
  );
}
