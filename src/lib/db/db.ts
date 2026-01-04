import path from "node:path";
import { APP_SETTINGS_FILE_NAME, APP_CHATS_FILE_NAME } from "../../config";
import { Settings } from "./methods/settings";
import { Chats } from "./methods/chats";

export class DB {
  readonly SettingsPath: string;
  readonly ChatsPath: string;
  _Settings: Settings;
  _Chats: Chats;

  constructor(appDirPath: string) {
    this.SettingsPath = path.join(appDirPath, APP_SETTINGS_FILE_NAME);
    this.ChatsPath = path.join(appDirPath, APP_CHATS_FILE_NAME);

    // make instance of class
    this._Settings = new Settings(this.SettingsPath);
    this._Chats = new Chats(this.ChatsPath);
  }
}
