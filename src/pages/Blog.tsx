import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, ArrowRight, Search, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/MobileFooter";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import PageTransition from "@/components/PageTransition";

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug, color")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as BlogCategory[];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["blog-tags-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_tags")
        .select("id, name, slug, color")
        .order("name");
      if (error) throw error;
      return data as BlogTag[];
    },
  });

  const { data: postTags } = useQuery({
    queryKey: ["blog-post-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_post_tags")
        .select("post_id, tag_id");
      if (error) throw error;
      return data;
    },
  });

  const getTagsForPost = (postId: string) => {
    const tagIds = postTags?.filter((pt) => pt.post_id === postId).map((pt) => pt.tag_id) || [];
    return tags?.filter((tag) => tagIds.includes(tag.id)) || [];
  };

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category_id === selectedCategory;
    
    // Filter by selected tags
    let matchesTags = true;
    if (selectedTags.length > 0) {
      const postTagIds = postTags?.filter((pt) => pt.post_id === post.id).map((pt) => pt.tag_id) || [];
      matchesTags = selectedTags.every((tagId) => postTagIds.includes(tagId));
    }
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  const featuredPost = filteredPosts?.find((post) => post.is_featured);
  const regularPosts = filteredPosts?.filter((post) => !post.is_featured || post !== featuredPost);

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTags.length > 0;

  return (
    <PageTransition>
      <Header />
      <main className="min-h-screen pt-24 pb-24 md:pb-16">
        <div className="container-custom">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Blog" }]} />

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reflexões, estudos bíblicos e mensagens para edificar sua fé
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">Categorias:</span>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="gap-2"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {tags && tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                      borderColor: tag.color,
                      color: selectedTags.includes(tag.id) ? "white" : undefined,
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                    {selectedTags.includes(tag.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="text-center mb-6">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar Filtros
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredPosts?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                Nenhum artigo encontrado
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="block mb-12 group"
                >
                  <div className="relative h-[400px] rounded-2xl overflow-hidden">
                    {featuredPost.image_url ? (
                      <img
                        src={featuredPost.image_url}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge>Destaque</Badge>
                        {getTagsForPost(featuredPost.id).map((tag) => (
                          <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.color }}
                            className="text-white"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="text-white/80 mb-4 line-clamp-2">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        {featuredPost.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(featuredPost.published_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {estimateReadTime(featuredPost.content)} min de leitura
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Regular Posts Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts?.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-4xl">📖</span>
                        </div>
                      )}
                      {post.category && (
                        <Badge className="absolute top-3 left-3" variant="secondary">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                    <div className="p-5">
                      {/* Tags */}
                      {getTagsForPost(post.id).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {getTagsForPost(post.id).slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: tag.color, color: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.published_at), "dd/MM/yyyy")}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {estimateReadTime(post.content)} min
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <MobileFooter />
      <ScrollToTopButton />
    </PageTransition>
  );
};

export default Blog;
