"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, GripVertical, Check, AlertTriangle, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Requirement } from "./types";
import { RequirementCard } from "./requirement-card";
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
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ReviewScreenProps {
  mustHaves: Requirement[];
  niceToHaves: Requirement[];
  onMustHavesChange: (items: Requirement[]) => void;
  onNiceToHavesChange: (items: Requirement[]) => void;
  onFinish: () => void;
  onBack: () => void;
}

// ─── Sortable Review Card ────────────────────────────────────────────────────

function SortableReviewCard({
  req,
  index,
  onEdit,
  onRemove,
}: {
  req: Requirement;
  index: number;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: req.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-start gap-1">
        <button
          className="mt-3 cursor-grab active:cursor-grabbing touch-none p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <RequirementCard
            req={req}
            index={index}
            showQuality
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Droppable Container ─────────────────────────────────────────────────────

function DroppableSection({
  id,
  label,
  children,
  isEmpty,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "space-y-3 rounded-xl p-4 transition-all duration-200 min-h-[80px]",
        isOver
          ? "border-2 border-dashed border-[#00d4aa]/40 bg-[#00d4aa]/5"
          : "border-2 border-transparent"
      )}
    >
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        {label}
      </h3>
      {children}
      {isEmpty && (
        <p className="text-sm text-muted-foreground/40 py-2">
          Drag requirements here
        </p>
      )}
    </div>
  );
}

// ─── Drag Overlay Card ───────────────────────────────────────────────────────

function DragOverlayCard({ req }: { req: Requirement }) {
  return (
    <div className="rounded-xl border-2 border-[#00d4aa]/50 bg-background p-3.5 shadow-lg">
      <div className="flex items-start gap-2.5">
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
        <p className="flex-1 text-sm text-foreground leading-relaxed">{req.text}</p>
      </div>
    </div>
  );
}

// ─── Main Review Screen ──────────────────────────────────────────────────────

export function ReviewScreen({
  mustHaves,
  niceToHaves,
  onMustHavesChange,
  onNiceToHavesChange,
  onFinish,
  onBack,
}: ReviewScreenProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allReqs = [...mustHaves, ...niceToHaves];
  const uncheckedCount = allReqs.filter((r) => r.quality === "unchecked").length;
  const vagueCount = allReqs.filter((r) => r.quality === "vague").length;
  const canContinue = allReqs.length > 0 && vagueCount === 0 && uncheckedCount === 0;

  const activeReq = activeId ? allReqs.find((r) => r.id === activeId) : null;

  // Find which container an item belongs to
  const findContainer = (id: string): "must" | "nice" | null => {
    if (mustHaves.some((r) => r.id === id)) return "must";
    if (niceToHaves.some((r) => r.id === id)) return "nice";
    return null;
  };

  // Batch quality check on mount for unchecked items
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
      if (data.error) {
        console.error(data.error);
        setIsChecking(false);
        return;
      }

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
            return {
              ...req,
              quality: match.quality === "good" ? "good" as const : "vague" as const,
              suggestion: match.suggestion,
            };
          }
          for (const [key, val] of resultMap.entries()) {
            if (req.text.toLowerCase().includes(key.slice(0, 20)) || key.includes(req.text.toLowerCase().slice(0, 20))) {
              return {
                ...req,
                quality: val.quality === "good" ? "good" as const : "vague" as const,
                suggestion: val.suggestion,
              };
            }
          }
          return { ...req, quality: "good" as const };
        });

      onMustHavesChange(updateList(mustHaves));
      onNiceToHavesChange(updateList(niceToHaves));
    } catch {
      const markGood = (items: Requirement[]) =>
        items.map((r) => (r.quality === "unchecked" ? { ...r, quality: "good" as const } : r));
      onMustHavesChange(markGood(mustHaves));
      onNiceToHavesChange(markGood(niceToHaves));
    } finally {
      setIsChecking(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    runBatchCheck();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const editItem = (
    list: Requirement[],
    setter: (items: Requirement[]) => void,
    id: string,
    newText: string
  ) => {
    setter(list.map((r) => (r.id === id ? { ...r, text: newText, quality: "good" as const, suggestion: null } : r)));
  };

  const removeItem = (
    list: Requirement[],
    setter: (items: Requirement[]) => void,
    id: string
  ) => {
    setter(list.filter((r) => r.id !== id));
  };

  // ─── Drag Handlers ──────────────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    // Determine target container: either from the item's container or the droppable area id
    let overContainer = findContainer(over.id as string);
    if (!overContainer) {
      // over.id might be the droppable container id
      if (over.id === "must-container") overContainer = "must";
      else if (over.id === "nice-container") overContainer = "nice";
    }

    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return; // Same container, no move needed

    // Move item from one list to the other
    const item = allReqs.find((r) => r.id === active.id);
    if (!item) return;

    if (activeContainer === "must" && overContainer === "nice") {
      onMustHavesChange(mustHaves.filter((r) => r.id !== item.id));
      onNiceToHavesChange([...niceToHaves, item]);
    } else if (activeContainer === "nice" && overContainer === "must") {
      onNiceToHavesChange(niceToHaves.filter((r) => r.id !== item.id));
      onMustHavesChange([...mustHaves, item]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[10vh] justify-center px-8 pb-8">
      <div className="w-full max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold text-foreground">
            Review your requirements
          </h2>
          <p className="text-muted-foreground">
            {isChecking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking quality...
              </span>
            ) : vagueCount > 0 ? (
              <>
                <span className="text-amber-500 font-medium">
                  {vagueCount} requirement{vagueCount > 1 ? "s" : ""}{" "}
                  need{vagueCount === 1 ? "s" : ""} more detail
                </span>{" "}
                — edit or apply the suggestions before continuing.
              </>
            ) : (
              "All requirements look specific. Drag to rearrange between sections, then finish."
            )}
          </p>
        </motion.div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Must Haves */}
          <DroppableSection id="must-container" label="Must haves" isEmpty={mustHaves.length === 0}>
            <SortableContext
              items={mustHaves.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence mode="popLayout">
                {mustHaves.map((req, i) => (
                  <SortableReviewCard
                    key={req.id}
                    req={req}
                    index={i}
                    onEdit={(id, text) => editItem(mustHaves, onMustHavesChange, id, text)}
                    onRemove={(id) => removeItem(mustHaves, onMustHavesChange, id)}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DroppableSection>

          {/* Nice to Haves */}
          <DroppableSection id="nice-container" label="Nice to haves" isEmpty={niceToHaves.length === 0}>
            <SortableContext
              items={niceToHaves.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence mode="popLayout">
                {niceToHaves.map((req, i) => (
                  <SortableReviewCard
                    key={req.id}
                    req={req}
                    index={i}
                    onEdit={(id, text) => editItem(niceToHaves, onNiceToHavesChange, id, text)}
                    onRemove={(id) => removeItem(niceToHaves, onNiceToHavesChange, id)}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DroppableSection>

          <DragOverlay>
            {activeReq ? <DragOverlayCard req={activeReq} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-4">
          <Button
            onClick={onFinish}
            disabled={!canContinue || isChecking}
            className={cn(
              "px-8 py-6 text-base font-medium transition-all duration-300",
              canContinue && !isChecking
                ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isChecking
              ? "Checking..."
              : vagueCount > 0
                ? `Fix ${vagueCount} vague requirement${vagueCount > 1 ? "s" : ""} to continue`
                : "Finish"}
          </Button>
        </div>

        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to editing
        </button>
      </div>
    </div>
  );
}
