"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, ArrowDown, Loader2, Check, AlertTriangle, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Requirement } from "./types";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface StructureScreenProps {
  allItems: Requirement[];
  mustHaves: Requirement[];
  niceToHaves: Requirement[];
  onAllItemsChange: (items: Requirement[]) => void;
  onMustHavesChange: (items: Requirement[]) => void;
  onNiceToHavesChange: (items: Requirement[]) => void;
  onFinish: () => void;
  onBack: () => void;
}

// ─── Quality Icon ────────────────────────────────────────────────────────────

function QualityIcon({ quality }: { quality: Requirement["quality"] }) {
  if (quality === "good") {
    return (
      <div className="w-4 h-4 rounded-full bg-[#00d4aa]/15 flex items-center justify-center shrink-0">
        <Check className="w-2.5 h-2.5 text-[#00d4aa]" />
      </div>
    );
  }
  if (quality === "vague") {
    return (
      <div className="w-4 h-4 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
      </div>
    );
  }
  return (
    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0">
      <Loader2 className="w-2.5 h-2.5 text-muted-foreground animate-spin" />
    </div>
  );
}

// ─── Quick Assign Item (unassigned pool) ─────────────────────────────────────

function QuickAssignItem({
  req,
  onAssignMust,
  onAssignNice,
}: {
  req: Requirement;
  onAssignMust: () => void;
  onAssignNice: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 py-2.5">
      <QualityIcon quality={req.quality} />
      <span className="text-sm text-foreground flex-1">{req.text}</span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onAssignMust}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#00d4aa]/10 text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-colors"
        >
          Must
        </button>
        <button
          onClick={onAssignNice}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          Nice
        </button>
      </div>
    </div>
  );
}

// ─── Bucket Item (with quality, edit, suggestion) ────────────────────────────

function BucketItem({
  req,
  variant,
  onEdit,
  onRemove,
}: {
  req: Requirement;
  variant: "must" | "nice";
  onEdit: (id: string, newText: string) => void;
  onRemove: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(req.text);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: req.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const save = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      onEdit(req.id, trimmed);
      setIsEditing(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "rounded-xl border-2 px-3 py-2.5 transition-all duration-200",
          req.quality === "vague"
            ? "border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/10"
            : variant === "must"
              ? "border-[#00d4aa]/30 bg-[#00d4aa]/5"
              : "border-border/60 bg-muted/20",
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
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                className="cursor-grab active:cursor-grabbing touch-none p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
              <QualityIcon quality={req.quality} />
              <span className="text-sm text-foreground flex-1">{req.text}</span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => { setEditValue(req.text); setIsEditing(true); }}
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
            {req.quality === "vague" && req.suggestion && (
              <div className="ml-10 flex items-start gap-2">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Try: &ldquo;{req.suggestion}&rdquo;
                </p>
                <button
                  onClick={() => { setEditValue(req.suggestion!); setIsEditing(true); }}
                  className="text-xs font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Droppable Bucket ────────────────────────────────────────────────────────

function DropBucket({
  id,
  label,
  sublabel,
  items,
  variant,
  accentColor,
  onEdit,
  onRemove,
}: {
  id: string;
  label: string;
  sublabel: string;
  items: Requirement[];
  variant: "must" | "nice";
  accentColor: string;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 rounded-2xl border-2 p-4 transition-all duration-200 min-h-[160px]",
        isOver
          ? "border-dashed border-[#00d4aa]/50 bg-[#00d4aa]/5 scale-[1.01]"
          : variant === "must"
            ? "border-[#00d4aa]/20 bg-[#00d4aa]/[0.02]"
            : "border-border/60 bg-muted/10"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("w-2 h-2 rounded-full", accentColor)} />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{label}</h3>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <p className="text-xs text-muted-foreground/50 mb-3">{sublabel}</p>

      <SortableContext items={items.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <BucketItem req={req} variant={variant} onEdit={onEdit} onRemove={onRemove} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>

      {items.length === 0 && !isOver && (
        <div className="flex items-center justify-center py-4">
          <p className="text-xs text-muted-foreground/30">Drag or click to add here</p>
        </div>
      )}
    </div>
  );
}

// ─── Overlay Card ────────────────────────────────────────────────────────────

function OverlayCard({ req }: { req: Requirement }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-[#00d4aa]/50 bg-background px-3 py-2.5 shadow-lg">
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
      <span className="text-sm text-foreground">{req.text}</span>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function StructureScreen({
  allItems,
  mustHaves,
  niceToHaves,
  onAllItemsChange,
  onMustHavesChange,
  onNiceToHavesChange,
  onFinish,
  onBack,
}: StructureScreenProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allReqs = [...allItems, ...mustHaves, ...niceToHaves];
  const activeReq = activeId ? allReqs.find((r) => r.id === activeId) : null;

  const uncheckedCount = allReqs.filter((r) => r.quality === "unchecked").length;
  const vagueCount = allReqs.filter((r) => r.quality === "vague").length;
  const allAssigned = allItems.length === 0;
  const canFinish = allAssigned && mustHaves.length >= 1 && vagueCount === 0 && uncheckedCount === 0;

  // ─── AI quality check ──────────────────────────────────────────────────────

  const runBatchCheck = useCallback(async () => {
    const uncheckedTexts = allReqs.filter((r) => r.quality === "unchecked").map((r) => r.text);
    if (uncheckedTexts.length === 0) return;

    setIsChecking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uncheckedTexts.join("\n- ") }),
      });
      const data = await res.json();
      if (data.error) { setIsChecking(false); return; }

      const aiResults = [...(data.mustHaves || []), ...(data.niceToHaves || [])];
      const resultMap = new Map<string, { quality: string; suggestion: string | null }>();
      aiResults.forEach((r: { text: string; quality: string; suggestion: string | null }) => {
        resultMap.set(r.text.toLowerCase().trim(), { quality: r.quality, suggestion: r.suggestion });
      });

      const updateList = (items: Requirement[]): Requirement[] =>
        items.map((req) => {
          if (req.quality !== "unchecked") return req;
          const match = resultMap.get(req.text.toLowerCase().trim());
          if (match) {
            return { ...req, quality: match.quality === "good" ? "good" as const : "vague" as const, suggestion: match.suggestion };
          }
          for (const [key, val] of resultMap.entries()) {
            if (req.text.toLowerCase().includes(key.slice(0, 20)) || key.includes(req.text.toLowerCase().slice(0, 20))) {
              return { ...req, quality: val.quality === "good" ? "good" as const : "vague" as const, suggestion: val.suggestion };
            }
          }
          return { ...req, quality: "good" as const };
        });

      onAllItemsChange(updateList(allItems));
      onMustHavesChange(updateList(mustHaves));
      onNiceToHavesChange(updateList(niceToHaves));
    } catch {
      const markGood = (items: Requirement[]) => items.map((r) => (r.quality === "unchecked" ? { ...r, quality: "good" as const } : r));
      onAllItemsChange(markGood(allItems));
      onMustHavesChange(markGood(mustHaves));
      onNiceToHavesChange(markGood(niceToHaves));
    } finally {
      setIsChecking(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { runBatchCheck(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Edit / Remove ─────────────────────────────────────────────────────────

  const editInList = (list: Requirement[], setter: (items: Requirement[]) => void, id: string, newText: string) => {
    setter(list.map((r) => (r.id === id ? { ...r, text: newText, quality: "good" as const, suggestion: null } : r)));
  };

  const removeFromList = (list: Requirement[], setter: (items: Requirement[]) => void, id: string) => {
    setter(list.filter((r) => r.id !== id));
  };

  // ─── Assign ────────────────────────────────────────────────────────────────

  const findContainer = (id: string): "pool" | "must" | "nice" | null => {
    if (allItems.some((r) => r.id === id)) return "pool";
    if (mustHaves.some((r) => r.id === id)) return "must";
    if (niceToHaves.some((r) => r.id === id)) return "nice";
    return null;
  };

  const assignToMust = (req: Requirement) => {
    onAllItemsChange(allItems.filter((r) => r.id !== req.id));
    onNiceToHavesChange(niceToHaves.filter((r) => r.id !== req.id));
    onMustHavesChange([...mustHaves, req]);
  };

  const assignToNice = (req: Requirement) => {
    onAllItemsChange(allItems.filter((r) => r.id !== req.id));
    onMustHavesChange(mustHaves.filter((r) => r.id !== req.id));
    onNiceToHavesChange([...niceToHaves, req]);
  };

  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string); };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    let overContainer = findContainer(over.id as string);
    if (!overContainer) {
      if (over.id === "must-bucket") overContainer = "must";
      else if (over.id === "nice-bucket") overContainer = "nice";
      else if (over.id === "pool-bucket") overContainer = "pool";
    }
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    const item = allReqs.find((r) => r.id === active.id);
    if (!item) return;

    if (activeContainer === "pool") onAllItemsChange(allItems.filter((r) => r.id !== item.id));
    else if (activeContainer === "must") onMustHavesChange(mustHaves.filter((r) => r.id !== item.id));
    else if (activeContainer === "nice") onNiceToHavesChange(niceToHaves.filter((r) => r.id !== item.id));

    if (overContainer === "must") onMustHavesChange([...mustHaves.filter((r) => r.id !== item.id), item]);
    else if (overContainer === "nice") onNiceToHavesChange([...niceToHaves.filter((r) => r.id !== item.id), item]);
    else if (overContainer === "pool") onAllItemsChange([...allItems.filter((r) => r.id !== item.id), item]);
  };

  // ─── Status line ───────────────────────────────────────────────────────────

  const statusText = () => {
    if (isChecking) return null; // shown separately
    if (!allAssigned) return null;
    if (vagueCount > 0) {
      return (
        <span className="text-amber-500 font-medium">
          {vagueCount} requirement{vagueCount > 1 ? "s" : ""} need{vagueCount === 1 ? "s" : ""} more detail
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[8vh] justify-center px-8 pb-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold text-foreground">
            Now sort them: what's essential vs. what's a bonus?
          </h2>
          <p className="text-muted-foreground">
            {isChecking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking requirement quality...
              </span>
            ) : (
              <>
                Drag each requirement into the right bucket, or use the quick-assign buttons.
                {allItems.length > 0 && (
                  <span className="text-[#00d4aa] font-medium"> {allItems.length} left to assign.</span>
                )}
                {statusText() && <> — {statusText()}</>}
              </>
            )}
          </p>
        </motion.div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Unassigned pool */}
          {allItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Unassigned
              </p>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {allItems.map((req) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <QuickAssignItem
                        req={req}
                        onAssignMust={() => assignToMust(req)}
                        onAssignNice={() => assignToNice(req)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 py-2">
                <div className="flex-1 h-px bg-border/50" />
                <ArrowDown className="w-4 h-4 text-muted-foreground/30" />
                <div className="flex-1 h-px bg-border/50" />
              </div>
            </motion.div>
          )}

          {/* Two buckets */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <DropBucket
              id="must-bucket"
              label="Must haves"
              sublabel="Non-negotiable — no candidate passes without these"
              items={mustHaves}
              variant="must"
              accentColor="bg-[#00d4aa]"
              onEdit={(id, text) => editInList(mustHaves, onMustHavesChange, id, text)}
              onRemove={(id) => removeFromList(mustHaves, onMustHavesChange, id)}
            />
            <DropBucket
              id="nice-bucket"
              label="Nice to haves"
              sublabel="Bonus points — great to have but not a dealbreaker"
              items={niceToHaves}
              variant="nice"
              accentColor="bg-muted-foreground/40"
              onEdit={(id, text) => editInList(niceToHaves, onNiceToHavesChange, id, text)}
              onRemove={(id) => removeFromList(niceToHaves, onNiceToHavesChange, id)}
            />
          </motion.div>

          <DragOverlay>
            {activeReq ? <OverlayCard req={activeReq} /> : null}
          </DragOverlay>
        </DndContext>

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
            ← Back to capture
          </button>

          <Button
            onClick={onFinish}
            disabled={!canFinish || isChecking}
            className={cn(
              "flex-1 lg:flex-none px-8 py-6 text-base font-medium transition-all duration-300",
              canFinish && !isChecking
                ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isChecking
              ? "Checking..."
              : allItems.length > 0
                ? `Assign all ${allItems.length} remaining first`
                : mustHaves.length === 0
                  ? "Add at least 1 must-have"
                  : vagueCount > 0
                    ? `Fix ${vagueCount} vague requirement${vagueCount > 1 ? "s" : ""} to finish`
                    : "Finish"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
