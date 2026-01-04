import fs from "node:fs";
import { Settings } from "./settings/settings";

export async function init(appDirPath: string) {
  // make directory
  fs.mkdirSync(appDirPath);

  // run settings and db initialization
  const _Settings = new Settings(appDirPath);
  await _Settings.init();
}
