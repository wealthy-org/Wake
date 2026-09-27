import { DatabaseSync } from "node:sqlite";

export function createDatabase(path: string = ":memory:") {
  return new DatabaseSync(path);
}
