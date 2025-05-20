"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60">
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute w-20 h-20 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
        <div className="text-white text-sm font-medium">Loading...</div>
      </div>
      <p className="mt-4 text-white text-lg font-semibold">Please wait</p>
    </div>
  );
}
