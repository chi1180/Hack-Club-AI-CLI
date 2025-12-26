import { Text, useInput } from "ink";
import { useState, type FC } from "react";
import type { ConfirmInputProps } from "../types/components.types";

// Config
const COLORS = {
  main: "cyanBright",
  sub: "gray",
};

const ConfirmInput: FC<ConfirmInputProps> = ({
  isChecked = false,
  placeholder = "",
  onChange,
  onSubmit,
}) => {
  const [value, setValue] = useState(isChecked ? "y" : "");

  useInput((input, key) => {
    if (key.return) {
      onSubmit?.(value === "y");
      return;
    }

    // Only accept y, n
    if (/^[yn]$/.test(input)) {
      setValue((prev) => {
        const isDifferent = prev !== input;
        if (isDifferent) onChange?.(input);
        return input;
      });
    }
  });

  const displayValue = value || placeholder;
  const color = value ? COLORS.main : COLORS.sub;

  return (
    <Text>
      <Text color={COLORS.sub}> [y/n] </Text>
      <Text color={COLORS.main}>{value ? "" : "_"}</Text>
      <Text color={color}>{displayValue}</Text>
    </Text>
  );
};

export default ConfirmInput;
