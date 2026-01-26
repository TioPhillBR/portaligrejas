import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Setup from "./pages/Setup";
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
import AdminComments from "./pages/admin/Comments";
import AdminHomeSections from "./pages/admin/HomeSections";
import EventDetails from "./pages/EventDetails";
import MinistryDetails from "./pages/MinistryDetails";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/evento/:id" element={<EventDetails />} />
            <Route path="/ministerio/:id" element={<MinistryDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
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
              <Route path="comentarios" element={<AdminComments />} />
            </Route>
            
            {/* Member Routes */}
            <Route path="/membro" element={<MemberLayout />}>
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
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
