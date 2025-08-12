"use client";
import { Lock } from "lucide-react";

export function Unauthorized({
  title = "Access Denied",
  message = "You don't have permission to view this content. Kindly ask admin for permission",
}: {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  customImage?: string;
}) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-10 bg-background">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-6 w-6 text-destructive" />
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      <p className="text-muted-foreground mb-6 max-w-md text-lg">{message}</p>
    </div>
  );
}
