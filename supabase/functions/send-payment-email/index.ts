import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailType = "payment_confirmed" | "payment_overdue" | "church_suspended" | "subscription_cancelled" | "free_account_used" | "invoice_reminder_3days" | "invoice_reminder_1day" | "welcome_church";

interface EmailPayload {
  type: EmailType;
  to: string;
  churchName: string;
  ownerName: string;
  planName?: string;
  daysOverdue?: number;
  grantedEmail?: string;
  amount?: number;
  dueDate?: string;
  slug?: string;
  adminUrl?: string;
}

const getEmailTemplate = (payload: EmailPayload) => {
  const { type, churchName, ownerName, planName, daysOverdue, grantedEmail, amount, dueDate, slug, adminUrl } = payload;

  switch (type) {
    case "payment_confirmed":
      return {
        subject: `🎉 Pagamento confirmado - ${churchName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ Pagamento Confirmado!</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${ownerName || 'Administrador'}</strong>!</p>
              <p>Seu pagamento para <strong>${churchName}</strong> foi confirmado com sucesso.</p>
              ${planName ? `<p>Plano ativado: <strong>${planName.charAt(0).toUpperCase() + planName.slice(1)}</strong></p>` : ''}
              <p>Sua igreja já está ativa e com todos os recursos disponíveis!</p>
              <p>Obrigado por confiar no Portal Igrejas.</p>
            </div>
            <div class="footer">
              <p>Portal Igrejas - Seu site no ar em poucos minutos</p>
            </div>
          </body>
          </html>
        `,
      };

    case "payment_overdue":
      const daysRemaining = 7 - (daysOverdue || 0);
      return {
        subject: `⚠️ Pagamento pendente - ${churchName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>⚠️ Pagamento Pendente</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${ownerName || 'Administrador'}</strong>!</p>
              <p>Identificamos que o pagamento da assinatura de <strong>${churchName}</strong> está em atraso.</p>
              <div class="warning">
                <strong>Atenção:</strong> ${daysRemaining > 0 
                  ? `Sua igreja será suspensa em <strong>${daysRemaining} dia(s)</strong> caso o pagamento não seja regularizado.`
                  : 'Sua igreja será suspensa em breve se o pagamento não for regularizado.'}
              </div>
              <p>Por favor, regularize seu pagamento para continuar utilizando todos os recursos do Portal Igrejas.</p>
              <p>Se você já realizou o pagamento, por favor desconsidere este aviso.</p>
            </div>
            <div class="footer">
              <p>Portal Igrejas - Seu site no ar em poucos minutos</p>
            </div>
          </body>
          </html>
        `,
      };

    case "church_suspended":
      return {
        subject: `🚫 Igreja suspensa - ${churchName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🚫 Igreja Suspensa</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${ownerName || 'Administrador'}</strong>!</p>
              <div class="alert">
                <strong>Sua igreja <em>${churchName}</em> foi suspensa</strong> devido ao pagamento em atraso por mais de 7 dias.
              </div>
              <p>O site da sua igreja não está mais acessível ao público enquanto a situação não for regularizada.</p>
              <p><strong>Para reativar sua igreja:</strong></p>
              <ol>
                <li>Acesse sua conta no Portal Igrejas</li>
                <li>Regularize o pagamento pendente</li>
                <li>Sua igreja será reativada automaticamente após a confirmação do pagamento</li>
              </ol>
              <p>Se precisar de ajuda, entre em contato com nosso suporte.</p>
            </div>
            <div class="footer">
              <p>Portal Igrejas - Seu site no ar em poucos minutos</p>
            </div>
          </body>
          </html>
        `,
      };

    case "subscription_cancelled":
      return {
        subject: `📋 Assinatura cancelada - ${churchName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .info { background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📋 Assinatura Cancelada</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${ownerName || 'Administrador'}</strong>!</p>
              <p>A assinatura de <strong>${churchName}</strong> foi cancelada.</p>
              <div class="info">
                <strong>O que acontece agora:</strong>
                <ul>
                  <li>Sua igreja foi migrada para o <strong>plano gratuito</strong></li>
                  <li>Você ainda pode acessar os recursos básicos</li>
                  <li>Recursos premium não estarão mais disponíveis</li>
                </ul>
              </div>
              <p>Sentiremos sua falta! Caso queira retornar, estaremos aqui para ajudá-lo.</p>
              <p>Se você não solicitou este cancelamento, entre em contato com nosso suporte imediatamente.</p>
            </div>
            <div class="footer">
              <p>Portal Igrejas - Seu site no ar em poucos minutos</p>
            </div>
          </body>
          </html>
        `,
      };

    case "free_account_used":
      return {
        subject: `🎁 Conta gratuita utilizada - ${grantedEmail}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .info { background: #ede9fe; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎁 Conta Gratuita Utilizada</h1>
            </div>
            <div class="content">
              <p>Olá, Administrador!</p>
              <div class="info">
                <p><strong>Email:</strong> ${grantedEmail}</p>
                <p><strong>Igreja criada:</strong> ${churchName}</p>
                <p><strong>Plano concedido:</strong> ${planName?.charAt(0).toUpperCase()}${planName?.slice(1) || 'Prata'}</p>
              </div>
              <p>Uma conta gratuita que você provisionou foi utilizada com sucesso.</p>
              <p>A igreja já está ativa com o plano concedido.</p>
            </div>
            <div class="footer">
              <p>Portal Igrejas - Notificação Administrativa</p>
            </div>
          </body>
          </html>
        `,
      };

    case "invoice_reminder_3days":
      return {
        subject: `📅 Lembrete: Fatura vence em 3 dias - ${churchName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📅 Lembrete de Pagamento</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${ownerName || 'Administrador'}</strong>!</p>
              <p>Sua fatura de <strong>${churchName}</strong> vence em <strong>3 dias</strong>.</p>
              <div class="info">
                <p><strong>Valor:</strong> R$ ${amount?.toFixed(2).replace(".", ",") || "0,00"}</p>
                <p><strong>Vencimento:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString("pt-BR") : "Em breve"}</p>
                <p><strong>Plano:</strong> ${planName?.charAt(0).toUpperCase()}${planName?.slice(1) || "Assinatura"}</p>
              </div>
              <p>Para evitar a suspensão do seu site, efetue o pagamento antes do vencimento.</p>
              <p>Obrigado por fazer parte do Portal Igrejas!</p>
            </div>
            <div class="footer">
              <p>Portal Igrejas - Seu site no ar em poucos minutos</p>
            </div>
          </body>
          </html>
        `,
      };

    case "invoice_reminder_1day":
      return {
        subject: `⚡ Urgente: Fatura vence amanhã - ${churchName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>⚡ Último Aviso!</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${ownerName || 'Administrador'}</strong>!</p>
              <p>Sua fatura de <strong>${churchName}</strong> vence <strong>amanhã</strong>!</p>
              <div class="warning">
                <p><strong>⚠️ Atenção:</strong> Após o vencimento, seu site poderá ser suspenso se o pagamento não for regularizado em até 7 dias.</p>
                <p><strong>Valor:</strong> R$ ${amount?.toFixed(2).replace(".", ",") || "0,00"}</p>
                <p><strong>Vencimento:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString("pt-BR") : "Amanhã"}</p>
              </div>
              <p>Efetue o pagamento hoje para garantir que seu site continue ativo!</p>
            </div>
            <div class="footer">
              <p>Portal Igrejas - Seu site no ar em poucos minutos</p>
            </div>
          </body>
          </html>
        `,
      };

    case "welcome_church":
      const siteUrl = slug ? `https://portaligrejas.com.br/${slug}` : "#";
      const adminPanelUrl = adminUrl || (slug ? `https://portaligrejas.com.br/${slug}/admin` : "#");
      return {
        subject: `🎉 Bem-vindo ao Portal Igrejas - ${churchName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f4f6; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px; border-radius: 16px 16px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
              .content { background: white; padding: 40px; border-radius: 0 0 16px 16px; }
              .welcome-box { background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
              .welcome-box h2 { color: #1d4ed8; margin: 0 0 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: 600; }
              .button.secondary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
              .steps { margin: 30px 0; }
              .step { display: flex; align-items: flex-start; margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
              .step-number { background: #3b82f6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
              .step-content { flex: 1; }
              .step-content strong { color: #1f2937; }
              .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
              .feature { background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; }
              .feature-icon { font-size: 24px; margin-bottom: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .social { margin: 20px 0; }
              .social a { color: #3b82f6; text-decoration: none; margin: 0 10px; }
              @media (max-width: 480px) {
                .features { grid-template-columns: 1fr; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Bem-vindo ao Portal Igrejas!</h1>
              <p>Sua igreja está oficialmente online</p>
            </div>
            <div class="content">
              <p>Olá, <strong>${ownerName || 'Administrador'}</strong>!</p>
              
              <div class="welcome-box">
                <h2>✨ ${churchName}</h2>
                <p>Sua igreja foi ativada com o <strong>Plano ${planName ? planName.charAt(0).toUpperCase() + planName.slice(1) : 'Premium'}</strong></p>
              </div>

              <p>Estamos muito felizes em tê-lo conosco! Seu site já está no ar e pronto para receber seus membros.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${adminPanelUrl}" class="button">Acessar Painel Administrativo</a>
                <a href="${siteUrl}" class="button secondary">Ver Meu Site</a>
              </div>

              <h3 style="color: #1f2937;">📋 Próximos passos para começar:</h3>
              
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <strong>Adicione o logo da sua igreja</strong><br>
                    <span style="color: #6b7280;">Personalize a identidade visual do seu site</span>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <strong>Configure os horários de culto</strong><br>
                    <span style="color: #6b7280;">Informe seus membros sobre os horários dos cultos</span>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <strong>Crie seu primeiro evento</strong><br>
                    <span style="color: #6b7280;">Divulgue os próximos eventos da sua igreja</span>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <strong>Adicione seus ministérios</strong><br>
                    <span style="color: #6b7280;">Apresente os ministérios e grupos da sua igreja</span>
                  </div>
                </div>
              </div>

              <h3 style="color: #1f2937;">🚀 Recursos disponíveis no seu plano:</h3>
              
              <div class="features">
                <div class="feature">
                  <div class="feature-icon">📅</div>
                  <strong>Eventos</strong>
                </div>
                <div class="feature">
                  <div class="feature-icon">👥</div>
                  <strong>Ministérios</strong>
                </div>
                <div class="feature">
                  <div class="feature-icon">📝</div>
                  <strong>Blog</strong>
                </div>
                <div class="feature">
                  <div class="feature-icon">🖼️</div>
                  <strong>Galeria</strong>
                </div>
                <div class="feature">
                  <div class="feature-icon">🔔</div>
                  <strong>Notificações</strong>
                </div>
                <div class="feature">
                  <div class="feature-icon">💬</div>
                  <strong>Chat de Grupos</strong>
                </div>
              </div>

              <p style="margin-top: 30px;">Se precisar de ajuda, nossa equipe está à disposição para auxiliar você.</p>
              
              <p>Que Deus abençoe o ministério de <strong>${churchName}</strong>! 🙏</p>
            </div>
            <div class="footer">
              <p><strong>Portal Igrejas</strong></p>
              <p>Seu site profissional no ar em poucos minutos</p>
              <div class="social">
                <a href="https://portaligrejas.com.br">Site</a> |
                <a href="mailto:suporte@portaligrejas.com.br">Suporte</a>
              </div>
              <p style="font-size: 12px; color: #9ca3af;">
                Este email foi enviado porque você cadastrou sua igreja no Portal Igrejas.
              </p>
            </div>
          </body>
          </html>
        `,
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const payload: EmailPayload = await req.json();

    console.log("Sending email:", payload.type, "to:", payload.to);

    const template = getEmailTemplate(payload);

    const { data, error } = await resend.emails.send({
      from: "Portal Igrejas <noreply@portaligrejas.com.br>",
      to: [payload.to],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
