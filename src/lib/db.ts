import { Database } from "bun:sqlite";
import fs from "node:fs";

export class DB {
  dbFileName = "";
  db: Database | null;

  constructor(db_file_name: string) {
    this.dbFileName = db_file_name;
    this.db = null;
  }

  exists(): boolean {
    return fs.existsSync(this.dbFileName);
  }

  connect() {
    this.db = new Database(this.dbFileName, {
      create: true,
    });
    this.dbInitialize();
  }

  dbInitialize() {
    this.db?.run(`				CREATE TABLE IF NOT EXISTS config (

)`);
    this.db?.run(`CREATE TABLE IF NOT EXISTS chat`);
  }
}
