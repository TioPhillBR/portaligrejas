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
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
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

  // Default order if sections are not loaded yet
  const defaultOrder = [
    "hero",
    "services",
    "events",
    "ministries",
    "about",
    "gallery",
    "video",
    "radio",
    "donations",
    "prayer",
    "contact",
  ];

  const orderedSections = sections?.length
    ? sections.filter((s) => sectionComponents[s.section_key])
    : defaultOrder.map((key) => ({ section_key: key, title: null, subtitle: null, content: {} }));

  return (
    <div className="min-h-screen bg-background">
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
      
      {/* Floating Elements */}
      <WhatsAppButton />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
