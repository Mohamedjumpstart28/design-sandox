"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IntroScreen } from "@/components/v2/intro-screen";
import { YoeScreen } from "@/components/yoe-screen";
import { IndustryScreen } from "@/components/industry-screen";
import { GoHomeButton } from "@/components/go-home-button";
import { CaptureScreen } from "./capture-screen";
import { StructureScreen } from "./structure-screen";
import type { Requirement } from "./types";

type Phase = "intro" | "yoe" | "industry" | "capture" | "structure";

export function CaptureStructureFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [yearsOfExperience, setYearsOfExperience] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [industries, setIndustries] = useState<string[]>([]);

  // Capture phase: flat list of all requirements
  const [capturedItems, setCapturedItems] = useState<Requirement[]>([]);

  // Structure phase: items split into buckets
  const [unassigned, setUnassigned] = useState<Requirement[]>([]);
  const [mustHaves, setMustHaves] = useState<Requirement[]>([]);
  const [niceToHaves, setNiceToHaves] = useState<Requirement[]>([]);

  const handleCaptureToStructure = () => {
    // Move all captured items into the unassigned pool
    setUnassigned(capturedItems);
    setMustHaves([]);
    setNiceToHaves([]);
    setPhase("structure");
  };

  const handleStructureBack = () => {
    // Merge everything back into captured items
    setCapturedItems([...unassigned, ...mustHaves, ...niceToHaves]);
    setPhase("capture");
  };

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
                setPhase("capture");
              }}
            />
          </motion.div>
        )}

        {phase === "capture" && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <CaptureScreen
              items={capturedItems}
              onItemsChange={setCapturedItems}
              onContinue={handleCaptureToStructure}
              onBack={() => setPhase("industry")}
            />
          </motion.div>
        )}

        {phase === "structure" && (
          <motion.div
            key="structure"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <StructureScreen
              allItems={unassigned}
              mustHaves={mustHaves}
              niceToHaves={niceToHaves}
              onAllItemsChange={setUnassigned}
              onMustHavesChange={setMustHaves}
              onNiceToHavesChange={setNiceToHaves}
              onFinish={handleFinish}
              onBack={handleStructureBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
