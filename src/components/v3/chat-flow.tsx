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
  const [mustHaves, setMustHaves] = useState<Requirement[]>([]);
  const [niceToHaves, setNiceToHaves] = useState<Requirement[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const allReqs = [...mustHaves, ...niceToHaves];
  const vagueCount = allReqs.filter((r) => r.quality === "vague").length;
  const canContinue = allReqs.length > 0 && vagueCount === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const parseReqs = (
    items: { text: string; quality: string; suggestion: string | null }[],
    prefix: string
  ): Requirement[] =>
    (items || []).map((r, i) => ({
      id: `${prefix}-${Date.now()}-${i}`,
      text: r.text,
      quality: r.quality === "good" ? "good" : "vague",
      suggestion: r.suggestion,
    }));

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
      setMustHaves(parseReqs(data.mustHaves, "must"));
      setNiceToHaves(parseReqs(data.niceToHaves, "nice"));
      setFlowState("review");
    } catch {
      setFlowState("landing");
      alert("Failed to connect. Make sure ANTHROPIC_API_KEY is set in .env.local.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ─── Shared editing helpers ────────────────────────────────────────────

  const updateList = (
    setter: React.Dispatch<React.SetStateAction<Requirement[]>>,
    id: string,
    updater: (r: Requirement) => Requirement
  ) => setter((prev) => prev.map((r) => (r.id === id ? updater(r) : r)));

  const startEditing = (id: string, list: Requirement[], setter: React.Dispatch<React.SetStateAction<Requirement[]>>) => {
    const req = list.find((r) => r.id === id);
    if (req) {
      setEditValues((prev) => ({ ...prev, [id]: req.text }));
      updateList(setter, id, (r) => ({ ...r, isEditing: true }));
    }
  };

  const saveEdit = (id: string, setter: React.Dispatch<React.SetStateAction<Requirement[]>>) => {
    const newText = editValues[id]?.trim();
    if (!newText) return;
    updateList(setter, id, (r) => ({
      ...r,
      text: newText,
      isEditing: false,
      quality: "good",
      suggestion: null,
    }));
  };

  const cancelEdit = (id: string, setter: React.Dispatch<React.SetStateAction<Requirement[]>>) => {
    updateList(setter, id, (r) => ({ ...r, isEditing: false }));
  };

  const removeReq = (id: string, setter: React.Dispatch<React.SetStateAction<Requirement[]>>) => {
    setter((prev) => prev.filter((r) => r.id !== id));
  };

  const applySuggestion = (id: string, list: Requirement[], setter: React.Dispatch<React.SetStateAction<Requirement[]>>) => {
    const req = list.find((r) => r.id === id);
    if (req?.suggestion) {
      setEditValues((prev) => ({ ...prev, [id]: req.suggestion! }));
      updateList(setter, id, (r) => ({ ...r, isEditing: true }));
    }
  };

  const addReq = (setter: React.Dispatch<React.SetStateAction<Requirement[]>>) => {
    const newId = `req-${Date.now()}`;
    setter((prev) => [
      ...prev,
      { id: newId, text: "", quality: "good", suggestion: null, isEditing: true },
    ]);
    setEditValues((prev) => ({ ...prev, [newId]: "" }));
  };

  const handleContinue = () => {
    console.log("Must haves:", mustHaves.map((r) => r.text));
    console.log("Nice to haves:", niceToHaves.map((r) => r.text));
  };

  // ─── Render a requirement card ─────────────────────────────────────────

  function ReqCard({
    req,
    list,
    setter,
    index,
  }: {
    req: Requirement;
    list: Requirement[];
    setter: React.Dispatch<React.SetStateAction<Requirement[]>>;
    index: number;
  }) {
    return (
      <motion.div
        key={req.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.04 }}
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
            <div className="space-y-3">
              <input
                type="text"
                value={editValues[req.id] ?? ""}
                onChange={(e) =>
                  setEditValues((prev) => ({ ...prev, [req.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(req.id, setter);
                  if (e.key === "Escape") cancelEdit(req.id, setter);
                }}
                autoFocus
                className="w-full bg-transparent text-base text-foreground outline-none border-b-2 border-[#00d4aa]/50 pb-1"
                placeholder="Type a specific requirement..."
              />
              <div className="flex gap-2">
                <button onClick={() => saveEdit(req.id, setter)} className="text-xs font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors">Save</button>
                <button onClick={() => cancelEdit(req.id, setter)} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-3">
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
                <p className="flex-1 text-base text-foreground leading-relaxed">{req.text}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEditing(req.id, list, setter)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeReq(req.id, setter)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {req.quality === "vague" && req.suggestion && (
                <div className="ml-9 flex items-start gap-2">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Try: &ldquo;{req.suggestion}&rdquo;
                  </p>
                  <button onClick={() => applySuggestion(req.id, list, setter)} className="text-xs font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors whitespace-nowrap mt-0.5">
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

  // ─── Layout ────────────────────────────────────────────────────────────

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
                We&apos;ll sort them into must-haves and nice-to-haves.
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
            <div className="w-full max-w-2xl space-y-8">
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

              {/* Must Haves */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Must haves
                </h3>
                <AnimatePresence mode="popLayout">
                  {mustHaves.map((req, i) => (
                    <ReqCard key={req.id} req={req} list={mustHaves} setter={setMustHaves} index={i} />
                  ))}
                </AnimatePresence>
                <button
                  onClick={() => addReq(setMustHaves)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors pl-1"
                >
                  <Plus className="w-4 h-4" />
                  Add must-have
                </button>
              </div>

              {/* Nice to Haves */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Nice to haves
                </h3>
                <AnimatePresence mode="popLayout">
                  {niceToHaves.map((req, i) => (
                    <ReqCard key={req.id} req={req} list={niceToHaves} setter={setNiceToHaves} index={i} />
                  ))}
                </AnimatePresence>
                <button
                  onClick={() => addReq(setNiceToHaves)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors pl-1"
                >
                  <Plus className="w-4 h-4" />
                  Add nice-to-have
                </button>
              </div>

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

              <button
                onClick={() => {
                  setFlowState("landing");
                  setMustHaves([]);
                  setNiceToHaves([]);
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
