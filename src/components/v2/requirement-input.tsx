"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, GripVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RequirementItem {
  id: string;
  value: string;
}

// ─── Placeholders ────────────────────────────────────────────────────────────

const PLACEHOLDERS = [
  "e.g. 5+ years of experience in B2B SaaS",
  "e.g. Strong analytical and problem-solving skills",
  "e.g. Experience working directly with founders/C-suite",
  "e.g. Ability to manage multiple projects simultaneously",
  "e.g. Excellent written and verbal communication",
  "e.g. Comfortable with ambiguity in a fast-paced environment",
  "e.g. Background in strategy consulting or investment banking",
  "e.g. Strong financial modeling and data analysis skills",
  "e.g. Experience with fundraising or investor relations",
  "e.g. Track record of cross-functional project delivery",
];

// ─── Suggestions (Founders Associate) ────────────────────────────────────────

const FOUNDERS_ASSOCIATE_SUGGESTIONS = [
  "2–4 years experience in consulting, VC, or high-growth startups",
  "Strong project management skills across multiple workstreams",
  "Experience with financial modeling and business analysis",
  "Excellent written communication for investor updates and memos",
  "Comfortable context-switching between strategy and execution",
  "Experience supporting C-suite or founders directly",
];

// ─── Sortable Item ───────────────────────────────────────────────────────────

interface SortableItemProps {
  item: RequirementItem;
  index: number;
  totalItems: number;
  placeholder: string;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  inputRef: (id: string, el: HTMLInputElement | null) => void;
}

function SortableItem({
  item,
  index,
  totalItems,
  placeholder,
  onChange,
  onRemove,
  onKeyDown,
  inputRef,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group relative", isDragging && "z-50")}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 py-3.5 transition-all duration-200 focus-within:border-[#00d4aa]/50 focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.1)] hover:border-border/80",
          isDragging && "shadow-lg border-[#00d4aa]/30 bg-background/95"
        )}
      >
        {totalItems > 1 && (
          <button
            className="cursor-grab active:cursor-grabbing touch-none p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <span className="text-sm font-medium text-muted-foreground/60 select-none tabular-nums w-5 text-center">
          {index + 1}
        </span>
        <input
          ref={(el) => inputRef(item.id, el)}
          type="text"
          value={item.value}
          onChange={(e) => onChange(item.id, e.target.value)}
          onKeyDown={(e) => onKeyDown(e, item.id)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
        {totalItems > 1 && (
          <button
            onClick={() => onRemove(item.id)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface RequirementInputProps {
  question: string;
  subtitle?: string;
  onItemsChange?: (items: string[]) => void;
  onNext?: () => void;
  buttonLabel?: string;
}

export function RequirementInput({
  question,
  subtitle,
  onItemsChange,
  onNext,
  buttonLabel = "Continue",
}: RequirementInputProps) {
  const [items, setItems] = useState<RequirementItem[]>([
    { id: `item-${Date.now()}`, value: "" },
  ]);
  const [suggestionsApplied, setSuggestionsApplied] = useState(false);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filledItems = items.filter((item) => item.value.trim().length > 0);
  const canContinue = filledItems.length >= 1;

  const syncItems = useCallback(
    (updated: RequirementItem[]) => {
      onItemsChange?.(
        updated
          .map((i) => i.value.trim())
          .filter((v) => v.length > 0)
      );
    },
    [onItemsChange]
  );

  const handleChange = (id: string, value: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, value } : item
      );
      syncItems(next);
      return next;
    });
  };

  const handleAdd = () => {
    const newId = `item-${Date.now()}`;
    setItems((prev) => {
      const next = [...prev, { id: newId, value: "" }];
      syncItems(next);
      return next;
    });
    setTimeout(() => {
      inputRefs.current.get(newId)?.focus();
    }, 100);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((item) => item.id !== id);
      syncItems(next);
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Backspace") {
      const item = items.find((i) => i.id === id);
      if (item && item.value === "" && items.length > 1) {
        e.preventDefault();
        const idx = items.findIndex((i) => i.id === id);
        handleRemove(id);
        const prevItem = items[idx - 1] || items[idx + 1];
        if (prevItem) {
          setTimeout(() => {
            inputRefs.current.get(prevItem.id)?.focus();
          }, 50);
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        const next = arrayMove(prev, oldIndex, newIndex);
        syncItems(next);
        return next;
      });
    }
  };

  const handleSuggest = () => {
    const filled = items.filter((i) => i.value.trim().length > 0);
    const newItems = FOUNDERS_ASSOCIATE_SUGGESTIONS.map((s, i) => ({
      id: `sug-${Date.now()}-${i}`,
      value: s,
    }));
    const next = [...filled, ...newItems];
    setItems(next);
    syncItems(next);
    setSuggestionsApplied(true);
  };

  const setInputRef = (id: string, el: HTMLInputElement | null) => {
    if (el) inputRefs.current.set(id, el);
    else inputRefs.current.delete(id);
  };

  const getPlaceholder = (index: number) => {
    return PLACEHOLDERS[index % PLACEHOLDERS.length];
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[15vh] justify-center px-8 pb-8">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Side - Question */}
          <div className="flex flex-col justify-start space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {question}
              </h1>
            </motion.div>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Right Side - Input List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-start pt-[8vh] space-y-4"
          >
            {/* Suggest Button — only show if not yet used */}
            {!suggestionsApplied && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={handleSuggest}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 transition-colors rounded-lg hover:bg-[#00d4aa]/5"
                >
                  <Sparkles className="w-4 h-4" />
                  Give me suggestions
                </button>
              </motion.div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          delay: item.id.startsWith("sug-") ? index * 0.06 : 0,
                        }}
                      >
                        <SortableItem
                          item={item}
                          index={index}
                          totalItems={items.length}
                          placeholder={getPlaceholder(index)}
                          onChange={handleChange}
                          onRemove={handleRemove}
                          onKeyDown={handleKeyDown}
                          inputRef={setInputRef}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Another Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={handleAdd}
                className="w-full py-5 text-base rounded-xl border-2 border-[#00d4aa]/30 bg-[#00d4aa]/5 text-[#00d4aa] hover:bg-[#00d4aa]/10 hover:border-[#00d4aa]/50 transition-all duration-300 font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add another
              </Button>
            </motion.div>

            {/* Continue / Finish Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              <Button
                onClick={onNext}
                disabled={!canContinue}
                className={cn(
                  "w-full lg:w-auto px-8 py-6 text-base font-medium transition-all duration-300",
                  canContinue
                    ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {buttonLabel}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
