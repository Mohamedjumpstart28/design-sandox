"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, X, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Requirement } from "./types";

interface RequirementCardProps {
  req: Requirement;
  index: number;
  showQuality?: boolean;
  onEdit: (id: string, newText: string) => void;
  onRemove: (id: string) => void;
  onApplySuggestion?: (id: string) => void;
}

export function RequirementCard({
  req,
  index,
  showQuality = false,
  onEdit,
  onRemove,
  onApplySuggestion,
}: RequirementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(req.text);

  const save = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      onEdit(req.id, trimmed);
      setIsEditing(false);
    }
  };

  const startEdit = (prefill?: string) => {
    setEditValue(prefill ?? req.text);
    setIsEditing(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.04 }}
    >
      <div
        className={cn(
          "rounded-xl border-2 p-3.5 transition-all duration-200",
          showQuality && req.quality === "vague"
            ? "border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/10"
            : showQuality && req.quality === "unchecked"
              ? "border-border bg-muted/30"
              : "border-border bg-background"
        )}
      >
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setIsEditing(false);
              }}
              autoFocus
              className="w-full bg-transparent text-sm text-foreground outline-none border-b-2 border-[#00d4aa]/50 pb-1"
              placeholder="Type a specific requirement..."
            />
            <div className="flex gap-2">
              <button onClick={save} className="text-xs font-medium bg-[#00d4aa] text-black px-2.5 py-1 rounded-md hover:bg-[#00d4aa]/90 transition-colors">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-start gap-2.5">
              {showQuality && (
                <div className="mt-0.5 shrink-0">
                  {req.quality === "good" ? (
                    <div className="w-5 h-5 rounded-full bg-[#00d4aa]/15 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#00d4aa]" />
                    </div>
                  ) : req.quality === "vague" ? (
                    <div className="w-5 h-5 rounded-full bg-amber-400/15 flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
                    </div>
                  )}
                </div>
              )}
              <p className="flex-1 text-sm text-foreground leading-relaxed">{req.text}</p>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => startEdit()}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onRemove(req.id)}
                  className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            {showQuality && req.quality === "vague" && req.suggestion && (
              <div className={cn("flex items-start gap-2", showQuality ? "ml-7" : "ml-0")}>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Try: &ldquo;{req.suggestion}&rdquo;
                </p>
                <button
                  onClick={() => {
                    onApplySuggestion?.(req.id);
                    startEdit(req.suggestion!);
                  }}
                  className="text-xs font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
