import { existsSync, statSync } from "node:fs";

export function init(dirPath: string) {
  // Check existing
  const isDirExists = existsSync(dirPath) && statSync(dirPath).isDirectory();
  if (isDirExists) {
    console.info(`Directory already exists at ${dirPath}`);
  } else {
    console.error(`Directory does not exist at ${dirPath}`);
    process.exit(1);
  }
}
