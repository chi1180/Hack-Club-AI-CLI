import { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { PALETTE } from "../../../config";
import type { InputBoxProps } from "../../../types/components/chat.types";

/**
 * InputBox - Text input component for chat messages
 */
export default function InputBox({
  onSubmit,
  disabled = false,
  placeholder = "Type a message...",
}: InputBoxProps) {
  const [value, setValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  useInput(
    (input, key) => {
      if (disabled) return;

      // Submit on Enter
      if (key.return) {
        if (value.trim()) {
          onSubmit(value.trim());
          setValue("");
          setCursorPosition(0);
        }
        return;
      }

      // Delete character
      if (key.backspace || key.delete) {
        if (cursorPosition > 0) {
          setValue((prev) =>
            prev.slice(0, cursorPosition - 1) + prev.slice(cursorPosition)
          );
          setCursorPosition((prev) => prev - 1);
        }
        return;
      }

      // Move cursor left
      if (key.leftArrow) {
        setCursorPosition((prev) => Math.max(0, prev - 1));
        return;
      }

      // Move cursor right
      if (key.rightArrow) {
        setCursorPosition((prev) => Math.min(value.length, prev + 1));
        return;
      }

      // Home key - move to start
      if (key.ctrl && input === "a") {
        setCursorPosition(0);
        return;
      }

      // End key - move to end
      if (key.ctrl && input === "e") {
        setCursorPosition(value.length);
        return;
      }

      // Clear line
      if (key.ctrl && input === "u") {
        setValue("");
        setCursorPosition(0);
        return;
      }

      // Add regular character
      if (input && !key.ctrl && !key.meta) {
        setValue((prev) =>
          prev.slice(0, cursorPosition) + input + prev.slice(cursorPosition)
        );
        setCursorPosition((prev) => prev + input.length);
      }
    },
    { isActive: !disabled }
  );

  // Render the input with cursor
  const renderInput = () => {
    if (value === "") {
      return (
        <>
          <Text backgroundColor="#495057"> </Text>
          <Text color={PALETTE.dim}>{placeholder}</Text>
        </>
      );
    }

    const beforeCursor = value.slice(0, cursorPosition);
    const atCursor = value[cursorPosition] || " ";
    const afterCursor = value.slice(cursorPosition + 1);

    return (
      <>
        <Text>{beforeCursor}</Text>
        <Text backgroundColor="#495057">{atCursor}</Text>
        <Text>{afterCursor}</Text>
      </>
    );
  };

  return (
    <Box
      borderStyle="round"
      borderColor={disabled ? PALETTE.dim : PALETTE.info}
      paddingX={1}
    >
      <Text color={disabled ? PALETTE.dim : PALETTE.info} bold>
        {"› "}
      </Text>
      {renderInput()}
    </Box>
  );
}
