import colors from "yoctocolors";
import type {
  ParagraphProps,
  ParagtahTagValidation,
} from "../types/components.types";

export const PARAGRAPH_TAG_VALIDATION: ParagtahTagValidation = {
  user: (text) => `${colors.bgWhiteBright("[YOU]")} ${text}`,
  agent: (text) => `${colors.bgCyan("[AGENT]")} ${text}`,
  system: (text) => `${colors.bgGray("[SYSTEM]")} ${text}`,
  info: (text) => `${colors.bgMagenta("[INFO]")} ${text}`,
  warning: (text) => `${colors.bgYellow("[WARNING]")} ${text}`,
  error: (text) => `${colors.bgRed("[ERROR]")} ${text}`,
  success: (text) => `${colors.bgGreen("[SUCCESS]")} ${text}`,
};

export function Paragraph({ tag, text }: ParagraphProps) {
  const func = PARAGRAPH_TAG_VALIDATION[tag];
  if (typeof func === "function") {
    console.log(func(text));
  } else {
    console.log(text);
  }
}
