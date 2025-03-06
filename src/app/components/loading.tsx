"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-t-primary"></div>
    </div>
  );
}
