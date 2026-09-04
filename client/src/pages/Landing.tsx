import HeroSection from '@/components/landing/HeroSection';
import ProblemStats from '@/components/landing/ProblemStats';
import StationGallery from '@/components/landing/StationGallery';
import Footer from '@/components/landing/Footer';

/** Public marketing landing page — lives at `/`, outside the app shell. */
export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <HeroSection />
      <ProblemStats />
      <StationGallery />
      <Footer />
    </div>
  );
}