export interface Requirement {
  id: string;
  text: string;
  quality: "good" | "vague" | "unchecked";
  suggestion: string | null;
}
