"use client";

import { cn } from "@/lib/utils";
import type { TagSuggestion, TagCategory } from "./types";

const CATEGORY_STYLES: Record<TagCategory, { label: string; bg: string; text: string }> = {
  experience: { label: "Experience", bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400" },
  tool: { label: "Tool", bg: "bg-purple-500/15", text: "text-purple-600 dark:text-purple-400" },
  skill: { label: "Skill", bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400" },
};

interface TagSuggestionsProps {
  tags: TagSuggestion[];
  addedTexts: string[];
  onTagClick: (label: string) => void;
  onTagRemove: (label: string) => void;
  contextHint?: string;
}

export function TagSuggestions({
  tags,
  addedTexts,
  onTagClick,
  onTagRemove,
  contextHint,
}: TagSuggestionsProps) {
  const normalizeText = (t: string) => t.toLowerCase().trim();
  const addedNormalized = addedTexts.map(normalizeText);

  return (
    <div className="space-y-1.5">
      {contextHint && (
        <p className="text-xs text-muted-foreground/60">{contextHint}</p>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag) => {
          const isAdded = addedNormalized.includes(normalizeText(tag.label));
          const cat = CATEGORY_STYLES[tag.category];
          return (
            <button
              key={tag.id}
              onClick={() => isAdded ? onTagRemove(tag.label) : onTagClick(tag.label)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200",
                isAdded
                  ? "bg-[#00d4aa] border-[#00d4aa] text-black cursor-pointer hover:bg-[#00d4aa]/80 hover:border-[#00d4aa]/80"
                  : "border-border bg-background hover:border-[#00d4aa]/50 hover:bg-[#00d4aa]/5 text-foreground cursor-pointer"
              )}
            >
              <span className={cn("text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md", isAdded ? "bg-black/15 text-black" : cat.bg + " " + cat.text)}>
                {cat.label}
              </span>
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
