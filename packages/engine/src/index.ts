export interface EngineState {
  mode: "sample" | "replay" | "live";
  sessionClock: number;
}
