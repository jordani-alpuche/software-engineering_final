"use client";
import Link from "next/link";
import { CheckCircleIcon } from "lucide-react";
export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="bg-white dark:bg-background p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Thank You!</h1>
        <p className="text-muted-foreground mb-6">
          We appreciate your feedback. It helps us improve your experience.
        </p>


      </div>
    </div>
  );
}
