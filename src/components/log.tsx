import { Text } from "ink";
import type { LogProps } from "../types/components.types";

const tagColors: Record<string, { front: string; back: string }> = {
  user: {
    front: "#ffffff",
    back: "#000000",
  },
  agent: {
    front: "#000000",
    back: "#00FFFF",
  },
  system: {
    front: "#000000",
    back: "#808080",
  },
  info: {
    front: "#000000",
    back: "#FF00FF",
  },
  warning: {
    front: "#000000",
    back: "#FFFF00",
  },
  error: {
    front: "#000000",
    back: "#FF0000",
  },
  success: {
    front: "#000000",
    back: "#00FF00",
  },
  question: {
    front: "#000000",
    back: "#FFA500",
  },
};

export default function Log({ tag, text }: LogProps) {
  return (
    <Text>
      <Text
        color={tagColors[tag]?.front}
        backgroundColor={tagColors[tag]?.back}
      >
        [{tag.toUpperCase()}]
      </Text>{" "}
      {text}
    </Text>
  );
}
