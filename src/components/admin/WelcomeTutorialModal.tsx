import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Palette,
  Image,
  Bell,
  Settings,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tips: string[];
  highlightSelector?: string;
  highlightLabel?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Portal Igrejas!",
    description: "Seu site está pronto! Vamos te mostrar os principais recursos para você começar a usar a plataforma.",
    icon: Rocket,
    tips: [
      "Site profissional e responsivo",
      "Gestão completa de membros",
      "Sistema de eventos integrado",
      "Comunicação com a comunidade",
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Aqui você tem uma visão geral da sua igreja com estatísticas e ações rápidas.",
    icon: LayoutDashboard,
    tips: [
      "Acompanhe membros e eventos",
      "Veja mensagens pendentes",
      "Acesse ações rápidas",
      "Complete o checklist de configuração",
    ],
    highlightSelector: "[data-tutorial='dashboard']",
    highlightLabel: "Dashboard",
  },
  {
    id: "events",
    title: "Eventos",
    description: "Crie eventos e permita que os membros confirmem presença com RSVP.",
    icon: Calendar,
    tips: [
      "Eventos com data, hora e local",
      "Sistema de RSVP integrado",
      "Galeria de fotos por evento",
      "Notificações automáticas",
    ],
    highlightSelector: "[data-tutorial='events']",
    highlightLabel: "Eventos",
  },
  {
    id: "ministries",
    title: "Ministérios",
    description: "Organize os ministérios da igreja e gerencie os membros de cada um.",
    icon: Users,
    tips: [
      "Crie ministérios personalizados",
      "Defina líderes e membros",
      "Chat exclusivo por ministério",
      "Comunicados segmentados",
    ],
    highlightSelector: "[data-tutorial='ministries']",
    highlightLabel: "Ministérios",
  },
  {
    id: "communication",
    title: "Comunicação",
    description: "Envie comunicados e mantenha todos informados sobre as novidades.",
    icon: MessageSquare,
    tips: [
      "Envie comunicados em massa",
      "Segmente por ministério ou perfil",
      "Receba pedidos de oração",
      "Mensagens de contato",
    ],
    highlightSelector: "[data-tutorial='communication']",
    highlightLabel: "Comunicação",
  },
  {
    id: "customization",
    title: "Personalização",
    description: "Customize o visual do site com as cores e logo da sua igreja.",
    icon: Palette,
    tips: [
      "Escolha temas prontos",
      "Personalize cores",
      "Adicione logo e imagens",
      "Configure seções da home",
    ],
    highlightSelector: "[data-tutorial='themes']",
    highlightLabel: "Temas",
  },
  {
    id: "gallery",
    title: "Galeria",
    description: "Compartilhe fotos dos eventos e momentos especiais da igreja.",
    icon: Image,
    tips: [
      "Upload de múltiplas fotos",
      "Organize por categorias",
      "Galeria responsiva",
      "Fotos de eventos",
    ],
    highlightSelector: "[data-tutorial='gallery']",
    highlightLabel: "Galeria",
  },
  {
    id: "notifications",
    title: "Notificações",
    description: "Envie notificações push para manter os membros sempre atualizados.",
    icon: Bell,
    tips: [
      "Push notifications",
      "Lembretes de eventos",
      "Comunicados gerais",
      "Avisos por ministério",
    ],
    highlightSelector: "[data-tutorial='broadcast']",
    highlightLabel: "Comunicação",
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Configure horários de culto, contatos e informações da igreja.",
    icon: Settings,
    tips: [
      "Horários de culto",
      "Informações de contato",
      "Redes sociais",
      "Dados da igreja",
    ],
    highlightSelector: "[data-tutorial='settings']",
    highlightLabel: "Configurações",
  },
];

const TUTORIAL_COMPLETED_KEY = "admin_tutorial_completed";

// Spotlight overlay component
const SpotlightOverlay = ({ 
  targetRect, 
  label,
  onClose 
}: { 
  targetRect: DOMRect | null;
  label?: string;
  onClose: () => void;
}) => {
  if (!targetRect) return null;

  const padding = 8;
  const spotlightRect = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] pointer-events-none"
      onClick={onClose}
    >
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlightRect.left}
              y={spotlightRect.top}
              width={spotlightRect.width}
              height={spotlightRect.height}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Highlight border */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute rounded-lg border-2 border-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        style={{
          top: spotlightRect.top,
          left: spotlightRect.left,
          width: spotlightRect.width,
          height: spotlightRect.height,
        }}
      />

      {/* Label tooltip */}
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg"
          style={{
            top: spotlightRect.top + spotlightRect.height + 12,
            left: spotlightRect.left + spotlightRect.width / 2,
            transform: "translateX(-50%)",
          }}
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
          {label}
        </motion.div>
      )}
    </motion.div>,
    document.body
  );
};

interface WelcomeTutorialModalProps {
  churchSlug?: string;
}

export const WelcomeTutorialModal = ({ churchSlug }: WelcomeTutorialModalProps) => {
  const params = useParams();
  const slug = churchSlug || params.slug || "";
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showSpotlight, setShowSpotlight] = useState(false);

  useEffect(() => {
    // Check if tutorial was already completed for this church
    const completedKey = `${TUTORIAL_COMPLETED_KEY}_${slug}`;
    const wasCompleted = localStorage.getItem(completedKey);
    
    if (!wasCompleted && slug) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  // Update highlight when step changes
  useEffect(() => {
    const step = tutorialSteps[currentStep];
    if (step.highlightSelector && isOpen) {
      const element = document.querySelector(step.highlightSelector);
      if (element) {
        setHighlightRect(element.getBoundingClientRect());
        setShowSpotlight(true);
      } else {
        setHighlightRect(null);
        setShowSpotlight(false);
      }
    } else {
      setHighlightRect(null);
      setShowSpotlight(false);
    }
  }, [currentStep, isOpen]);

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    const completedKey = `${TUTORIAL_COMPLETED_KEY}_${slug}`;
    localStorage.setItem(completedKey, "true");
    setIsOpen(false);
    setShowSpotlight(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const Icon = step.icon;

  return (
    <>
      {/* Spotlight overlay */}
      <AnimatePresence>
        {showSpotlight && highlightRect && (
          <SpotlightOverlay 
            targetRect={highlightRect} 
            label={step.highlightLabel}
            onClose={() => setShowSpotlight(false)}
          />
        )}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleComplete();
        setIsOpen(open);
      }}>
        <DialogContent className={cn(
          "sm:max-w-xl p-0 gap-0 overflow-hidden",
          showSpotlight && "z-[70]"
        )}>
          {/* Header with Progress */}
          <DialogHeader className="p-4 pb-0 space-y-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Tutorial de Introdução
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs">
                Pular
              </Button>
            </div>
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Passo {currentStep + 1} de {tutorialSteps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Icon and Title */}
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="p-4 rounded-full bg-primary/10 mb-4"
                  >
                    <Icon className="h-10 w-10 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Tips */}
                <div className="grid grid-cols-2 gap-2">
                  {step.tips.map((tip, index) => (
                    <motion.div
                      key={tip}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs">{tip}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Spotlight indicator */}
                {step.highlightSelector && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Veja o item destacado no menu lateral</span>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-primary w-4"
                      : completedSteps.has(index)
                      ? "bg-green-500"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} size="sm" className="gap-1">
              {isLastStep ? (
                <>
                  Começar
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WelcomeTutorialModal;
