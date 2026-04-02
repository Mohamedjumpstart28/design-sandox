"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Requirement } from "./types";

interface PasteJdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (mustHaves: Requirement[], niceToHaves: Requirement[]) => void;
}

export function PasteJdModal({ isOpen, onClose, onExtracted }: PasteJdModalProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExtract = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setIsLoading(false);
        return;
      }

      const parseItems = (
        items: { text: string; quality: string; suggestion: string | null }[],
        prefix: string
      ): Requirement[] =>
        (items || []).map((r, i) => ({
          id: `${prefix}-${Date.now()}-${i}`,
          text: r.text,
          quality: r.quality === "good" ? "good" as const : r.quality === "vague" ? "vague" as const : "unchecked" as const,
          suggestion: r.suggestion,
        }));

      onExtracted(
        parseItems(data.mustHaves, "ai-must"),
        parseItems(data.niceToHaves, "ai-nice")
      );
      setText("");
      onClose();
    } catch {
      alert("Failed to connect. Make sure ANTHROPIC_API_KEY is set in .env.local.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-xl bg-background border-2 border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                Paste a job description
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste a JD, LinkedIn post, or free-form notes. We&apos;ll extract
                requirements and sort them into must-haves and nice-to-haves.
              </p>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) handleExtract();
                  }}
                  placeholder="Paste your job description or requirements here..."
                  rows={8}
                  disabled={isLoading}
                  className="w-full resize-none bg-transparent border-2 border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-[#00d4aa]/50 transition-colors disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleExtract}
                disabled={!text.trim() || isLoading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-xl transition-all",
                  text.trim() && !isLoading
                    ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    Extract requirements
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
