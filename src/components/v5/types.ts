export interface Requirement {
  id: string;
  text: string;
  quality: "good" | "vague" | "unchecked";
  suggestion: string | null;
}

export interface TagSuggestion {
  id: string;
  label: string;
}

// All suggestions in one pool — no must/nice split at capture time
export const ALL_TAGS: TagSuggestion[] = [
  { id: "t1", label: "Communication" },
  { id: "t2", label: "Problem Solving" },
  { id: "t3", label: "Analytical" },
  { id: "t4", label: "Project Management" },
  { id: "t5", label: "AI Tools proficiency" },
  { id: "t6", label: "Excel / Google Sheets" },
  { id: "t7", label: "CRM experience" },
  { id: "t8", label: "Data Analysis" },
  { id: "t9", label: "Outbound Sales" },
  { id: "t10", label: "Lead Generation" },
  { id: "t11", label: "HubSpot" },
  { id: "t12", label: "Social Media Management" },
  { id: "t13", label: "Performance Marketing" },
  { id: "t14", label: "Content Writing" },
  { id: "t15", label: "Financial Modelling" },
  { id: "t16", label: "Customer Service" },
  { id: "t17", label: "SQL / Python" },
  { id: "t18", label: "Negotiation" },
];
