"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Requirement } from "./types";
import { MUST_HAVE_TAGS, NICE_TO_HAVE_TAGS } from "./types";
import { RequirementZone } from "./requirement-zone";

interface MainScreenProps {
  zone: "must" | "nice";
  mustHaves: Requirement[];
  niceToHaves: Requirement[];
  onMustHavesChange: (items: Requirement[]) => void;
  onNiceToHavesChange: (items: Requirement[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

const ZONE_CONFIG = {
  must: {
    heading: "What are your non-negotiables?",
    subtitle: "These are the hard requirements — if a candidate doesn't have these, it's a no.",
    label: "Must haves",
    tags: MUST_HAVE_TAGS,
    step: 1,
  },
  nice: {
    heading: "What would make someone stand out?",
    subtitle: "Bonus points, not deal-breakers. Great to have but you'd still consider without them.",
    label: "Nice to haves",
    tags: NICE_TO_HAVE_TAGS,
    step: 2,
  },
};

export function MainScreen({
  zone,
  mustHaves,
  niceToHaves,
  onMustHavesChange,
  onNiceToHavesChange,
  onContinue,
  onBack,
}: MainScreenProps) {
  const config = ZONE_CONFIG[zone];
  const items = zone === "must" ? mustHaves : niceToHaves;
  const setter = zone === "must" ? onMustHavesChange : onNiceToHavesChange;

  const canContinue = items.length >= 1;

  const addItem = (text: string) => {
    if (items.some((r) => r.text.toLowerCase().trim() === text.toLowerCase().trim())) return;
    setter([
      ...items,
      { id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, quality: "unchecked", suggestion: null },
    ]);
  };

  const editItem = (id: string, newText: string) => {
    setter(items.map((r) => (r.id === id ? { ...r, text: newText, quality: "unchecked" as const, suggestion: null } : r)));
  };

  const removeItem = (id: string) => {
    setter(items.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[15vh] justify-center px-8 pb-8">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Side — Question */}
          <div className="flex flex-col justify-start space-y-4">
            {/* Step indicator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                    zone === "must"
                      ? "bg-[#00d4aa] text-black"
                      : "bg-[#00d4aa] text-black"
                  )}
                >
                  1
                </div>
                <span className={cn("text-xs font-medium", zone === "must" ? "text-foreground" : "text-muted-foreground/50")}>
                  Must haves
                </span>
              </div>
              <div className="w-6 h-px bg-border" />
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                    zone === "nice"
                      ? "bg-[#00d4aa] text-black"
                      : "border-2 border-border text-muted-foreground/50"
                  )}
                >
                  2
                </div>
                <span className={cn("text-xs font-medium", zone === "nice" ? "text-foreground" : "text-muted-foreground/50")}>
                  Nice to haves
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {config.heading}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              {config.subtitle}
            </motion.p>
          </div>

          {/* Right Side — Single Zone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-start pt-[8vh] space-y-5"
          >
            <RequirementZone
              label={config.label}
              tags={config.tags}
              items={items}
              onAdd={addItem}
              onEdit={editItem}
              onRemove={removeItem}
              muted={zone === "nice"}
            />

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
                ← Back
              </button>

              <Button
                onClick={onContinue}
                disabled={!canContinue}
                className={cn(
                  "flex-1 lg:flex-none px-8 py-6 text-base font-medium transition-all duration-300",
                  canContinue
                    ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {!canContinue
                  ? "Add at least 1 to continue"
                  : zone === "must"
                  ? "Continue to nice to haves →"
                  : "Continue to review →"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
