import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChurch } from "@/contexts/ChurchContext";

const SESSION_KEY = "analytics-session-id";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

// Map paths to section keys
const PATH_TO_SECTION: Record<string, string> = {
  "/": "home",
  "/#about": "about",
  "/#events": "events",
  "/#ministries": "ministries",
  "/#gallery": "gallery",
  "/#contact": "contact",
  "/#schedule": "schedule",
  "/blog": "blog",
  "/eventos": "events-page",
  "/ministerios": "ministries-page",
};

export function useSectionTracking() {
  const location = useLocation();
  const { church } = useChurch();

  const trackView = useCallback(
    async (sectionKey: string, pagePath: string) => {
      if (!church?.id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from("section_views").insert({
          church_id: church.id,
          section_key: sectionKey,
          page_path: pagePath,
          user_id: user?.id || null,
          session_id: getSessionId(),
          device_type: getDeviceType(),
        });
      } catch (error) {
        // Silent fail - analytics shouldn't break the app
        console.debug("Analytics tracking error:", error);
      }
    },
    [church?.id]
  );

  useEffect(() => {
    const fullPath = location.pathname + location.hash;
    const sectionKey = PATH_TO_SECTION[fullPath] || PATH_TO_SECTION[location.pathname] || location.pathname.slice(1) || "home";
    
    trackView(sectionKey, fullPath);
  }, [location.pathname, location.hash, trackView]);

  return { trackView };
}

export function useTrackSection() {
  const { church } = useChurch();

  const trackSection = useCallback(
    async (sectionKey: string) => {
      if (!church?.id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from("section_views").insert({
          church_id: church.id,
          section_key: sectionKey,
          page_path: window.location.pathname + window.location.hash,
          user_id: user?.id || null,
          session_id: getSessionId(),
          device_type: getDeviceType(),
        });
      } catch (error) {
        console.debug("Analytics tracking error:", error);
      }
    },
    [church?.id]
  );

  return { trackSection };
}
