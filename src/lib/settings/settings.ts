import path from "node:path";
import { APP_SETTINGS_FILE_NAME, DEFAULT_SETTINGS } from "../../config";
import { file } from "bun";
import { log } from "../log";
import { getModels } from "./methods/getmodels";
import type { ModelType } from "../../types/config.types";

export class Settings {
  readonly settingsPath: string;

  constructor(appDir: string) {
    this.settingsPath = path.join(appDir, APP_SETTINGS_FILE_NAME);
  }

  async init() {
    log({
      tag: "info",
      text: `Create ${APP_SETTINGS_FILE_NAME} at ${this.settingsPath}`,
    });

    const defaultSettingsWithModels = {
      ...DEFAULT_SETTINGS,
      models: await getModels(),
    };
    await file(this.settingsPath).write(
      JSON.stringify(defaultSettingsWithModels, null, 2),
    );

    log({
      tag: "success",
      text: `${APP_SETTINGS_FILE_NAME} created successfully at ${this.settingsPath}`,
    });
  }

  async update(
    key: "models" | "lastUsedModel" | "showStatusBar" | "showCommandsHelp",
    value: boolean | string | ModelType[],
  ) {
    const settingData = file(this.settingsPath);
    const settingsContent = await settingData.text();
    const settings = JSON.parse(settingsContent);
    settings[key] = value;
    await settingData.write(JSON.stringify(settings, null, 2));
  }
}
