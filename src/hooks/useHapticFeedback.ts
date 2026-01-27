/**
 * Hook for providing haptic feedback (vibration) on mobile devices.
 * Uses the Vibration API which is supported on most mobile browsers.
 */
export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

  /**
   * Light haptic feedback for UI interactions (navigation taps)
   */
  const lightImpact = () => {
    if (isSupported) {
      navigator.vibrate(10);
    }
  };

  /**
   * Medium haptic feedback for confirmations (pull-to-refresh threshold reached)
   */
  const mediumImpact = () => {
    if (isSupported) {
      navigator.vibrate(25);
    }
  };

  /**
   * Heavy haptic feedback for important actions
   */
  const heavyImpact = () => {
    if (isSupported) {
      navigator.vibrate(50);
    }
  };

  /**
   * Success pattern for completed actions (refresh complete)
   */
  const successNotification = () => {
    if (isSupported) {
      navigator.vibrate([10, 50, 10]);
    }
  };

  /**
   * Selection changed feedback
   */
  const selectionChanged = () => {
    if (isSupported) {
      navigator.vibrate(5);
    }
  };

  return {
    isSupported,
    lightImpact,
    mediumImpact,
    heavyImpact,
    successNotification,
    selectionChanged,
  };
};
