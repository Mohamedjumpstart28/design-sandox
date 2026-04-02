export interface Requirement {
  id: string;
  text: string;
  quality: "good" | "vague" | "unchecked";
  suggestion: string | null;
}

export type TagCategory = "experience" | "tool" | "skill";

export interface TagSuggestion {
  id: string;
  label: string;
  category: TagCategory;
}

export const MUST_HAVE_TAGS: TagSuggestion[] = [
  { id: "mt1", label: "2+ years of outbound sales experience", category: "experience" },
  { id: "mt2", label: "Proficient in HubSpot CRM", category: "tool" },
  { id: "mt3", label: "B2B SaaS sales experience", category: "experience" },
  { id: "mt4", label: "Proficient in Excel / Google Sheets", category: "tool" },
  { id: "mt5", label: "Lead generation with pipeline results", category: "experience" },
  { id: "mt6", label: "2+ years of project management experience", category: "experience" },
  { id: "mt7", label: "Data analysis experience", category: "skill" },
  { id: "mt8", label: "Proficient in AI tools (ChatGPT, Claude)", category: "tool" },
  { id: "mt9", label: "Cold calling experience", category: "experience" },
  { id: "mt10", label: "Fluent in English", category: "skill" },
];

export const NICE_TO_HAVE_TAGS: TagSuggestion[] = [
  { id: "nt1", label: "Performance marketing (paid/SEM)", category: "experience" },
  { id: "nt2", label: "Proficient in SQL or Python", category: "tool" },
  { id: "nt3", label: "Financial modelling experience", category: "skill" },
  { id: "nt4", label: "Content writing with portfolio", category: "experience" },
  { id: "nt5", label: "Social media management experience", category: "experience" },
  { id: "nt6", label: "Customer success experience", category: "experience" },
  { id: "nt7", label: "Proficient in Figma", category: "tool" },
  { id: "nt8", label: "SEO with ranking results", category: "skill" },
  { id: "nt9", label: "Proficient in Power BI / Tableau", category: "tool" },
  { id: "nt10", label: "Growth marketing experience", category: "experience" },
];
