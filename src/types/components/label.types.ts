export type LabelTag = "info" | "warning" | "warn" | "error" | "success";

export interface LabelProps {
  text: string;
  tag: LabelTag;
}
