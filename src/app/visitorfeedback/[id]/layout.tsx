// app/visitorfeedback/[id]/layout.tsx
import type { ReactNode } from "react";

type FeedbackLayoutProps = {
  children: ReactNode;
};

export default function FeedbackLayout({ children }: FeedbackLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted text-foreground">
      <main className="w-full max-w-3xl p-4">
        {children}
      </main>
    </div>
  );
}
