"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Requirement } from "./types";
import { ALL_TAGS } from "./types";

interface CaptureScreenProps {
  items: Requirement[];
  onItemsChange: (items: Requirement[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function CaptureScreen({
  items,
  onItemsChange,
  onContinue,
  onBack,
}: CaptureScreenProps) {
  const [inputValue, setInputValue] = useState("");

  const addedNormalized = items.map((i) => i.text.toLowerCase().trim());

  const addItem = (text: string) => {
    if (addedNormalized.includes(text.toLowerCase().trim())) return;
    onItemsChange([
      ...items,
      {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text,
        quality: "unchecked",
        suggestion: null,
      },
    ]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((r) => r.id !== id));
  };

  const removeByText = (text: string) => {
    const normalized = text.toLowerCase().trim();
    const match = items.find((i) => i.text.toLowerCase().trim() === normalized);
    if (match) removeItem(match.id);
  };

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    addItem(text);
    setInputValue("");
  };

  // Tags not yet added
  const availableTags = ALL_TAGS.filter(
    (t) => !addedNormalized.includes(t.label.toLowerCase().trim())
  );

  const canContinue = items.length >= 3;

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[12vh] justify-center px-8 pb-8">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left — Question */}
          <div className="flex flex-col justify-start space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                What does your ideal candidate look like?
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Add everything that matters — skills, experience, traits.
            </motion.p>
          </div>

          {/* Right — Input area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-start pt-[4vh] space-y-5"
          >
            {/* Tag suggestions */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground/60">Quick add from suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => addItem(tag.label)}
                      className="px-3.5 py-2 text-sm font-medium rounded-full border-2 border-border bg-background hover:border-[#00d4aa]/50 hover:bg-[#00d4aa]/5 text-foreground transition-all duration-200"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Added requirements */}
            {items.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Your requirements · {items.length} added
                </p>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {items.map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                        className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full bg-[#00d4aa] border-2 border-[#00d4aa] text-black"
                      >
                        {req.text}
                        <button
                          onClick={() => removeItem(req.id)}
                          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Text input */}
            <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 py-3.5 transition-all duration-200 focus-within:border-[#00d4aa]/50 focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.1)] hover:border-border/80">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
                placeholder="Type your own requirement and press Enter..."
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
                  ? `Add at least ${3 - items.length} more to continue`
                  : "Now let's organize these →"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
