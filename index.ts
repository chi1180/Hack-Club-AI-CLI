import { render } from "ink";
import App from "./src/app/app";
import { init } from "./src/lib/init";
import { existsSync, statSync } from "node:fs";
import { APP_DIRECTORY_NAME } from "./src/config";
import path from "node:path";

async function main() {
  const appPath = path.join(process.cwd(), APP_DIRECTORY_NAME); // e.g., /path/tp/project/.hackclubaicli
  const isUsed = existsSync(appPath) && statSync(appPath).isDirectory();
  if (!isUsed) {
    await init(appPath);
  }

  render(App());
}

// RUN !!!
main();
