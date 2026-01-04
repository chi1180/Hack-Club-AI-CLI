export type LabelTag = "info" | "warning" | "error" | "success";

export interface LabelProps {
  text: string;
  tag: LabelTag;
}
