"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface TagItem {
  id: string;
  label: string;
}

interface V1OrganizeScreenProps {
  allTags: TagItem[];
  onFinish: (mustHaves: TagItem[], niceToHaves: TagItem[]) => void;
  onBack: () => void;
}

// ─── Sortable Tag Pill ──────────────────────────────────────────────────────

function SortableTag({
  tag,
  variant,
}: {
  tag: TagItem;
  variant: "must" | "nice";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-colors",
        variant === "must"
          ? "border-[#00d4aa]/30 bg-[#00d4aa]/5"
          : "border-border/60 bg-muted/20"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <span className="text-sm text-foreground">{tag.label}</span>
    </div>
  );
}

// ─── Quick Assign Item (unassigned pool) ────────────────────────────────────

function QuickAssignItem({
  tag,
  onAssignMust,
  onAssignNice,
}: {
  tag: TagItem;
  onAssignMust: () => void;
  onAssignNice: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 py-2.5">
      <span className="text-sm text-foreground flex-1">{tag.label}</span>
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

// ─── Droppable Bucket ───────────────────────────────────────────────────────

function DropBucket({
  id,
  label,
  sublabel,
  items,
  variant,
  accentColor,
}: {
  id: string;
  label: string;
  sublabel: string;
  items: TagItem[];
  variant: "must" | "nice";
  accentColor: string;
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

      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <SortableTag tag={tag} variant={variant} />
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

// ─── Overlay Card ───────────────────────────────────────────────────────────

function OverlayCard({ tag }: { tag: TagItem }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-[#00d4aa]/50 bg-background px-3 py-2.5 shadow-lg">
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
      <span className="text-sm text-foreground">{tag.label}</span>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export function V1OrganizeScreen({ allTags, onFinish, onBack }: V1OrganizeScreenProps) {
  const [unassigned, setUnassigned] = useState<TagItem[]>(allTags);
  const [mustHaves, setMustHaves] = useState<TagItem[]>([]);
  const [niceToHaves, setNiceToHaves] = useState<TagItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allItems = [...unassigned, ...mustHaves, ...niceToHaves];
  const activeTag = activeId ? allItems.find((t) => t.id === activeId) : null;
  const canFinish = unassigned.length === 0 && mustHaves.length >= 1;

  const findContainer = (id: string): "pool" | "must" | "nice" | null => {
    if (unassigned.some((t) => t.id === id)) return "pool";
    if (mustHaves.some((t) => t.id === id)) return "must";
    if (niceToHaves.some((t) => t.id === id)) return "nice";
    return null;
  };

  const assignToMust = (tag: TagItem) => {
    setUnassigned((prev) => prev.filter((t) => t.id !== tag.id));
    setNiceToHaves((prev) => prev.filter((t) => t.id !== tag.id));
    setMustHaves((prev) => [...prev, tag]);
  };

  const assignToNice = (tag: TagItem) => {
    setUnassigned((prev) => prev.filter((t) => t.id !== tag.id));
    setMustHaves((prev) => prev.filter((t) => t.id !== tag.id));
    setNiceToHaves((prev) => [...prev, tag]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

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

    const item = allItems.find((t) => t.id === active.id);
    if (!item) return;

    // Remove from source
    if (activeContainer === "pool") setUnassigned((prev) => prev.filter((t) => t.id !== item.id));
    else if (activeContainer === "must") setMustHaves((prev) => prev.filter((t) => t.id !== item.id));
    else if (activeContainer === "nice") setNiceToHaves((prev) => prev.filter((t) => t.id !== item.id));

    // Add to target
    if (overContainer === "must") setMustHaves((prev) => [...prev.filter((t) => t.id !== item.id), item]);
    else if (overContainer === "nice") setNiceToHaves((prev) => [...prev.filter((t) => t.id !== item.id), item]);
    else if (overContainer === "pool") setUnassigned((prev) => [...prev.filter((t) => t.id !== item.id), item]);
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
            Now sort them: what&apos;s essential vs. what&apos;s a bonus?
          </h2>
          <p className="text-muted-foreground">
            Drag each item into the right bucket, or use the quick-assign buttons.
            {unassigned.length > 0 && (
              <span className="text-[#00d4aa] font-medium"> {unassigned.length} left to assign.</span>
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
          {unassigned.length > 0 && (
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
                  {unassigned.map((tag) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <QuickAssignItem
                        tag={tag}
                        onAssignMust={() => assignToMust(tag)}
                        onAssignNice={() => assignToNice(tag)}
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
            />
            <DropBucket
              id="nice-bucket"
              label="Nice to haves"
              sublabel="Bonus points — great to have but not a dealbreaker"
              items={niceToHaves}
              variant="nice"
              accentColor="bg-muted-foreground/40"
            />
          </motion.div>

          <DragOverlay>
            {activeTag ? <OverlayCard tag={activeTag} /> : null}
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
            &larr; Back
          </button>

          <Button
            onClick={() => onFinish(mustHaves, niceToHaves)}
            disabled={!canFinish}
            className={cn(
              "flex-1 lg:flex-none px-8 py-6 text-base font-medium transition-all duration-300",
              canFinish
                ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {unassigned.length > 0
              ? `Assign all ${unassigned.length} remaining first`
              : mustHaves.length === 0
                ? "Add at least 1 must-have"
                : "Finish"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
