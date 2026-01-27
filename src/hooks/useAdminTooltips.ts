import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "admin-visited-sections";

interface TooltipConfig {
  sectionKey: string;
  title: string;
  description: string;
}

export const ADMIN_TOOLTIPS: Record<string, TooltipConfig> = {
  "/admin": {
    sectionKey: "dashboard",
    title: "Bem-vindo ao Dashboard!",
    description: "Aqui você tem uma visão geral de todas as atividades da sua igreja. Veja estatísticas, mensagens pendentes e acesse ações rápidas.",
  },
  "/admin/secoes": {
    sectionKey: "sections",
    title: "Seções da Home",
    description: "Personalize o conteúdo que aparece na página inicial do seu site. Arraste para reordenar ou ative/desative seções.",
  },
  "/admin/horarios": {
    sectionKey: "schedules",
    title: "Horários de Culto",
    description: "Configure os horários dos cultos e reuniões da sua igreja. Eles aparecerão automaticamente no site.",
  },
  "/admin/eventos": {
    sectionKey: "events",
    title: "Gerenciar Eventos",
    description: "Crie e gerencie eventos especiais. Os membros poderão confirmar presença diretamente pelo site.",
  },
  "/admin/ministerios": {
    sectionKey: "ministries",
    title: "Ministérios",
    description: "Organize os ministérios da igreja. Membros podem solicitar participação pelo portal.",
  },
  "/admin/galeria": {
    sectionKey: "gallery",
    title: "Galeria de Fotos",
    description: "Compartilhe momentos especiais da comunidade. As fotos aparecerão na seção de galeria do site.",
  },
  "/admin/blog": {
    sectionKey: "blog",
    title: "Blog",
    description: "Publique artigos, devocionais e notícias. Use categorias e tags para organizar o conteúdo.",
  },
  "/admin/comunicacao": {
    sectionKey: "broadcast",
    title: "Comunicação",
    description: "Envie mensagens para grupos específicos: por ministério, gênero ou faixa etária.",
  },
  "/admin/mensagens": {
    sectionKey: "messages",
    title: "Mensagens",
    description: "Visualize e responda mensagens enviadas pelo formulário de contato do site.",
  },
  "/admin/oracoes": {
    sectionKey: "prayers",
    title: "Pedidos de Oração",
    description: "Acompanhe os pedidos de oração enviados pela comunidade. Ore por cada necessidade!",
  },
  "/admin/configuracoes": {
    sectionKey: "settings",
    title: "Configurações",
    description: "Personalize as informações básicas da igreja: nome, endereço, contatos e redes sociais.",
  },
  "/admin/temas": {
    sectionKey: "themes",
    title: "Personalização de Temas",
    description: "Escolha cores e personalize a aparência do seu site para combinar com a identidade da sua igreja.",
  },
  "/admin/usuarios": {
    sectionKey: "users",
    title: "Gestão de Usuários",
    description: "Gerencie permissões e papéis dos membros da equipe administrativa.",
  },
  "/admin/assinatura": {
    sectionKey: "subscription",
    title: "Assinatura",
    description: "Gerencie seu plano, veja recursos disponíveis e faça upgrade quando precisar de mais funcionalidades.",
  },
};

export function useAdminTooltips() {
  const [visitedSections, setVisitedSections] = useState<string[]>([]);
  const [currentTooltip, setCurrentTooltip] = useState<TooltipConfig | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setVisitedSections(JSON.parse(stored));
    }
  }, []);

  const checkAndShowTooltip = useCallback((pathname: string) => {
    const config = ADMIN_TOOLTIPS[pathname];
    
    if (config && !visitedSections.includes(config.sectionKey)) {
      setCurrentTooltip(config);
      setIsTooltipVisible(true);
    } else {
      setCurrentTooltip(null);
      setIsTooltipVisible(false);
    }
  }, [visitedSections]);

  const dismissTooltip = useCallback(() => {
    if (currentTooltip) {
      const newVisited = [...visitedSections, currentTooltip.sectionKey];
      setVisitedSections(newVisited);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisited));
    }
    setIsTooltipVisible(false);
    setCurrentTooltip(null);
  }, [currentTooltip, visitedSections]);

  const resetAllTooltips = useCallback(() => {
    setVisitedSections([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    currentTooltip,
    isTooltipVisible,
    checkAndShowTooltip,
    dismissTooltip,
    resetAllTooltips,
    visitedSections,
  };
}
