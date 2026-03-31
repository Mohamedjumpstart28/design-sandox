"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const YOE_OPTIONS = ["0–1", "1–3", "3–5", "5–8", "8–12", "12+"];

interface YoeScreenProps {
  onContinue: (yoe: string) => void;
}

export function YoeScreen({ onContinue }: YoeScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[15vh] justify-center px-8 pb-8">
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            How many years of experience should they have?
          </h1>
          <p className="text-lg text-muted-foreground">
            This helps us calibrate the seniority level.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap gap-3 mt-10"
        >
          {YOE_OPTIONS.map((yoe) => (
            <button
              key={yoe}
              onClick={() => setSelected(yoe)}
              className={cn(
                "px-6 py-3.5 text-base font-medium rounded-full border-2 transition-all duration-200",
                selected === yoe
                  ? "bg-[#00d4aa] border-[#00d4aa] text-black"
                  : "border-border bg-background hover:border-[#00d4aa]/50 hover:bg-[#00d4aa]/5 text-foreground"
              )}
            >
              {yoe} years
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Button
            onClick={() => selected && onContinue(selected)}
            disabled={!selected}
            className={cn(
              "px-8 py-6 text-base font-medium transition-all duration-300",
              selected
                ? "bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
