"use client";

import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BAD_EXAMPLES = [
  "Good communicator",
  "Experienced leader",
  "Knows marketing",
];

const GOOD_EXAMPLES = [
  "Led a 10-person sales team at a Series B startup",
  "Built demand gen engine from 0 to $2M pipeline",
  "Fluent in English and French for EU expansion",
];

interface IntroScreenProps {
  onGetStarted: () => void;
}

export function IntroScreen({ onGetStarted }: IntroScreenProps) {
  return (
    <div className="min-h-screen w-full bg-background flex items-start pt-[15vh] justify-center px-8 pb-8">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Describe your ideal candidate
          </h1>
          <p className="text-lg text-muted-foreground">
            The more specific you are, the better we can match you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10"
        >
          {/* Bad Examples */}
          <div className="rounded-2xl border-2 border-border bg-background p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                Too vague
              </span>
            </div>
            <div className="space-y-2.5">
              {BAD_EXAMPLES.map((example) => (
                <p
                  key={example}
                  className="text-sm text-muted-foreground/70 leading-relaxed"
                >
                  &ldquo;{example}&rdquo;
                </p>
              ))}
            </div>
          </div>

          {/* Good Examples */}
          <div className="rounded-2xl border-2 border-[#00d4aa]/20 bg-[#00d4aa]/5 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00d4aa]/15 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-[#00d4aa]" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Be specific
              </span>
            </div>
            <div className="space-y-2.5">
              {GOOD_EXAMPLES.map((example) => (
                <p
                  key={example}
                  className="text-sm text-foreground/80 leading-relaxed"
                >
                  &ldquo;{example}&rdquo;
                </p>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Button
            onClick={onGetStarted}
            className="px-8 py-6 text-base font-medium bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-black transition-all duration-300"
          >
            Get started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
