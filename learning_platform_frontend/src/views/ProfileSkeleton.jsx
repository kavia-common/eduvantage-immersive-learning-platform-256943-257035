import React from "react";

/**
 * PUBLIC_INTERFACE
 * Lightweight skeleton placeholder for the Profile page first paint.
 * Renders quickly and avoids heavy gradients/components.
 */
export default function ProfileSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="glass p-6 rounded-2xl animate-pulse">
        <div className="h-7 w-48 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="h-16 bg-gray-200 rounded-xl" />
            <div className="h-16 bg-gray-200 rounded-xl" />
            <div className="h-16 bg-gray-200 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-pulse">
          <div className="h-9 w-64 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
