import chalk from "chalk";
import type { LabelProps } from "../types/components/label.types";

export function log({ text, tag }: LabelProps) {
  let label: string;
  const formattedTag = ` ${tag.toUpperCase()} `;

  switch (tag) {
    case "error":
      label = chalk.bgRedBright.white(formattedTag);
      break;
    case "success":
      label = chalk.bgGreenBright.black(formattedTag);
      break;
    case "warning":
      label = chalk.bgYellowBright.black(formattedTag);
      break;
    case "info":
      label = chalk.bgBlueBright.white(formattedTag);
      break;
    default:
      console.error(`Unexpected tag: ${tag}`);
      process.exit(1);
  }

  console.log(`${label} ${text}`);
  console.log("");
}
