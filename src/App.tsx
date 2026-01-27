import { forwardRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";

// Landing pages
import LandingPage from "./pages/landing/LandingPage";
import CreateChurch from "./pages/landing/CreateChurch";
import ChurchWizard from "./pages/onboarding/ChurchWizard";
import OnboardingPage from "./pages/onboarding/OnboardingPage";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Setup from "./pages/Setup";

// Church site pages
import Index from "./pages/Index";
import EventDetails from "./pages/EventDetails";
import MinistryDetails from "./pages/MinistryDetails";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Churches list
import ChurchesList from "./pages/ChurchesList";

// Checkout pages
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutRecovery from "./pages/CheckoutRecovery";
import Pricing from "./pages/Pricing";

// Admin components
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSchedules from "./pages/admin/Schedules";
import AdminEvents from "./pages/admin/Events";
import AdminMinistries from "./pages/admin/Ministries";
import AdminGallery from "./pages/admin/Gallery";
import AdminSettings from "./pages/admin/Settings";
import AdminPrayerRequests from "./pages/admin/PrayerRequests";
import AdminMessages from "./pages/admin/Messages";
import AdminUsers from "./pages/admin/Users";
import AdminBroadcast from "./pages/admin/Broadcast";
import AdminBlog from "./pages/admin/Blog";
import AdminBlogStats from "./pages/admin/BlogStats";
import AdminBlogCategories from "./pages/admin/BlogCategories";
import AdminBlogTags from "./pages/admin/BlogTags";
import AdminComments from "./pages/admin/Comments";
import AdminHomeSections from "./pages/admin/HomeSections";
import AdminEntityPhotos from "./pages/admin/EntityPhotos";
import AdminThemeSettings from "./pages/admin/ThemeSettings";
import AdminSubscription from "./pages/admin/Subscription";
import AdminPaymentHistory from "./pages/admin/PaymentHistory";
import AdminAnalytics from "./pages/admin/Analytics";

// Platform admin components
import PlatformLayout from "./components/platform/PlatformLayout";
import PlatformDashboard from "./pages/platform/PlatformDashboard";
import PlatformChurches from "./pages/platform/PlatformChurches";
import PlatformTickets from "./pages/platform/PlatformTickets";
import PlatformUsers from "./pages/platform/PlatformUsers";
import PlatformSubscriptions from "./pages/platform/PlatformSubscriptions";
import PlatformReports from "./pages/platform/PlatformReports";
import PlatformSettings from "./pages/platform/PlatformSettings";
import PlatformCoupons from "./pages/platform/PlatformCoupons";

// Member components
import MemberLayout from "./components/member/MemberLayout";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberProfile from "./pages/member/MemberProfile";
import MemberMinistries from "./pages/member/MemberMinistries";
import MemberGroups from "./pages/member/MemberGroups";
import MinistryChat from "./pages/member/MinistryChat";
import MemberDirectMessages from "./pages/member/MemberDirectMessages";
import DirectMessageChat from "./pages/member/DirectMessageChat";
import MemberBroadcasts from "./pages/member/MemberBroadcasts";
import MemberEvents from "./pages/member/MemberEvents";
import MemberSearch from "./pages/member/MemberSearch";
import MemberSupport from "./pages/member/MemberSupport";

// Church site wrapper
import { ChurchProvider } from "./contexts/ChurchContext";
import RouteGuard from "./components/RouteGuard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component for church routes with forwardRef support
const ChurchRouteWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <ChurchProvider ref={ref}>
      <RouteGuard>{children}</RouteGuard>
    </ChurchProvider>
  )
);
ChurchRouteWrapper.displayName = "ChurchRouteWrapper";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* ===== LANDING PAGE (SaaS) ===== */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/criar-igreja" element={<CreateChurch />} />
              <Route path="/criar-igreja/wizard" element={<ChurchWizard />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/onboarding/:slug" element={<OnboardingPage />} />
              <Route path="/igrejas" element={<ChurchesList />} />
              <Route path="/planos" element={<Pricing />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/sucesso" element={<CheckoutSuccess />} />
              <Route path="/checkout/recuperar" element={<CheckoutRecovery />} />
              
              {/* ===== AUTH PAGES ===== */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/setup" element={<Setup />} />
              
              {/* ===== PLATFORM ADMIN ROUTES (/plataforma) ===== */}
              <Route path="/plataforma" element={<PlatformLayout />}>
                <Route index element={<PlatformDashboard />} />
                <Route path="igrejas" element={<PlatformChurches />} />
                <Route path="tickets" element={<PlatformTickets />} />
                <Route path="usuarios" element={<PlatformUsers />} />
                <Route path="assinaturas" element={<PlatformSubscriptions />} />
                <Route path="relatorios" element={<PlatformReports />} />
                <Route path="cupons" element={<PlatformCoupons />} />
                <Route path="configuracoes" element={<PlatformSettings />} />
              </Route>
              
              {/* ===== CHURCH SITE ROUTES (/:slug) ===== */}
              {/* Church homepage - directly at root level */}
              <Route path="/:slug" element={
                <ChurchRouteWrapper>
                  <Index />
                </ChurchRouteWrapper>
              } />
              
              {/* Church event details */}
              <Route path="/:slug/evento/:id" element={
                <ChurchRouteWrapper>
                  <EventDetails />
                </ChurchRouteWrapper>
              } />
              
              {/* Church ministry details */}
              <Route path="/:slug/ministerio/:id" element={
                <ChurchRouteWrapper>
                  <MinistryDetails />
                </ChurchRouteWrapper>
              } />
              
              {/* Church blog */}
              <Route path="/:slug/blog" element={
                <ChurchRouteWrapper>
                  <Blog />
                </ChurchRouteWrapper>
              } />
              
              {/* Church blog post */}
              <Route path="/:slug/blog/:postSlug" element={
                <ChurchRouteWrapper>
                  <BlogPost />
                </ChurchRouteWrapper>
              } />
              
              {/* ===== CHURCH ADMIN ROUTES (/:slug/admin) ===== */}
              <Route path="/:slug/admin" element={
                <ChurchRouteWrapper>
                  <AdminLayout />
                </ChurchRouteWrapper>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="secoes" element={<AdminHomeSections />} />
                <Route path="horarios" element={<AdminSchedules />} />
                <Route path="eventos" element={<AdminEvents />} />
                <Route path="ministerios" element={<AdminMinistries />} />
                <Route path="galeria" element={<AdminGallery />} />
                <Route path="configuracoes" element={<AdminSettings />} />
                <Route path="oracoes" element={<AdminPrayerRequests />} />
                <Route path="mensagens" element={<AdminMessages />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="comunicacao" element={<AdminBroadcast />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="blog/estatisticas" element={<AdminBlogStats />} />
                <Route path="blog/categorias" element={<AdminBlogCategories />} />
                <Route path="blog/tags" element={<AdminBlogTags />} />
                <Route path="comentarios" element={<AdminComments />} />
                <Route path="fotos/:entityType/:entityId" element={<AdminEntityPhotos />} />
                <Route path="temas" element={<AdminThemeSettings />} />
                <Route path="assinatura" element={<AdminSubscription />} />
                <Route path="faturas" element={<AdminPaymentHistory />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>
              
              {/* ===== CHURCH MEMBER ROUTES (/:slug/membro) ===== */}
              <Route path="/:slug/membro" element={
                <ChurchRouteWrapper>
                  <MemberLayout />
                </ChurchRouteWrapper>
              }>
                <Route index element={<MemberDashboard />} />
                <Route path="perfil" element={<MemberProfile />} />
                <Route path="eventos" element={<MemberEvents />} />
                <Route path="ministerios" element={<MemberMinistries />} />
                <Route path="grupos" element={<MemberGroups />} />
                <Route path="grupos/:ministryId" element={<MinistryChat />} />
                <Route path="mensagens" element={<MemberDirectMessages />} />
                <Route path="mensagens/:recipientId" element={<DirectMessageChat />} />
                <Route path="buscar" element={<MemberSearch />} />
                <Route path="avisos" element={<MemberBroadcasts />} />
                <Route path="suporte" element={<MemberSupport />} />
              </Route>
              
              {/* ===== 404 ===== */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
