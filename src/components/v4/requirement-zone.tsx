"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Requirement, TagSuggestion } from "./types";
import { TagSuggestions } from "./tag-suggestions";
import { RequirementCard } from "./requirement-card";

interface RequirementZoneProps {
  label: string;
  tags: TagSuggestion[];
  items: Requirement[];
  onAdd: (text: string) => void;
  onEdit: (id: string, newText: string) => void;
  onRemove: (id: string) => void;
  muted?: boolean;
}

export function RequirementZone({
  label,
  tags,
  items,
  onAdd,
  onEdit,
  onRemove,
  muted = false,
}: RequirementZoneProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    onAdd(text);
    setInputValue("");
  };

  return (
    <div className={cn("space-y-4 rounded-2xl border-2 p-4", muted ? "border-border/60 bg-muted/20" : "border-border bg-background")}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full", muted ? "bg-muted-foreground/40" : "bg-[#00d4aa]")} />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {label}
        </h3>
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {items.length} added
          </span>
        )}
      </div>

      {/* Tag Suggestions */}
      <TagSuggestions
        tags={tags}
        addedTexts={items.map((i) => i.text)}
        onTagClick={(label) => onAdd(label)}
        onTagRemove={(label) => {
          const normalizedLabel = label.toLowerCase().trim();
          const match = items.find((i) => i.text.toLowerCase().trim() === normalizedLabel);
          if (match) onRemove(match.id);
        }}
        contextHint="Suggested based on your role"
      />

      {/* Added Items — visually separated */}
      {items.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Your requirements
          </p>
          <AnimatePresence mode="popLayout">
            {items.map((req, i) => (
              <RequirementCard
                key={req.id}
                req={req}
                index={i}
                showQuality={false}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Free-text input */}
      <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 py-3.5 transition-all duration-200 focus-within:border-[#00d4aa]/50 focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.1)] hover:border-border/80">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Type your own requirement..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            inputValue.trim()
              ? "text-[#00d4aa] hover:bg-[#00d4aa]/10"
              : "text-muted-foreground/30"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
