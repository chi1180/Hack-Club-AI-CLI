export interface ParagraphProps {
  tag: "user" | "agent" | "system" | "warning" | "error" | "info" | "success";
  text: string;
}

export interface ParagtahTagValidation {
  [key: string]: (text: string) => string;
}
