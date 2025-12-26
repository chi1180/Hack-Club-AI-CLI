export interface LogProps {
  tag:
    | "user"
    | "agent"
    | "system"
    | "warning"
    | "error"
    | "info"
    | "success"
    | "question";
  text: string;
}

export interface ConfirmInputProps {
  /** Whether to return true or false by default */
  isChecked?: boolean;
  /** Value to display in a text input */
  value?: string;
  /** Text to display when value is empty */
  placeholder?: string;
  /** Function to call when value updates. Returns a string with the input */
  onChange?: (value: string) => void;
  /** Function to call when user press Enter. Returns a boolean for the answer */
  onSubmit?: (value: boolean) => void;
}
