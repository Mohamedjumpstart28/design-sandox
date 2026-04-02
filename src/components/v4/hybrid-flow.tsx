"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IntroScreen } from "@/components/v2/intro-screen";
import { YoeScreen } from "@/components/yoe-screen";
import { IndustryScreen } from "@/components/industry-screen";
import { GoHomeButton } from "@/components/go-home-button";
import { MainScreen } from "./main-screen";
import { ReviewScreen } from "./review-screen";
import type { Requirement } from "./types";

type Phase = "intro" | "yoe" | "industry" | "must" | "nice" | "review";

export function HybridFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [yearsOfExperience, setYearsOfExperience] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [industries, setIndustries] = useState<string[]>([]);
  const [mustHaves, setMustHaves] = useState<Requirement[]>([]);
  const [niceToHaves, setNiceToHaves] = useState<Requirement[]>([]);

  const handleFinish = useCallback(() => {
    console.log("Years of experience:", yearsOfExperience);
    console.log("Industries:", industries);
    console.log("Must haves:", mustHaves.map((r) => r.text));
    console.log("Nice to haves:", niceToHaves.map((r) => r.text));
  }, [yearsOfExperience, industries, mustHaves, niceToHaves]);

  return (
    <div className="relative min-h-screen w-full bg-background">
      <GoHomeButton />
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <IntroScreen onGetStarted={() => setPhase("yoe")} />
          </motion.div>
        )}

        {phase === "yoe" && (
          <motion.div
            key="yoe"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <YoeScreen
              onContinue={(data) => {
                setYearsOfExperience({ min: data.min, max: data.max });
                setPhase("industry");
              }}
            />
          </motion.div>
        )}

        {phase === "industry" && (
          <motion.div
            key="industry"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <IndustryScreen
              onContinue={(selected) => {
                setIndustries(selected);
                setPhase("must");
              }}
            />
          </motion.div>
        )}

        {phase === "must" && (
          <motion.div
            key="must"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <MainScreen
              zone="must"
              mustHaves={mustHaves}
              niceToHaves={niceToHaves}
              onMustHavesChange={setMustHaves}
              onNiceToHavesChange={setNiceToHaves}
              onContinue={() => setPhase("nice")}
              onBack={() => setPhase("yoe")}
            />
          </motion.div>
        )}

        {phase === "nice" && (
          <motion.div
            key="nice"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <MainScreen
              zone="nice"
              mustHaves={mustHaves}
              niceToHaves={niceToHaves}
              onMustHavesChange={setMustHaves}
              onNiceToHavesChange={setNiceToHaves}
              onContinue={() => setPhase("review")}
              onBack={() => setPhase("must")}
            />
          </motion.div>
        )}

        {phase === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ReviewScreen
              mustHaves={mustHaves}
              niceToHaves={niceToHaves}
              onMustHavesChange={setMustHaves}
              onNiceToHavesChange={setNiceToHaves}
              onFinish={handleFinish}
              onBack={() => setPhase("nice")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
