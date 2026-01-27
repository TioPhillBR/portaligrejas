import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Church, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LayoutDashboard,
  Palette,
  Image,
  Bell,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Rocket,
  ExternalLink
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  actionLabel?: string;
  actionLink?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Portal Igrejas!",
    description: "Parabéns por criar o site da sua igreja! Vamos te guiar pelos principais recursos para você aproveitar ao máximo a plataforma.",
    icon: Rocket,
    features: [
      "Site profissional para sua igreja",
      "Gestão completa de membros",
      "Comunicação integrada",
      "Eventos e calendário",
    ],
  },
  {
    id: "dashboard",
    title: "Painel Administrativo",
    description: "O Dashboard é o centro de controle da sua igreja. Aqui você pode acompanhar estatísticas e acessar todas as funcionalidades.",
    icon: LayoutDashboard,
    features: [
      "Visão geral de membros ativos",
      "Próximos eventos",
      "Mensagens pendentes",
      "Acesso rápido às configurações",
    ],
    actionLabel: "Ir para Dashboard",
    actionLink: "/admin",
  },
  {
    id: "members",
    title: "Gestão de Membros",
    description: "Gerencie os membros da sua igreja, organize ministérios e acompanhe a participação de cada um.",
    icon: Users,
    features: [
      "Cadastro completo de membros",
      "Organização por ministérios",
      "Controle de presença",
      "Comunicação direta",
    ],
    actionLabel: "Ver Membros",
    actionLink: "/admin/usuarios",
  },
  {
    id: "events",
    title: "Eventos e Calendário",
    description: "Crie e gerencie eventos da igreja. Os membros podem confirmar presença e receber notificações.",
    icon: Calendar,
    features: [
      "Criação de eventos",
      "RSVP integrado",
      "Notificações automáticas",
      "Galeria de fotos por evento",
    ],
    actionLabel: "Gerenciar Eventos",
    actionLink: "/admin/eventos",
  },
  {
    id: "communication",
    title: "Comunicação",
    description: "Mantenha sua comunidade informada com ferramentas de comunicação integradas.",
    icon: MessageSquare,
    features: [
      "Avisos e comunicados",
      "Chat por ministério",
      "Mensagens diretas",
      "Pedidos de oração",
    ],
    actionLabel: "Ver Mensagens",
    actionLink: "/admin/mensagens",
  },
  {
    id: "customization",
    title: "Personalização",
    description: "Personalize o visual do site da sua igreja com cores, logo e conteúdo próprio.",
    icon: Palette,
    features: [
      "Temas e cores personalizadas",
      "Upload de logo e imagens",
      "Edição de seções da home",
      "Informações de contato",
    ],
    actionLabel: "Personalizar",
    actionLink: "/admin/tema",
  },
  {
    id: "gallery",
    title: "Galeria de Fotos",
    description: "Compartilhe momentos especiais da igreja com uma galeria de fotos organizada.",
    icon: Image,
    features: [
      "Upload de múltiplas fotos",
      "Organização por categorias",
      "Fotos de eventos",
      "Galeria responsiva",
    ],
    actionLabel: "Ver Galeria",
    actionLink: "/admin/galeria",
  },
  {
    id: "notifications",
    title: "Notificações",
    description: "Envie notificações push para manter os membros atualizados sobre novidades.",
    icon: Bell,
    features: [
      "Notificações push",
      "Avisos por ministério",
      "Lembretes de eventos",
      "Comunicados gerais",
    ],
    actionLabel: "Enviar Comunicado",
    actionLink: "/admin/broadcast",
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Configure todas as opções da sua igreja: horários, contatos, redes sociais e muito mais.",
    icon: Settings,
    features: [
      "Horários de culto",
      "Informações de contato",
      "Redes sociais",
      "Configurações avançadas",
    ],
    actionLabel: "Configurar",
    actionLink: "/admin/configuracoes",
  },
];

interface OnboardingTutorialProps {
  churchSlug: string;
  onComplete: () => void;
}

export const OnboardingTutorial = ({ churchSlug, onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    onComplete();
  };

  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Progress Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Church className="h-5 w-5 text-primary" />
              <span className="font-semibold">Tutorial de Introdução</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Pular tutorial
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Passo {currentStep + 1} de {tutorialSteps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 shadow-lg">
                <CardContent className="p-8">
                  {/* Icon and Title */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="p-4 rounded-full bg-primary/10 mb-4"
                    >
                      <Icon className="h-12 w-12 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
                    <p className="text-muted-foreground max-w-md">{step.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {step.features.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {step.actionLink && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mb-6"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => window.open(`/${churchSlug}${step.actionLink}`, "_blank")}
                      >
                        {step.actionLabel}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            {/* Step Indicators */}
            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-primary w-6"
                      : completedSteps.has(index)
                      ? "bg-green-500"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} className="gap-2">
              {isLastStep ? (
                <>
                  Concluir
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
        </div>
      </main>
    </div>
  );
};

export default OnboardingTutorial;
