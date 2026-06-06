import Navbar from '@/components/Navbar';
import AboutHero from './components/AboutHero';
import TheFaces from './components/TheFaces';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'About Us | Lumora',
    description: 'Unreservedly honest products that truly work. Be kind to skin and the planet — No exceptions!',
};

export default function AboutUsPage() {
    return (
        <main>
            <Navbar theme="white" />
            <div className="w-full">
                <AboutHero />
                <TheFaces />
            </div>
            <Footer />
        </main>

    );
}
