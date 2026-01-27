import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailType = "payment_confirmed" | "payment_overdue" | "church_suspended" | "subscription_cancelled" | "free_account_used";

interface EmailPayload {
  type: EmailType;
  to: string;
  churchName: string;
  ownerName: string;
  planName?: string;
  daysOverdue?: number;
  grantedEmail?: string;
}

const getEmailTemplate = (payload: EmailPayload) => {
  const { type, churchName, ownerName, planName, daysOverdue, grantedEmail } = payload;

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
