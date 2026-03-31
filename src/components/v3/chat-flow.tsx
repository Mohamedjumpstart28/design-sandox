"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Loader2,
  Check,
  AlertTriangle,
  X,
  Pencil,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Requirement {
  id: string;
  text: string;
  quality: "good" | "vague";
  suggestion: string | null;
  isEditing?: boolean;
}

type FlowState = "landing" | "loading" | "review";

export function ChatFlow() {
  const [input, setInput] = useState("");
  const [flowState, setFlowState] = useState<FlowState>("landing");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    setFlowState("loading");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (data.error) {
        setFlowState("landing");
        alert(data.error);
        return;
      }

      const reqs: Requirement[] = (data.requirements || []).map(
        (r: { text: string; quality: string; suggestion: string | null }, i: number) => ({
          id: `req-${Date.now()}-${i}`,
          text: r.text,
          quality: r.quality === "good" ? "good" : "vague",
          suggestion: r.suggestion,
        })
      );

      setRequirements(reqs);
      setFlowState("review");
    } catch {
      setFlowState("landing");
      alert(
        "Failed to connect. Make sure ANTHROPIC_API_KEY is set in .env.local."
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startEditing = (id: string) => {
    const req = requirements.find((r) => r.id === id);
    if (req) {
      setEditValues((prev) => ({ ...prev, [id]: req.text }));
      setRequirements((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isEditing: true } : r))
      );
    }
  };

  const saveEdit = (id: string) => {
    const newText = editValues[id]?.trim();
    if (!newText) return;
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, text: newText, isEditing: false, quality: "good", suggestion: null }
          : r
      )
    );
  };

  const cancelEdit = (id: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEditing: false } : r))
    );
  };

  const removeRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const applySuggestion = (id: string) => {
    const req = requirements.find((r) => r.id === id);
    if (req?.suggestion) {
      startEditing(id);
      setEditValues((prev) => ({ ...prev, [id]: req.suggestion! }));
    }
  };

  const addRequirement = () => {
    const newId = `req-${Date.now()}`;
    setRequirements((prev) => [
      ...prev,
      { id: newId, text: "", quality: "good", suggestion: null, isEditing: true },
    ]);
    setEditValues((prev) => ({ ...prev, [newId]: "" }));
  };

  const vagueCount = requirements.filter((r) => r.quality === "vague").length;
  const canContinue = requirements.length > 0 && vagueCount === 0;

  const handleContinue = () => {
    console.log(
      "Final requirements:",
      requirements.map((r) => r.text)
    );
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <AnimatePresence mode="wait">
        {/* ─── Landing ─── */}
        {flowState === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-6 pb-32"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-3 mb-10"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Describe your ideal candidate
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Write a paragraph about what you&apos;re looking for.
                We&apos;ll extract and review each requirement.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl"
            >
              <div className="relative rounded-2xl border-2 border-border bg-background shadow-sm focus-within:border-[#00d4aa]/50 focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.1)] transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. I need someone with strong B2B SaaS experience, ideally who's led a growth team at a Series A/B startup. They should be great with data, comfortable with ambiguity, and have experience with paid acquisition and content strategy..."
                  rows={4}
                  className="w-full resize-none bg-transparent px-5 pt-4 pb-14 text-base text-foreground placeholder:text-muted-foreground/40 outline-none rounded-2xl"
                />
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      input.trim()
                        ? "bg-[#00d4aa] text-black hover:bg-[#00d4aa]/90"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Loading ─── */}
        {flowState === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#00d4aa]" />
              <p className="text-muted-foreground text-lg">
                Extracting requirements...
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Review ─── */}
        {flowState === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex items-start pt-[10vh] justify-center px-6 pb-8"
          >
            <div className="w-full max-w-2xl space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Review your requirements
                </h2>
                <p className="text-muted-foreground">
                  {vagueCount > 0 ? (
                    <>
                      <span className="text-amber-500 font-medium">
                        {vagueCount} requirement{vagueCount > 1 ? "s" : ""}{" "}
                        need{vagueCount === 1 ? "s" : ""} more detail
                      </span>{" "}
                      — edit or apply the suggestions before continuing.
                    </>
                  ) : (
                    "All requirements look specific. Edit anything you'd like, then continue."
                  )}
                </p>
              </div>

              {/* Requirement Cards */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {requirements.map((req, index) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: index * 0.05,
                      }}
                    >
                      <div
                        className={cn(
                          "rounded-xl border-2 p-4 transition-all duration-200",
                          req.quality === "vague"
                            ? "border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/10"
                            : "border-border bg-background"
                        )}
                      >
                        {req.isEditing ? (
                          /* ─── Edit Mode ─── */
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editValues[req.id] ?? ""}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(req.id);
                                if (e.key === "Escape") cancelEdit(req.id);
                              }}
                              autoFocus
                              className="w-full bg-transparent text-base text-foreground outline-none border-b-2 border-[#00d4aa]/50 pb-1"
                              placeholder="Type a specific requirement..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(req.id)}
                                className="text-xs font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => cancelEdit(req.id)}
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ─── Display Mode ─── */
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              {/* Quality Indicator */}
                              <div className="mt-0.5 shrink-0">
                                {req.quality === "good" ? (
                                  <div className="w-6 h-6 rounded-full bg-[#00d4aa]/15 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-[#00d4aa]" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-amber-400/15 flex items-center justify-center">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                  </div>
                                )}
                              </div>

                              {/* Text */}
                              <p className="flex-1 text-base text-foreground leading-relaxed">
                                {req.text}
                              </p>

                              {/* Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => startEditing(req.id)}
                                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => removeRequirement(req.id)}
                                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Suggestion for vague items */}
                            {req.quality === "vague" && req.suggestion && (
                              <div className="ml-9 flex items-start gap-2">
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                  Try: &ldquo;{req.suggestion}&rdquo;
                                </p>
                                <button
                                  onClick={() => applySuggestion(req.id)}
                                  className="text-xs font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors whitespace-nowrap mt-0.5"
                                >
                                  Apply
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add More */}
              <Button
                variant="outline"
                onClick={addRequirement}
                className="w-full py-5 text-base rounded-xl border-2 border-[#00d4aa]/30 bg-[#00d4aa]/5 text-[#00d4aa] hover:bg-[#00d4aa]/10 hover:border-[#00d4aa]/50 transition-all duration-300 font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add another
              </Button>

              {/* Continue */}
              <div className="pt-2">
                <Button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className={cn(
                    "px-8 py-6 text-base font-medium transition-all duration-300",
                    canContinue
                      ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {vagueCount > 0
                    ? `Fix ${vagueCount} vague requirement${vagueCount > 1 ? "s" : ""} to continue`
                    : "Continue"}
                </Button>
              </div>

              {/* Start Over */}
              <button
                onClick={() => {
                  setFlowState("landing");
                  setRequirements([]);
                  setInput("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                &larr; Start over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
