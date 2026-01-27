import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import MobileFooter from "@/components/MobileFooter";
import MobileContactFooter from "@/components/MobileContactFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import PageTransition from "@/components/PageTransition";
import { useHomeSections } from "@/hooks/useHomeSections";

// Map section keys to components
const sectionComponents: Record<string, React.ComponentType<{ sectionData?: any }>> = {
  hero: HeroSection,
  services: ServiceScheduleSection,
  events: EventsSection,
  ministries: MinistriesSection,
  about: AboutSection,
  gallery: GallerySection,
  video: VideoSection,
  radio: WebRadioSection,
  donations: DonationsSection,
  prayer: PrayerRequestSection,
  contact: ContactSection,
};

const Index = () => {
  const { data: sections, isLoading } = useHomeSections();
  const location = useLocation();

  // Handle anchor scroll when navigating from another page
  useEffect(() => {
    if (location.hash) {
      // Small delay to ensure the page is rendered
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [location.hash]);

  // Only use sections from database - don't fallback to defaults which would show hidden sections
  const orderedSections = sections?.filter((s) => sectionComponents[s.section_key]) || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
      
      <main>
        {orderedSections.map((section) => {
          const Component = sectionComponents[section.section_key];
          if (!Component) return null;
          return (
            <Component
              key={section.section_key}
              sectionData={{
                title: section.title,
                subtitle: section.subtitle,
                content: section.content,
              }}
            />
          );
        })}
      </main>
      
      <Footer />
      <MobileContactFooter />
      <MobileFooter />
      
        {/* Floating Elements */}
        <WhatsAppButton />
        <PWAInstallPrompt />
        <ScrollToTopButton />
      </div>
    </PageTransition>
  );
};

export default Index;
