import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const MobileContactFooter = () => {
  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-primary text-primary-foreground py-6 px-4 md:hidden"
    >
      <div className="max-w-md mx-auto space-y-4">
        {/* Contact Info */}
        <div className="space-y-2 text-center">
          <h4 className="text-sm font-semibold text-gold mb-3">Contato</h4>
          <div className="flex items-center justify-center gap-2 text-xs text-white/70">
            <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span>Rua da Paz, 123 - Centro, São Paulo - SP</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-white/70">
            <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span>(11) 3456-7890</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-white/70">
            <Mail className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span>contato@igrejaluz.com.br</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors"
                aria-label={social.label}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>

        {/* Bible Verse */}
        <p className="text-white/50 italic text-[10px] text-center pt-2 max-w-xs mx-auto">
          "Eu sou a luz do mundo; quem me segue, não andará em trevas, mas terá a luz da vida." - João 8:12
        </p>

        {/* Copyright */}
        <p className="text-white/40 text-[10px] text-center">
          © {new Date().getFullYear()} Igreja Luz do Evangelho
        </p>
      </div>
    </motion.div>
  );
};

export default MobileContactFooter;
