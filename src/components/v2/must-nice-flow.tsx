"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequirementInput } from "@/components/v2/requirement-input";
import { IntroScreen } from "@/components/v2/intro-screen";
import { YoeScreen } from "@/components/yoe-screen";
import { IndustryScreen } from "@/components/industry-screen";
import { GoHomeButton } from "@/components/go-home-button";
import { ReviewScreen } from "@/components/v4/review-screen";
import type { Requirement } from "@/components/v4/types";

interface StepConfig {
  question: string;
  subtitle: string;
}

const STEPS: StepConfig[] = [
  {
    question: "What are the must-haves you're looking for in a candidate?",
    subtitle:
      "List the non-negotiable skills, experiences, or qualifications.",
  },
  {
    question: "What would be nice to have?",
    subtitle:
      "These aren't dealbreakers, but would make a candidate stand out.",
  },
];

type Phase = "intro" | "yoe" | "industry" | "steps" | "review";

export function MustNiceFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [yearsOfExperience, setYearsOfExperience] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [industries, setIndustries] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [mustHaves, setMustHaves] = useState<string[]>([]);
  const [niceToHaves, setNiceToHaves] = useState<string[]>([]);
  const [reviewMustHaves, setReviewMustHaves] = useState<Requirement[]>([]);
  const [reviewNiceToHaves, setReviewNiceToHaves] = useState<Requirement[]>([]);

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleItemsChange = useCallback(
    (items: string[]) => {
      if (currentStep === 0) {
        setMustHaves(items);
      } else {
        setNiceToHaves(items);
      }
    },
    [currentStep]
  );

  const handleNext = useCallback(() => {
    if (isLastStep) {
      const toReq = (text: string, i: number): Requirement => ({
        id: `req-${Date.now()}-${i}`,
        text,
        quality: "unchecked",
        suggestion: null,
      });
      setReviewMustHaves(mustHaves.map((t, i) => toReq(t, i)));
      setReviewNiceToHaves(niceToHaves.map((t, i) => toReq(t, mustHaves.length + i)));
      setPhase("review");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, mustHaves, niceToHaves]);

  return (
    <div className="relative min-h-screen w-full bg-background">
      <GoHomeButton />
      {/* Progress — only during steps */}
      {phase === "steps" && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 w-full bg-border/50">
            <motion.div
              className="h-full bg-[#00d4aa]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center gap-8 pt-4">
            {["Must haves", "Nice to haves"].map((label, index) => (
              <button
                key={label}
                className="flex items-center gap-2 group"
                onClick={() => {
                  if (index < currentStep) setCurrentStep(index);
                }}
                disabled={index > currentStep}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    index <= currentStep ? "bg-[#00d4aa]" : "bg-border"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    index === currentStep
                      ? "text-foreground"
                      : index < currentStep
                        ? "text-muted-foreground group-hover:text-foreground cursor-pointer"
                        : "text-muted-foreground/40"
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
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
                setPhase("steps");
              }}
            />
          </motion.div>
        )}

        {phase === "steps" && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <RequirementInput
              question={step.question}
              subtitle={step.subtitle}
              onItemsChange={handleItemsChange}
              onNext={handleNext}
              buttonLabel={isLastStep ? "Review" : "Continue"}
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
              mustHaves={reviewMustHaves}
              niceToHaves={reviewNiceToHaves}
              onMustHavesChange={setReviewMustHaves}
              onNiceToHavesChange={setReviewNiceToHaves}
              onFinish={() => {
                console.log("Years of experience:", yearsOfExperience);
                console.log("Industries:", industries);
                console.log("Must haves:", reviewMustHaves.map((r) => r.text));
                console.log("Nice to haves:", reviewNiceToHaves.map((r) => r.text));
              }}
              onBack={() => setPhase("steps")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
