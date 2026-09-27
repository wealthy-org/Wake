import React from "react";
import { render, Text, Box } from "ink";

export function WakeTerminal() {
  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <Text bold color="green">Wake — Wallet Rotation Terminal</Text>
      <Text color="gray">Mode: Sample | Replay | Live</Text>
    </Box>
  );
}

if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  render(<WakeTerminal />);
}
