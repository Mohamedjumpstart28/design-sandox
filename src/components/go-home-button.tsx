"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export function GoHomeButton() {
  return (
    <Link
      href="/"
      className="fixed top-6 right-6 z-50 p-2.5 rounded-xl border-2 border-border bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-200"
      title="Back to home"
    >
      <Home className="w-4 h-4" />
    </Link>
  );
}
