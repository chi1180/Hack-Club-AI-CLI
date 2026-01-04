import { init } from "./methods/init";
import { update } from "./methods/update";

export class Util {
  _init: (appPath: string) => Promise<void>;
  _update: (appPath: string) => Promise<void>;

  constructor() {
    this._init = init;
    this._update = update;
  }
}
