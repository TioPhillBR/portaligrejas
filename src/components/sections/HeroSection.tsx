import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
      background_image?: string;
      slogan?: string;
      bible_verse?: string;
      bible_reference?: string;
      cta_button_1_text?: string;
      cta_button_1_link?: string;
      cta_button_2_text?: string;
      cta_button_2_link?: string;
    };
  };
}

const HeroSection = ({ sectionData }: HeroSectionProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const content = sectionData?.content || {};
  const bgImage = content.background_image;
  const title = sectionData?.title || "Bem-vindo à Nossa Igreja";
  const badge = content.badge || "✦ Bem-vindo à nossa família ✦";
  const slogan = content.slogan || '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."';
  const bibleReference = content.bible_reference || "João 3:16";
  
  // CTA Buttons - use database values with fallbacks to correct anchor IDs
  const ctaButton1Text = content.cta_button_1_text || "Conheça Nossa Igreja";
  const ctaButton1Link = content.cta_button_1_link || "#quem-somos";
  const ctaButton2Text = content.cta_button_2_text || "Nossos Horários";
  const ctaButton2Link = content.cta_button_2_link || "#cultos";

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Fallback Gradient - always rendered as base layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* Image layer with fade animation */}
      <AnimatePresence>
        {bgImage && !imageError && (
          <motion.div
            key="hero-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={bgImage}
              alt="Hero background"
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container-custom text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 mb-6 rounded-full bg-gold/20 border border-gold/40 text-gold text-sm font-medium tracking-wide"
          >
            {badge}
          </motion.span>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
          >
            <span className="text-gold">{title}</span>
          </motion.h1>

          {/* Subtitle with Bible verse */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto font-light italic"
          >
            {slogan}
            <span className="block mt-2 text-gold/80 not-italic text-base">
              {bibleReference}
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="btn-gold text-lg px-8 py-6 gap-2"
              onClick={() => scrollToSection(ctaButton1Link)}
            >
              <Play className="w-5 h-5" />
              {ctaButton1Text}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-white/10 hover:bg-white/20 text-lg px-8 py-6"
              onClick={() => scrollToSection(ctaButton2Link)}
            >
              {ctaButton2Text}
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={() => scrollToSection("#cultos")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
          aria-label="Rolar para baixo"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;
