"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Tag {
  id: string;
  label: string;
}

interface RecruitmentQuestionProps {
  question?: string;
  availableTags?: Tag[];
  minSelection?: number;
  onSelectionChange?: (selected: Tag[]) => void;
  onNext?: () => void;
  buttonLabel?: string;
}

export function RecruitmentQuestion({
  question = "What experience/skills are you looking for in a perfect candidate?",
  availableTags = [
    { id: "1", label: "React" },
    { id: "2", label: "TypeScript" },
    { id: "3", label: "Node.js" },
    { id: "4", label: "Python" },
    { id: "5", label: "Machine Learning" },
    { id: "6", label: "AWS" },
    { id: "7", label: "Docker" },
    { id: "8", label: "GraphQL" },
    { id: "9", label: "PostgreSQL" },
    { id: "10", label: "UI/UX Design" },
    { id: "11", label: "Team Leadership" },
    { id: "12", label: "Agile/Scrum" },
  ],
  minSelection = 3,
  onSelectionChange,
  onNext,
  buttonLabel = "Continue",
}: RecruitmentQuestionProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTagValue, setCustomTagValue] = useState("");

  useEffect(() => {
    onSelectionChange?.(selectedTags);
  }, [selectedTags, onSelectionChange]);

  const handleTagClick = (tag: Tag) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.id === tag.id);
      const newSelection = isSelected
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag];

      return newSelection;
    });
  };

  const handleAddCustomTag = () => {
    if (customTagValue.trim()) {
      const newTag: Tag = {
        id: `custom-${Date.now()}`,
        label: customTagValue.trim(),
      };
      setSelectedTags((prev) => {
        const newSelection = [...prev, newTag];
        return newSelection;
      });
      setCustomTagValue("");
      setShowCustomInput(false);
    }
  };

  const isMinimumMet = selectedTags.length >= minSelection;

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[15vh] justify-center px-8 pb-8">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Side - Question */}
          <div className="flex flex-col justify-start space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {question}
              </h1>
            </motion.div>
          </div>

          {/* Right Side - Tags */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-start pt-[8vh] space-y-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-muted-foreground text-lg">
                Select at least {minSelection} skills or add your own
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-3">
              {availableTags.map((tag, index) => {
                const isSelected = selectedTags.some((t) => t.id === tag.id);
                return (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        "px-6 py-6 text-base rounded-full transition-all duration-300 border-2",
                        isSelected
                          ? "bg-[#00d4aa] border-[#00d4aa] text-black hover:bg-[#00d4aa]/90 hover:border-[#00d4aa]/90"
                          : "bg-background border-border hover:border-[#00d4aa]/50 hover:bg-[#00d4aa]/5"
                      )}
                    >
                      {tag.label}
                    </Button>
                  </motion.div>
                );
              })}

              {/* Add Custom Tag Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: availableTags.length * 0.05 }}
              >
                {!showCustomInput ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomInput(true)}
                    className="px-6 py-6 text-base rounded-full border-2 border-[#00d4aa]/30 bg-[#00d4aa]/10 text-[#00d4aa] hover:bg-[#00d4aa]/20 hover:border-[#00d4aa]/50 transition-all duration-300 font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add your own
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={customTagValue}
                      onChange={(e) => setCustomTagValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomTag();
                        } else if (e.key === "Escape") {
                          setShowCustomInput(false);
                          setCustomTagValue("");
                        }
                      }}
                      placeholder="Enter skill..."
                      className="px-4 py-6 text-base rounded-full border-2 border-[#00d4aa]/50 focus-visible:ring-[#00d4aa]"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      onClick={handleAddCustomTag}
                      className="rounded-full bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black h-12 w-12"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomTagValue("");
                      }}
                      className="rounded-full h-12 w-12"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Selected Tags Display */}
            <AnimatePresence mode="popLayout">
              {selectedTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">
                      {selectedTags.length} selected
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      >
                        <Badge
                          variant="secondary"
                          className="group px-3 py-1.5 text-sm bg-[#00d4aa]/10 text-foreground border border-[#00d4aa]/20 hover:bg-[#00d4aa]/20 cursor-pointer"
                          onClick={() => handleTagClick(tag)}
                        >
                          {tag.label}
                          <X className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={onNext}
                disabled={!isMinimumMet}
                className={cn(
                  "w-full lg:w-auto px-8 py-6 text-base font-medium transition-all duration-300",
                  isMinimumMet
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
