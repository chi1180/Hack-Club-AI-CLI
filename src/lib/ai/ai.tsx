import type { ModelType } from "../../types/db.types";
import { getModels } from "./methods/getModels";

export class AI {
  _getModels: () => Promise<ModelType[]>;

  constructor() {
    this._getModels = getModels;
  }
}
