"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Tags, TextCursorInput, MessageCircle } from "lucide-react";

const flows = [
  {
    href: "/v1",
    title: "V1 — Tag Selection",
    description:
      "Multi-step flow where founders pick from predefined skill tags across 3 categories: experience, tools, and languages.",
    icon: Tags,
    accent: "from-[#00d4aa]/20 to-[#00d4aa]/5",
    border: "hover:border-[#00d4aa]/40",
  },
  {
    href: "/v2",
    title: "V2 — Must Haves / Nice to Haves",
    description:
      "Two-step flow with free-text inputs. Founders list their non-negotiables first, then nice-to-haves.",
    icon: TextCursorInput,
    accent: "from-[#a78bfa]/20 to-[#a78bfa]/5",
    border: "hover:border-[#a78bfa]/40",
  },
  {
    href: "/v3",
    title: "V3 — AI Chat",
    description:
      "Conversational approach powered by Claude. Describe your ideal candidate and the AI helps refine vague requirements into specifics.",
    icon: MessageCircle,
    accent: "from-[#f59e0b]/20 to-[#f59e0b]/5",
    border: "hover:border-[#f59e0b]/40",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Design Sandbox
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose a flow to preview and iterate on.
          </p>
        </motion.div>

        <div className="space-y-4">
          {flows.map((flow, index) => (
            <motion.div
              key={flow.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
            >
              <Link href={flow.href} className="block group">
                <div
                  className={`relative overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br ${flow.accent} p-6 transition-all duration-300 ${flow.border} hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-background/80 p-3 shadow-sm">
                        <flow.icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="space-y-1.5">
                        <h2 className="text-xl font-semibold text-foreground">
                          {flow.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {flow.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground mt-1 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
