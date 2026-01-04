import { render } from "ink";
import App from "./src/app/app";
import { existsSync, statSync } from "node:fs";
import { APP_DIRECTORY_NAME } from "./src/config";
import path from "node:path";
import { Util } from "./src/lib/util/util";

async function main() {
  // parse command line arguments
  const args = process.argv.slice(2);
  const isUpdateRequired = args.includes("--update");

  // make instance
  const _Util = new Util();

  const appPath = path.join(process.cwd(), APP_DIRECTORY_NAME); // e.g., /path/tp/project/.hackclubaicli
  const isUsed = existsSync(appPath) && statSync(appPath).isDirectory();
  if (!isUsed) {
    await _Util._init(appPath);
  } else if (isUpdateRequired) {
    await _Util._update(appPath);
  }

  render(App());
}

// RUN !!!
main();
