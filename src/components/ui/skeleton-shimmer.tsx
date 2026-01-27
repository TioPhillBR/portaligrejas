import { cn } from "@/lib/utils";

interface SkeletonShimmerProps {
  className?: string;
}

const SkeletonShimmer = ({ className }: SkeletonShimmerProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
    />
  );
};

// Card skeleton with shimmer
const CardSkeleton = ({ className }: SkeletonShimmerProps) => {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      <SkeletonShimmer className="h-16 w-16 rounded-full mx-auto" />
      <SkeletonShimmer className="h-6 w-24 mx-auto" />
      <SkeletonShimmer className="h-4 w-48 mx-auto" />
      <SkeletonShimmer className="h-40 w-40 mx-auto rounded-lg" />
      <SkeletonShimmer className="h-20 w-full rounded-lg" />
      <SkeletonShimmer className="h-10 w-full rounded-md" />
    </div>
  );
};

// Text line skeleton
const TextSkeleton = ({ className, lines = 1 }: SkeletonShimmerProps & { lines?: number }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonShimmer
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
};

// Image skeleton
const ImageSkeleton = ({ className }: SkeletonShimmerProps) => {
  return (
    <SkeletonShimmer className={cn("aspect-video w-full rounded-lg", className)} />
  );
};

// Avatar skeleton
const AvatarSkeleton = ({ className }: SkeletonShimmerProps) => {
  return (
    <SkeletonShimmer className={cn("h-10 w-10 rounded-full", className)} />
  );
};

// Button skeleton
const ButtonSkeleton = ({ className }: SkeletonShimmerProps) => {
  return (
    <SkeletonShimmer className={cn("h-10 w-24 rounded-md", className)} />
  );
};

// Blog post card skeleton
const BlogCardSkeleton = ({ className }: SkeletonShimmerProps) => {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <SkeletonShimmer className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <SkeletonShimmer className="h-5 w-16 rounded-full" />
          <SkeletonShimmer className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonShimmer className="h-6 w-full" />
        <SkeletonShimmer className="h-4 w-3/4" />
        <TextSkeleton lines={2} />
        <div className="flex items-center gap-2 pt-2">
          <AvatarSkeleton className="h-8 w-8" />
          <SkeletonShimmer className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};

// Event card skeleton
const EventCardSkeleton = ({ className }: SkeletonShimmerProps) => {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <SkeletonShimmer className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonShimmer className="h-5 w-20 rounded-full" />
        <SkeletonShimmer className="h-6 w-full" />
        <div className="flex items-center gap-2">
          <SkeletonShimmer className="h-4 w-4 rounded" />
          <SkeletonShimmer className="h-4 w-32" />
        </div>
        <SkeletonShimmer className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
};

// Ministry card skeleton
const MinistryCardSkeleton = ({ className }: SkeletonShimmerProps) => {
  return (
    <div className={cn("rounded-xl border bg-card p-6 text-center", className)}>
      <SkeletonShimmer className="h-16 w-16 rounded-full mx-auto mb-4" />
      <SkeletonShimmer className="h-6 w-32 mx-auto mb-2" />
      <TextSkeleton lines={2} className="mb-4" />
      <SkeletonShimmer className="h-10 w-full rounded-md" />
    </div>
  );
};

// Gallery skeleton
const GallerySkeleton = ({ className, count = 6 }: SkeletonShimmerProps & { count?: number }) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonShimmer
          key={i}
          className={cn(
            "rounded-lg",
            i % 3 === 0 ? "aspect-square" : "aspect-video"
          )}
        />
      ))}
    </div>
  );
};

// Table row skeleton
const TableRowSkeleton = ({ className, cols = 4 }: SkeletonShimmerProps & { cols?: number }) => {
  return (
    <div className={cn("flex items-center gap-4 p-4 border-b", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonShimmer
          key={i}
          className={cn(
            "h-4",
            i === 0 ? "w-12" : i === cols - 1 ? "w-20" : "flex-1"
          )}
        />
      ))}
    </div>
  );
};

export {
  SkeletonShimmer,
  CardSkeleton,
  TextSkeleton,
  ImageSkeleton,
  AvatarSkeleton,
  ButtonSkeleton,
  BlogCardSkeleton,
  EventCardSkeleton,
  MinistryCardSkeleton,
  GallerySkeleton,
  TableRowSkeleton,
};
