"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TagItem {
  id: string;
  label: string;
}

interface V1OrganizeScreenProps {
  allTags: TagItem[];
  onFinish: (mustHaves: TagItem[], niceToHaves: TagItem[]) => void;
  onBack: () => void;
}

export function V1OrganizeScreen({ allTags, onFinish, onBack }: V1OrganizeScreenProps) {
  // Track which tag ids are must-haves — everything else is nice-to-have
  const [mustIds, setMustIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setMustIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const mustHaves = allTags.filter((t) => mustIds.has(t.id));
  const niceToHaves = allTags.filter((t) => !mustIds.has(t.id));

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[12vh] justify-center px-8 pb-8">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold text-foreground">
            Which of these are non-negotiable?
          </h2>
          <p className="text-muted-foreground">
            Tap to mark as a must-have. Everything else will be treated as nice-to-have.
          </p>
        </motion.div>

        {/* All tags as toggleable pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2.5"
        >
          {allTags.map((tag, i) => {
            const isMust = mustIds.has(tag.id);
            return (
              <motion.button
                key={tag.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => toggle(tag.id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium rounded-full border-2 transition-all duration-200",
                  isMust
                    ? "bg-[#00d4aa] border-[#00d4aa] text-black"
                    : "bg-background border-border text-foreground hover:border-[#00d4aa]/40 hover:bg-[#00d4aa]/5"
                )}
              >
                {isMust && <span className="mr-1.5">&#10003;</span>}
                {tag.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Live count summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00d4aa]" />
            <span><span className="font-semibold text-foreground">{mustHaves.length}</span> must-have{mustHaves.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
            <span><span className="font-semibold text-foreground">{niceToHaves.length}</span> nice-to-have{niceToHaves.length !== 1 ? "s" : ""}</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 pt-2"
        >
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back
          </button>

          <Button
            onClick={() => onFinish(mustHaves, niceToHaves)}
            disabled={mustHaves.length === 0}
            className={cn(
              "flex-1 lg:flex-none px-8 py-6 text-base font-medium transition-all duration-300",
              mustHaves.length > 0
                ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {mustHaves.length === 0 ? "Tap at least 1 must-have" : "Finish"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
