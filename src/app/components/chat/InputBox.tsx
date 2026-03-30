import { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { PALETTE } from "../../../config";
import type { InputBoxProps } from "../../../types/components/chat.types";

/**
 * InputBox - Text input component for chat messages using ink-text-input
 */
export default function InputBox({
  onSubmit,
  disabled = false,
  placeholder = "Type a message...",
}: InputBoxProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (val: string) => {
    if (val.trim() && !disabled) {
      onSubmit(val.trim());
      setValue("");
    }
  };

  return (
    <Box
      borderStyle="round"
      borderColor={disabled ? PALETTE.dim : PALETTE.info}
      paddingX={1}
      width="100%"
      height={3}
    >
      <Text color={disabled ? PALETTE.dim : PALETTE.info} bold>
        {"› "}
      </Text>
      {disabled ? (
        <Text color={PALETTE.dim}>{placeholder}</Text>
      ) : (
        <TextInput
          value={value}
          onChange={setValue}
          placeholder={placeholder}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
}
