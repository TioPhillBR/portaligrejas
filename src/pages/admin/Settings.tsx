import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "@/components/admin/ImageUpload";
import { formatCNPJ, formatPhone, formatBankAgency, formatBankCode } from "@/hooks/useInputMask";

interface SiteSettings {
  general: {
    church_name: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  radio: {
    stream_url: string;
    name: string;
  };
  video: {
    youtube_id: string;
    title: string;
  };
  donations: {
    pix_key: string;
    pix_type: string;
    pix_image_url: string;
    pix_copy_paste: string;
    bank_name: string;
    bank_code: string;
    agency: string;
    account: string;
    holder: string;
    cnpj: string;
  };
}

const defaultSettings: SiteSettings = {
  general: { church_name: "", phone: "", whatsapp: "", email: "", address: "" },
  social: { facebook: "", instagram: "", youtube: "" },
  radio: { stream_url: "", name: "" },
  video: { youtube_id: "", title: "" },
  donations: { pix_key: "", pix_type: "email", pix_image_url: "", pix_copy_paste: "", bank_name: "", bank_code: "", agency: "", account: "", holder: "", cnpj: "" },
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { uploadImage, uploading, progress } = useImageUpload({ folder: "settings" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*");

    if (error) {
      toast({ title: "Erro ao carregar configurações", variant: "destructive" });
    } else if (data) {
      const newSettings = { ...defaultSettings };
      data.forEach((item) => {
        if (item.key in newSettings) {
          const existingValue = (newSettings as any)[item.key];
          const newValue = typeof item.value === 'object' && item.value !== null ? item.value : {};
          (newSettings as any)[item.key] = { ...existingValue, ...newValue };
        }
      });
      setSettings(newSettings);
    }
    setLoading(false);
  };

  const saveSettings = async (key: keyof SiteSettings) => {
    setSaving(key);

    const { error } = await supabase
      .from("site_settings")
      .update({ value: settings[key] })
      .eq("key", key);

    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: "Configurações salvas!" });
    }

    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações gerais do site</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          <TabsTrigger value="radio">Web Rádio</TabsTrigger>
          <TabsTrigger value="video">Vídeo</TabsTrigger>
          <TabsTrigger value="donations">Doações</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>Dados básicos da igreja exibidos no site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome da Igreja</Label>
                <Input
                  value={settings.general.church_name}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, church_name: e.target.value } })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={settings.general.phone}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, phone: formatPhone(e.target.value) } })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label>WhatsApp (com código do país)</Label>
                  <Input
                    value={settings.general.whatsapp}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, whatsapp: e.target.value.replace(/\D/g, "") } })}
                    placeholder="5511999999999"
                  />
                </div>
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={settings.general.email}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, email: e.target.value } })}
                />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input
                  value={settings.general.address}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, address: e.target.value } })}
                />
              </div>
              <Button onClick={() => saveSettings("general")} disabled={saving === "general"} className="gap-2">
                {saving === "general" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>Links das redes sociais da igreja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Facebook</Label>
                <Input
                  value={settings.social.facebook}
                  onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })}
                  placeholder="https://facebook.com/suaigreja"
                />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input
                  value={settings.social.instagram}
                  onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
                  placeholder="https://instagram.com/suaigreja"
                />
              </div>
              <div>
                <Label>YouTube</Label>
                <Input
                  value={settings.social.youtube}
                  onChange={(e) => setSettings({ ...settings, social: { ...settings.social, youtube: e.target.value } })}
                  placeholder="https://youtube.com/@suaigreja"
                />
              </div>
              <Button onClick={() => saveSettings("social")} disabled={saving === "social"} className="gap-2">
                {saving === "social" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radio Settings */}
        <TabsContent value="radio">
          <Card>
            <CardHeader>
              <CardTitle>Web Rádio</CardTitle>
              <CardDescription>Configurações do player de rádio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome da Rádio</Label>
                <Input
                  value={settings.radio.name}
                  onChange={(e) => setSettings({ ...settings, radio: { ...settings.radio, name: e.target.value } })}
                />
              </div>
              <div>
                <Label>URL do Stream</Label>
                <Input
                  value={settings.radio.stream_url}
                  onChange={(e) => setSettings({ ...settings, radio: { ...settings.radio, stream_url: e.target.value } })}
                  placeholder="https://stream.zeno.fm/..."
                />
              </div>
              <Button onClick={() => saveSettings("radio")} disabled={saving === "radio"} className="gap-2">
                {saving === "radio" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Settings */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Vídeo Institucional</CardTitle>
              <CardDescription>Configurações do vídeo exibido no site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título do Vídeo</Label>
                <Input
                  value={settings.video.title}
                  onChange={(e) => setSettings({ ...settings, video: { ...settings.video, title: e.target.value } })}
                />
              </div>
              <div>
                <Label>ID do Vídeo do YouTube</Label>
                <Input
                  value={settings.video.youtube_id}
                  onChange={(e) => setSettings({ ...settings, video: { ...settings.video, youtube_id: e.target.value } })}
                  placeholder="dQw4w9WgXcQ"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O ID é a parte final da URL do YouTube (ex: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                </p>
              </div>
              <Button onClick={() => saveSettings("video")} disabled={saving === "video"} className="gap-2">
                {saving === "video" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donations Settings */}
        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Doações</CardTitle>
              <CardDescription>Configurações de PIX e dados bancários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PIX QR Code Image */}
              <div>
                <Label className="text-base font-semibold">QR Code PIX</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Carregue a imagem do QR Code PIX que será exibida na página de doações
                </p>
                <ImageUpload
                  value={settings.donations.pix_image_url}
                  onChange={(url) => setSettings({ ...settings, donations: { ...settings.donations, pix_image_url: url || "" } })}
                  onUpload={uploadImage}
                  uploading={uploading}
                  progress={progress}
                  aspectRatio="square"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Dados do PIX</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Chave PIX</Label>
                    <Input
                      value={settings.donations.pix_key}
                      onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, pix_key: e.target.value } })}
                    />
                  </div>
                  <div>
                    <Label>Tipo (email, cpf, cnpj, telefone)</Label>
                    <Input
                      value={settings.donations.pix_type}
                      onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, pix_type: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>PIX Copia e Cola</Label>
                  <Input
                    value={settings.donations.pix_copy_paste}
                    onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, pix_copy_paste: e.target.value } })}
                    placeholder="Cole aqui o código PIX copia e cola completo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Código PIX gerado pelo seu banco para pagamentos instantâneos
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Dados Bancários</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Banco</Label>
                    <Input
                      value={settings.donations.bank_name}
                      onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, bank_name: e.target.value } })}
                      placeholder="Banco do Brasil"
                    />
                  </div>
                  <div>
                    <Label>Código do Banco</Label>
                    <Input
                      value={settings.donations.bank_code}
                      onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, bank_code: formatBankCode(e.target.value) } })}
                      placeholder="001"
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Agência</Label>
                    <Input
                      value={settings.donations.agency}
                      onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, agency: formatBankAgency(e.target.value) } })}
                      placeholder="1234-5"
                    />
                  </div>
                  <div>
                    <Label>Conta</Label>
                    <Input
                      value={settings.donations.account}
                      onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, account: e.target.value } })}
                      placeholder="12345-6"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Titular</Label>
                  <Input
                    value={settings.donations.holder}
                    onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, holder: e.target.value } })}
                  />
                </div>
                <div className="mt-4">
                  <Label>CNPJ</Label>
                  <Input
                    value={settings.donations.cnpj}
                    onChange={(e) => setSettings({ ...settings, donations: { ...settings.donations, cnpj: formatCNPJ(e.target.value) } })}
                    placeholder="12.345.678/0001-90"
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings("donations")} disabled={saving === "donations" || uploading} className="gap-2">
                {saving === "donations" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
