"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const INDUSTRY_TAGS = [
  "Startup",
  "Consulting",
  "Scaleup",
  "Banking / Finance",
  "Fintech",
  "Healthtech / Medtech",
  "Climate / Sustainability",
  "B2B SaaS",
  "E-commerce / Marketplace",
  "Big Tech",
  "AI / ML",
  "EdTech",
];

interface IndustryScreenProps {
  onContinue: (industries: string[]) => void;
}

export function IndustryScreen({ onContinue }: IndustryScreenProps) {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState("");

  const selectIndustry = (industry: string) => {
    setSelectedIndustries((prev) => [...prev, industry]);
  };

  const removeIndustry = (industry: string) => {
    setSelectedIndustries((prev) => prev.filter((i) => i !== industry));
  };

  const addCustomIndustry = () => {
    const trimmed = customIndustry.trim();
    if (!trimmed) return;
    if (selectedIndustries.some((i) => i.toLowerCase() === trimmed.toLowerCase())) return;
    setSelectedIndustries((prev) => [...prev, trimmed]);
    setCustomIndustry("");
  };

  const unselectedTags = INDUSTRY_TAGS.filter(
    (t) => !selectedIndustries.some((s) => s.toLowerCase() === t.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[15vh] justify-center px-8 pb-8">
      <div className="w-full max-w-xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Any specific industry background?
          </h1>
          <p className="text-lg text-muted-foreground">
            Optional &mdash; select or type the backgrounds you care about.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {selectedIndustries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIndustries.map((industry) => (
                <div
                  key={industry}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full bg-[#00d4aa] border-2 border-[#00d4aa] text-black"
                >
                  {industry}
                  <button
                    onClick={() => removeIndustry(industry)}
                    className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {unselectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {unselectedTags.map((industry) => (
                <button
                  key={industry}
                  onClick={() => selectIndustry(industry)}
                  className="px-3.5 py-2 text-sm font-medium rounded-full border-2 border-border bg-background hover:border-[#00d4aa]/50 hover:bg-[#00d4aa]/5 text-foreground transition-all duration-200"
                >
                  {industry}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 py-3.5 transition-all duration-200 focus-within:border-[#00d4aa]/50 focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.1)] hover:border-border/80">
            <input
              type="text"
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustomIndustry();
              }}
              placeholder="Type a custom background..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
            />
            <button
              onClick={addCustomIndustry}
              disabled={!customIndustry.trim()}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                customIndustry.trim()
                  ? "text-[#00d4aa] hover:bg-[#00d4aa]/10"
                  : "text-muted-foreground/30"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Continue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-4"
        >
          <Button
            onClick={() => onContinue(selectedIndustries)}
            className={cn(
              "px-8 py-6 text-base font-medium transition-all duration-300",
              "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
            )}
          >
            {selectedIndustries.length === 0 ? "Skip" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
