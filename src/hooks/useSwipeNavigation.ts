import { useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHapticFeedback } from "./useHapticFeedback";

interface SwipeNavigationOptions {
  routes: string[];
  threshold?: number;
  disabled?: boolean;
}

export const useSwipeNavigation = ({
  routes,
  threshold = 80,
  disabled = false,
}: SwipeNavigationOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lightImpact } = useHapticFeedback();
  
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const getCurrentIndex = useCallback(() => {
    return routes.findIndex(route => location.pathname === route);
  }, [routes, location.pathname]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, [disabled]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (disabled || !isDragging.current) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;
    
    // Only trigger navigation if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      const currentIndex = getCurrentIndex();
      
      if (currentIndex === -1) {
        isDragging.current = false;
        return;
      }
      
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous page
        lightImpact();
        navigate(routes[currentIndex - 1]);
      } else if (deltaX < 0 && currentIndex < routes.length - 1) {
        // Swipe left - go to next page
        lightImpact();
        navigate(routes[currentIndex + 1]);
      }
    }
    
    isDragging.current = false;
  }, [disabled, threshold, getCurrentIndex, navigate, routes, lightImpact]);

  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
    currentIndex: getCurrentIndex(),
    totalPages: routes.length,
  };
};
