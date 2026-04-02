"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronUp, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface YoeScreenProps {
  onContinue: (data: { min: number; max: number }) => void;
}

export function YoeScreen({ onContinue }: YoeScreenProps) {
  const [minYoe, setMinYoe] = useState<number>(0);
  const [maxYoe, setMaxYoe] = useState<number>(10);
  const [useSlider, setUseSlider] = useState(false);

  const hasValidRange = maxYoe >= minYoe && maxYoe > 0;

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const incrementMin = () => setMinYoe((v) => clamp(v + 1, 0, 15));
  const decrementMin = () => setMinYoe((v) => clamp(v - 1, 0, 15));
  const incrementMax = () => setMaxYoe((v) => clamp(v + 1, 0, 15));
  const decrementMax = () => setMaxYoe((v) => clamp(v - 1, 0, 15));

  const sliderMin = 0;
  const sliderMax = 15;
  const minPercent = ((minYoe - sliderMin) / (sliderMax - sliderMin)) * 100;
  const maxPercent = ((maxYoe - sliderMin) / (sliderMax - sliderMin)) * 100;

  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[15vh] justify-center px-8 pb-8">
      <div className="w-full max-w-xl space-y-10">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              How many years of experience?
            </h1>
            <p className="text-lg text-muted-foreground">
              Set the range that fits the seniority level you&apos;re looking for.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {!useSlider ? (
                <motion.div
                  key="number-inputs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-end gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      From
                    </label>
                    <div className="flex items-center gap-0 rounded-xl border-2 border-border bg-background transition-all duration-200 focus-within:border-[#00d4aa]/50 focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.1)]">
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={minYoe}
                        onChange={(e) => setMinYoe(clamp(parseInt(e.target.value) || 0, 0, 15))}
                        className="flex-1 bg-transparent text-2xl font-semibold text-foreground placeholder:text-muted-foreground/30 outline-none px-4 py-3.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="flex flex-col border-l border-border">
                        <button
                          onClick={incrementMin}
                          className="px-2.5 py-1 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors border-b border-border"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={decrementMin}
                          className="px-2.5 py-1 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pb-4 text-xl text-muted-foreground/50 font-light">&mdash;</div>

                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      To
                    </label>
                    <div className="flex items-center gap-0 rounded-xl border-2 border-border bg-background transition-all duration-200 focus-within:border-[#00d4aa]/50 focus-within:shadow-[0_0_0_3px_rgba(0,212,170,0.1)]">
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={maxYoe}
                        onChange={(e) => setMaxYoe(clamp(parseInt(e.target.value) || 0, 0, 15))}
                        className="flex-1 bg-transparent text-2xl font-semibold text-foreground placeholder:text-muted-foreground/30 outline-none px-4 py-3.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="flex flex-col border-l border-border">
                        <button
                          onClick={incrementMax}
                          className="px-2.5 py-1 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors border-b border-border"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={decrementMax}
                          className="px-2.5 py-1 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pb-3.5 text-sm text-muted-foreground">years</div>
                </motion.div>
              ) : (
                <motion.div
                  key="slider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-bold text-foreground">{minYoe}</span>
                    <span className="text-xl text-muted-foreground/50">&mdash;</span>
                    <span className="text-3xl font-bold text-foreground">{maxYoe}</span>
                    <span className="text-base text-muted-foreground ml-1">years</span>
                  </div>

                  <div className="relative h-10 px-2">
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-2 rounded-full bg-border/50" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-[#00d4aa]"
                      style={{
                        left: `calc(${minPercent}% + 8px - ${minPercent * 0.16}px)`,
                        right: `calc(${100 - maxPercent}% + 8px - ${(100 - maxPercent) * 0.16}px)`,
                      }}
                    />
                    <input
                      type="range"
                      min={sliderMin}
                      max={sliderMax}
                      value={minYoe}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val <= maxYoe) setMinYoe(val);
                      }}
                      className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00d4aa] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20"
                    />
                    <input
                      type="range"
                      min={sliderMin}
                      max={sliderMax}
                      value={maxYoe}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= minYoe) setMaxYoe(val);
                      }}
                      className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00d4aa] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
                    />
                    <div className="absolute -bottom-5 left-2 right-2 flex justify-between">
                      <span className="text-[10px] text-muted-foreground/40">0</span>
                      <span className="text-[10px] text-muted-foreground/40">3</span>
                      <span className="text-[10px] text-muted-foreground/40">5</span>
                      <span className="text-[10px] text-muted-foreground/40">8</span>
                      <span className="text-[10px] text-muted-foreground/40">10</span>
                      <span className="text-[10px] text-muted-foreground/40">12</span>
                      <span className="text-[10px] text-muted-foreground/40">15</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setUseSlider((v) => !v)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {useSlider ? "View number input design" : "View slider design"}
            </button>
          </motion.div>
        </div>

        {/* Continue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            onClick={() =>
              hasValidRange && onContinue({ min: minYoe, max: maxYoe })
            }
            disabled={!hasValidRange}
            className={cn(
              "px-8 py-6 text-base font-medium transition-all duration-300",
              hasValidRange
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
