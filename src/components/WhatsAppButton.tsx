import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppButton = ({
  phoneNumber = "5511999999999",
  message = "Olá! Gostaria de saber mais sobre a Igreja Luz do Evangelho.",
}: WhatsAppButtonProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Show tooltip after 3 seconds if user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTooltipVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (!isDragging) {
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <>
      {/* Drag constraints - full viewport */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-40"
      />

      <motion.div
        drag
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 100);
        }}
        initial={{ x: 0, y: 0, scale: 0 }}
        animate={{ x: position.x, y: position.y, scale: 1 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isTooltipVisible && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="relative bg-card text-foreground px-4 py-2 rounded-lg shadow-lg text-sm">
                <span className="font-medium">Fale conosco pelo WhatsApp!</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTooltipVisible(false);
                  }}
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Arrow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                  <div className="border-8 border-transparent border-l-card" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Button */}
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center group"
          aria-label="Contato via WhatsApp"
        >
          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          
          {/* Icon */}
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" />

          {/* Drag Hint */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-gold-foreground text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            ↕
          </span>
        </motion.button>
      </motion.div>
    </>
  );
};

export default WhatsAppButton;
