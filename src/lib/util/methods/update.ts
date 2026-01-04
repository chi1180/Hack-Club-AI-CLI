import { log } from "../../log";
import { AI } from "../../ai/ai";
import { DB } from "../../db/db";

export async function update(appPath: string) {
  // make instances
  const _AI = new AI();
  const _DB = new DB(appPath);

  // update models in settings
  log({
    tag: "info",
    text: "Updating models in settings...",
  });

  _DB._Settings.update("models", await _AI._getModels());

  log({
    tag: "success",
    text: "Models updated successfully.",
  });
}
