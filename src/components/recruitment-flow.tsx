"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecruitmentQuestion } from "@/components/recruitment-question";
import { IntroScreen } from "@/components/v2/intro-screen";
import { YoeScreen } from "@/components/yoe-screen";
import { IndustryScreen } from "@/components/industry-screen";
import { GoHomeButton } from "@/components/go-home-button";
import { V1OrganizeScreen } from "@/components/v1-organize-screen";

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
    question: "What experience should your ideal candidate have?",
    minSelection: 3,
    tags: [
      { id: "s1", label: "Project Management" },
      { id: "s2", label: "TikTok Marketing" },
      { id: "s3", label: "Outbound Sales" },
      { id: "s4", label: "Lead Generation" },
      { id: "s5", label: "Social Media Management" },
      { id: "s6", label: "Performance Marketing" },
      { id: "s7", label: "Content Writing" },
      { id: "s8", label: "Financial Modelling" },
      { id: "s9", label: "Customer Success" },
      { id: "s10", label: "Account Management" },
      { id: "s11", label: "Growth Marketing" },
      { id: "s12", label: "Operations" },
    ],
  },
  {
    question: "What tools should they be proficient in?",
    minSelection: 2,
    tags: [
      { id: "t1", label: "AI Tools" },
      { id: "t2", label: "Excel" },
      { id: "t3", label: "CRM" },
      { id: "t4", label: "Google Sheets" },
      { id: "t5", label: "HubSpot" },
      { id: "t6", label: "Social Media Platforms" },
      { id: "t7", label: "Slack" },
      { id: "t8", label: "Python" },
      { id: "t9", label: "SQL" },
      { id: "t10", label: "Power BI / Tableau" },
      { id: "t11", label: "Figma" },
      { id: "t12", label: "Notion" },
    ],
  },
];

type Phase = "intro" | "yoe" | "industry" | "steps" | "organize";

export function RecruitmentFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [yearsOfExperience, setYearsOfExperience] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [industries, setIndustries] = useState<string[]>([]);
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
      setPhase("organize");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, currentStep]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="relative min-h-screen w-full bg-background">
      <GoHomeButton />
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
            <RecruitmentQuestion
              question={step.question}
              availableTags={step.tags}
              minSelection={step.minSelection}
              onSelectionChange={handleSelectionChange}
              onNext={handleNext}
              buttonLabel={isLastStep ? "Review & Organize" : "Continue"}
            />
          </motion.div>
        )}

        {phase === "organize" && (
          <motion.div
            key="organize"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <V1OrganizeScreen
              allTags={answers.flat()}
              onFinish={(mustHaves, niceToHaves) => {
                console.log("Years of experience:", yearsOfExperience);
                console.log("Industries:", industries);
                console.log("Must haves:", mustHaves.map((t) => t.label));
                console.log("Nice to haves:", niceToHaves.map((t) => t.label));
              }}
              onBack={() => setPhase("steps")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
