import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
}

const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  progress,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none md:hidden"
      style={{
        paddingTop: `${Math.min(pullDistance, 80)}px`,
      }}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20",
          isRefreshing && "bg-primary/20"
        )}
        animate={{
          rotate: isRefreshing ? 360 : progress * 180,
          scale: isRefreshing ? 1 : 0.8 + progress * 0.2,
        }}
        transition={{
          rotate: isRefreshing
            ? { duration: 1, repeat: Infinity, ease: "linear" }
            : { duration: 0 },
          scale: { duration: 0.1 },
        }}
      >
        <RefreshCw
          className={cn(
            "w-5 h-5 text-primary",
            progress >= 1 && "text-primary"
          )}
        />
      </motion.div>
    </motion.div>
  );
};

export default PullToRefreshIndicator;
