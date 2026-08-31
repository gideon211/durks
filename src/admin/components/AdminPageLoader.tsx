"use client";

import { ShimmerBar } from "@/components/ui/shimmer-bar";

export default function AdminPageLoader() {
  return (
    <div className="space-y-6">
      <div>
        <ShimmerBar className="h-7 w-48" />
        <ShimmerBar className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted/10 rounded-xl p-4 md:p-6">
            <ShimmerBar className="h-3 w-3/4 mb-3" />
            <ShimmerBar className="h-8 w-1/2 mb-3" />
            <ShimmerBar className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      <div className="bg-muted/10 rounded-xl p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <ShimmerBar className="h-4 w-full sm:w-20" />
            <ShimmerBar className="h-4 w-full sm:w-32" />
            <ShimmerBar className="h-4 w-full sm:w-28" />
            <ShimmerBar className="h-4 w-full sm:w-16" />
            <ShimmerBar className="h-6 w-full sm:w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
