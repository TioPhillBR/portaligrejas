import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Início", href: "#inicio" },
    { label: "Cultos", href: "#cultos" },
    { label: "Eventos", href: "#eventos" },
    { label: "Ministérios", href: "#ministerios" },
    { label: "Quem Somos", href: "#quem-somos" },
    { label: "Contato", href: "#contato" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Logo size="lg" className="mb-4" />
            <p className="text-white/70 mb-6 max-w-md">
              Somos uma comunidade de fé comprometida com a transformação de
              vidas através do Evangelho de Jesus Cristo. Venha nos visitar!
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold hover:text-gold-foreground flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-gold">
              Links Rápidos
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-gold">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">
                  Rua da Paz, 123 - Centro
                  <br />
                  São Paulo - SP
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-white/70 text-sm">(11) 3456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-white/70 text-sm">contato@igrejaluz.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bible Verse */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/60 italic mb-6 max-w-2xl mx-auto">
            "Eu sou a luz do mundo; quem me segue, não andará em trevas, mas
            terá a luz da vida." - João 8:12
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-white/50 text-sm">
          <p>© {currentYear} Igreja Luz do Evangelho. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
