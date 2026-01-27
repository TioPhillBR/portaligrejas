import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";
import { useHomeSections } from "@/hooks/useHomeSections";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

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
  const queryClient = useQueryClient();

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["home-sections-public"] });
    await queryClient.invalidateQueries({ queryKey: ["events"] });
    await queryClient.invalidateQueries({ queryKey: ["ministries"] });
    await queryClient.invalidateQueries({ queryKey: ["service-schedules"] });
    await queryClient.invalidateQueries({ queryKey: ["gallery"] });
    // Small delay to show the refresh animation
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, [queryClient]);

  const { containerRef, isPulling, isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

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
      <div ref={containerRef} className="min-h-screen bg-background pb-20 md:pb-0">
        {/* Pull to Refresh Indicator */}
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          progress={progress}
        />
        
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
