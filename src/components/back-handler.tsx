import { useInput } from "ink";
import { useAppContext } from "../hooks/useAppContext";
import type { FC } from "react";

// =============================================================================
// Types
// =============================================================================

interface BackHandlerProps {
  /** Custom handler when back is triggered */
  onBack?: () => void;
  /** Key to trigger back (default: escape) */
  triggerKey?: "escape" | "q" | "backspace";
  /** Whether the handler is enabled */
  enabled?: boolean;
}

// =============================================================================
// Component
// =============================================================================

/**
 * BackHandler - 戻るキーを処理するコンポーネント
 *
 * デフォルトではEscapeキーでgoBack()を呼び出す
 * onBackを指定するとカスタムハンドラを使用
 */
const BackHandler: FC<BackHandlerProps> = ({
  onBack,
  triggerKey = "escape",
  enabled = true,
}) => {
  const { goBack } = useAppContext();

  useInput(
    (input, key) => {
      if (!enabled) return;

      let shouldTrigger = false;

      switch (triggerKey) {
        case "escape":
          shouldTrigger = key.escape;
          break;
        case "q":
          shouldTrigger = input.toLowerCase() === "q" && !key.ctrl;
          break;
        case "backspace":
          shouldTrigger = key.backspace;
          break;
      }

      if (shouldTrigger) {
        if (onBack) {
          onBack();
        } else {
          goBack();
        }
      }
    },
    { isActive: enabled }
  );

  // このコンポーネントは何もレンダリングしない
  return null;
};

export default BackHandler;
