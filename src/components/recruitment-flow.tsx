"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecruitmentQuestion } from "@/components/recruitment-question";
import { IntroScreen } from "@/components/v2/intro-screen";
import { YoeScreen } from "@/components/yoe-screen";

interface Tag {
  id: string;
  label: string;
}

interface StepConfig {
  question: string;
  tags: Tag[];
  minSelection: number;
}

const STEPS: StepConfig[] = [
  {
    question: "What experience or skills should your ideal candidate have?",
    minSelection: 3,
    tags: [
      { id: "s1", label: "B2B SaaS" },
      { id: "s2", label: "Startup Experience" },
      { id: "s3", label: "Team Leadership" },
      { id: "s4", label: "Product-Led Growth" },
      { id: "s5", label: "Series A/B" },
      { id: "s6", label: "Marketplace" },
      { id: "s7", label: "Enterprise Sales" },
      { id: "s8", label: "Growth Marketing" },
      { id: "s9", label: "Fundraising" },
      { id: "s10", label: "Technical Background" },
      { id: "s11", label: "Remote Management" },
      { id: "s12", label: "International Expansion" },
    ],
  },
  {
    question: "What tools should they be proficient in?",
    minSelection: 2,
    tags: [
      { id: "t1", label: "Figma" },
      { id: "t2", label: "HubSpot" },
      { id: "t3", label: "Notion" },
      { id: "t4", label: "Salesforce" },
      { id: "t5", label: "Python" },
      { id: "t6", label: "SQL" },
      { id: "t7", label: "Slack" },
      { id: "t8", label: "Linear" },
      { id: "t9", label: "Google Analytics" },
      { id: "t10", label: "Mixpanel" },
      { id: "t11", label: "Amplitude" },
      { id: "t12", label: "Jira" },
    ],
  },
  {
    question: "What languages should they speak?",
    minSelection: 1,
    tags: [
      { id: "l1", label: "English" },
      { id: "l2", label: "French" },
      { id: "l3", label: "Arabic" },
      { id: "l4", label: "Mandarin" },
      { id: "l5", label: "Spanish" },
      { id: "l6", label: "German" },
      { id: "l7", label: "Portuguese" },
      { id: "l8", label: "Japanese" },
      { id: "l9", label: "Hindi" },
      { id: "l10", label: "Korean" },
    ],
  },
];

type Phase = "intro" | "yoe" | "steps";

export function RecruitmentFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Tag[][]>(STEPS.map(() => []));

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  const handleSelectionChange = useCallback(
    (selected: Tag[]) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentStep] = selected;
        return next;
      });
    },
    [currentStep]
  );

  const handleNext = useCallback(() => {
    if (isLastStep) {
      console.log("Years of experience:", yearsOfExperience);
      console.log("All answers:", answers);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, answers, yearsOfExperience, currentStep]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Progress Bar — only during steps */}
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
              onContinue={(yoe) => {
                setYearsOfExperience(yoe);
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
            <RecruitmentQuestion
              question={step.question}
              availableTags={step.tags}
              minSelection={step.minSelection}
              onSelectionChange={handleSelectionChange}
              onNext={handleNext}
              buttonLabel={isLastStep ? "Finish" : "Continue"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
