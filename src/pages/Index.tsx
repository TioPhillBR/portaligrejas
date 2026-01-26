import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import ServiceScheduleSection from "@/components/sections/ServiceScheduleSection";
import EventsSection from "@/components/sections/EventsSection";
import MinistriesSection from "@/components/sections/MinistriesSection";
import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";
import VideoSection from "@/components/sections/VideoSection";
import WebRadioSection from "@/components/sections/WebRadioSection";
import DonationsSection from "@/components/sections/DonationsSection";
import PrayerRequestSection from "@/components/sections/PrayerRequestSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        <ServiceScheduleSection />
        <EventsSection />
        <MinistriesSection />
        <AboutSection />
        <GallerySection />
        <VideoSection />
        <WebRadioSection />
        <DonationsSection />
        <PrayerRequestSection />
        <ContactSection />
      </main>
      
      <Footer />
      
      {/* Floating Elements */}
      <WhatsAppButton />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
