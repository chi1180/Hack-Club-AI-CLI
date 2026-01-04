import { Text } from "ink";
import { PALETTE } from "../../config";
import type { LabelProps } from "../../types/components.label.types";

export default function Label({ text, tag }: LabelProps) {
  return (
    <Text>
      <Text backgroundColor={PALETTE[tag]}> {tag.toUpperCase()} </Text>
      <Text> {text}</Text>
    </Text>
  );
}
