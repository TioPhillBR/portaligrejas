import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogComments from "@/components/blog/BlogComments";
import BlogLikeButton from "@/components/blog/BlogLikeButton";

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: tags } = useQuery({
    queryKey: ["blog-tags-all"],
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
    queryKey: ["blog-post-tags", post?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_post_tags")
        .select("tag_id")
        .eq("post_id", post!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!post?.id,
  });

  const getPostTags = () => {
    const tagIds = postTags?.map((pt) => pt.tag_id) || [];
    return tags?.filter((tag) => tagIds.includes(tag.id)) || [];
  };

  const { data: relatedPosts } = useQuery({
    queryKey: ["related-posts", post?.category, post?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, image_url, published_at")
        .eq("is_published", true)
        .eq("category", post!.category!)
        .neq("id", post!.id)
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!post?.category && !!post?.id,
  });

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container-custom max-w-4xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O artigo que você procura não existe ou foi removido.
            </p>
            <Link to="/blog">
              <Button>Ver todos os artigos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <article className="container-custom max-w-4xl">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Blog
          </Link>

          {/* Hero Image */}
          {post.image_url && (
            <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.category && (
                <Badge variant="outline">{post.category}</Badge>
              )}
              {post.is_featured && (
                <Badge>Destaque</Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {estimateReadTime(post.content)} min de leitura
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <BlogLikeButton postId={post.id} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
            {/* Tags */}
            {getPostTags().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {getPostTags().map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <Separator className="mb-8" />

          {/* Post Content - Render HTML from WYSIWYG */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Separator className="mb-8" />

          {/* Comments Section */}
          <BlogComments postId={post.id} />

          <Separator className="my-8" />

          {/* Share Section */}
          <div className="bg-card rounded-xl p-6 border text-center mb-12">
            <h3 className="font-semibold mb-2">Gostou deste artigo?</h3>
            <p className="text-muted-foreground mb-4">
              Curta e compartilhe com seus amigos!
            </p>
            <div className="flex items-center justify-center gap-3">
              <BlogLikeButton postId={post.id} />
              <Button onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border"
                  >
                    <div className="relative h-32 overflow-hidden">
                      {relatedPost.image_url ? (
                        <img
                          src={relatedPost.image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-2xl">📖</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.published_at && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {format(new Date(relatedPost.published_at), "dd/MM/yyyy")}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
