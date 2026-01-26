import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Heart,
  MessageSquare,
  FileText,
  TrendingUp,
  Eye,
  Users,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  totalLikes: number;
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
}

interface PostEngagement {
  title: string;
  likes: number;
  comments: number;
}

interface DailyActivity {
  date: string;
  likes: number;
  comments: number;
}

interface CategoryDistribution {
  name: string;
  value: number;
}

const AdminBlogStats = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["blog-stats"],
    queryFn: async (): Promise<BlogStats> => {
      const [
        { count: totalPosts },
        { count: publishedPosts },
        { count: totalLikes },
        { count: totalComments },
        { count: approvedComments },
      ] = await Promise.all([
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("blog_likes").select("*", { count: "exact", head: true }),
        supabase.from("blog_comments").select("*", { count: "exact", head: true }),
        supabase.from("blog_comments").select("*", { count: "exact", head: true }).eq("is_approved", true),
      ]);

      return {
        totalPosts: totalPosts || 0,
        publishedPosts: publishedPosts || 0,
        totalLikes: totalLikes || 0,
        totalComments: totalComments || 0,
        approvedComments: approvedComments || 0,
        pendingComments: (totalComments || 0) - (approvedComments || 0),
      };
    },
  });

  const { data: topPosts, isLoading: topPostsLoading } = useQuery({
    queryKey: ["blog-top-posts"],
    queryFn: async (): Promise<PostEngagement[]> => {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("id, title")
        .eq("is_published", true);

      if (!posts || posts.length === 0) return [];

      const postsWithStats = await Promise.all(
        posts.map(async (post) => {
          const [{ count: likes }, { count: comments }] = await Promise.all([
            supabase.from("blog_likes").select("*", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("blog_comments").select("*", { count: "exact", head: true }).eq("post_id", post.id).eq("is_approved", true),
          ]);

          return {
            title: post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title,
            likes: likes || 0,
            comments: comments || 0,
          };
        })
      );

      return postsWithStats
        .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
        .slice(0, 5);
    },
  });

  const { data: dailyActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["blog-daily-activity"],
    queryFn: async (): Promise<DailyActivity[]> => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, "yyyy-MM-dd"),
          label: format(date, "EEE", { locale: ptBR }),
        };
      });

      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase
          .from("blog_likes")
          .select("created_at")
          .gte("created_at", last7Days[0].date),
        supabase
          .from("blog_comments")
          .select("created_at")
          .gte("created_at", last7Days[0].date),
      ]);

      return last7Days.map(({ date, label }) => ({
        date: label,
        likes: likes?.filter((l) => l.created_at.startsWith(date)).length || 0,
        comments: comments?.filter((c) => c.created_at.startsWith(date)).length || 0,
      }));
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      const { data } = await supabase
        .from("blog_posts")
        .select("category")
        .eq("is_published", true);

      if (!data) return [];

      const categoryCount: Record<string, number> = {};
      data.forEach((post) => {
        const cat = post.category || "Sem categoria";
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      return Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  const statCards = [
    { label: "Total de Artigos", value: stats?.totalPosts || 0, icon: FileText, color: "text-blue-500" },
    { label: "Artigos Publicados", value: stats?.publishedPosts || 0, icon: Eye, color: "text-green-500" },
    { label: "Total de Curtidas", value: stats?.totalLikes || 0, icon: Heart, color: "text-red-500" },
    { label: "Total de Comentários", value: stats?.totalComments || 0, icon: MessageSquare, color: "text-purple-500" },
    { label: "Comentários Aprovados", value: stats?.approvedComments || 0, icon: Users, color: "text-emerald-500" },
    { label: "Aguardando Aprovação", value: stats?.pendingComments || 0, icon: TrendingUp, color: "text-orange-500", highlight: (stats?.pendingComments || 0) > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estatísticas do Blog</h1>
        <p className="text-muted-foreground">
          Acompanhe o engajamento dos artigos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={stat.highlight ? "border-orange-500/50 bg-orange-500/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">
                      {statsLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    name="Curtidas"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    name="Comentários"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Artigos Mais Engajados</CardTitle>
          </CardHeader>
          <CardContent>
            {topPostsLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : topPosts && topPosts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topPosts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="title" type="category" width={120} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="likes" name="Curtidas" fill="hsl(var(--primary))" />
                  <Bar dataKey="comments" name="Comentários" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum artigo publicado ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : categories && categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Nenhum artigo publicado ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex flex-col items-center justify-center">
              {statsLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <>
                  <div className="text-5xl font-bold text-primary">
                    {stats?.publishedPosts
                      ? (((stats.totalLikes + stats.totalComments) / stats.publishedPosts)).toFixed(1)
                      : "0"}
                  </div>
                  <p className="text-muted-foreground mt-2">
                    interações por artigo
                  </p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{stats?.totalLikes || 0} curtidas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      <span>{stats?.approvedComments || 0} comentários</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBlogStats;
