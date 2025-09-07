import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PostSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SpaceSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-[60px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
          <Skeleton className="h-9 w-[80px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function UserSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[180px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-[40px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
          </div>
          <Skeleton className="h-9 w-[70px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-3 w-[60px]" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-[120px]" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-[100px]" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <SpaceSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}