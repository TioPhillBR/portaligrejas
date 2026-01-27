import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminTooltips } from "@/hooks/useAdminTooltips";

export default function ContextualTooltip() {
  const location = useLocation();
  const {
    currentTooltip,
    isTooltipVisible,
    checkAndShowTooltip,
    dismissTooltip,
  } = useAdminTooltips();

  useEffect(() => {
    // Small delay to allow page to render first
    const timer = setTimeout(() => {
      checkAndShowTooltip(location.pathname);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname, checkAndShowTooltip]);

  return (
    <AnimatePresence>
      {isTooltipVisible && currentTooltip && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={dismissTooltip}
          />

          {/* Tooltip Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[90vw] max-w-md"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-primary/10 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {currentTooltip.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={dismissTooltip}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="text-muted-foreground leading-relaxed">
                  {currentTooltip.description}
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end">
                <Button onClick={dismissTooltip} size="sm">
                  Entendi!
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
