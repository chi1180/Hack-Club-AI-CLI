import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { DEFAULT_SETTINGS } from "../../../config";
import type { ModelType } from "../../../types/db/types";
import type { SettingsDB } from "../../../types/db/types";
import { AI } from "../../ai/ai";

export class Settings {
  readonly path: string;
  private db: Low<SettingsDB> | null;
  private _AI: AI;

  constructor(settingsPath: string) {
    this.path = settingsPath;
    this.db = null;
    JSONFilePreset<SettingsDB>(this.path, DEFAULT_SETTINGS).then((db) => {
      this.db = db;
    });
    this._AI = new AI();
  }

  async init() {
    const models = await this._AI._getModels();
    this.update("models", models);
  }

  async update(key: keyof SettingsDB, value: SettingsDB[keyof SettingsDB]) {
    if (this.db) {
      await this.db.read();

      switch (key) {
        case "models":
          this.db.data.models = value as ModelType[];
          break;
        case "lastUsedModel":
          this.db.data.lastUsedModel = value as string;
          break;
        case "showStatusBar":
          this.db.data.showStatusBar = value as boolean;
          break;
        case "showCommandsHelp":
          this.db.data.showCommandsHelp = value as boolean;
          break;
      }
      await this.db.write();
    }
  }
}
