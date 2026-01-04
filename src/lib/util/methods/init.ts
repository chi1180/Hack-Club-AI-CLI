import fs from "node:fs";
import { log } from "../../log";
import { DB } from "../../db/db";

export async function init(appDirPath: string) {
  log({
    tag: "info",
    text: `Initializing application directory at ${appDirPath}...`,
  });

  // make directory
  fs.mkdirSync(appDirPath);

  // run settings initialization
  const _DB = new DB(appDirPath);
  _DB._Settings.init();

  log({
    tag: "success",
    text: `Application directory initialized at ${appDirPath}.`,
  });
}
