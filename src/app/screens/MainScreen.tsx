import { Box, Text, useInput } from "ink";
import { useState } from "react";
import Log from "../../components/log";
import { useAppContext } from "../../hooks/useAppContext";
import type { ParsedCommand } from "../../types/app.types";

// =============================================================================
// Types
// =============================================================================

interface MainScreenProps {
  onCommand?: (command: ParsedCommand) => void;
}

// =============================================================================
// Command Parser
// =============================================================================

function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // コマンドは / で始まる必要がある
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const command = parts[0] ?? "";
  const rest = parts.slice(1);

  // サブコマンドとフラグ/引数を分離
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let subCommand: string | undefined;

  let i = 0;
  // 最初の非フラグ要素をサブコマンドとして扱う
  if (rest[0] && !rest[0].startsWith("--")) {
    subCommand = rest[0];
    i = 1;
  }

  // 残りをパース
  for (; i < rest.length; i++) {
    const part = rest[i];
    if (!part) continue;

    if (part.startsWith("--")) {
      const flagName = part.slice(2);
      const nextPart = rest[i + 1];
      // 次の要素がフラグでなければ値として扱う
      if (nextPart && !nextPart.startsWith("--")) {
        flags[flagName] = nextPart;
        i++;
      } else {
        flags[flagName] = true;
      }
    } else {
      args.push(part);
    }
  }

  return { command, subCommand, args, flags };
}

// =============================================================================
// Component
// =============================================================================

export default function MainScreen({ onCommand }: MainScreenProps) {
  const { navigate, state, exit } = useAppContext();
  const [input, setInput] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);

  // キー入力を処理
  useInput((char, key) => {
    if (key.return) {
      // Enter: コマンドを実行
      handleSubmit(input);
      return;
    }

    if (key.backspace || key.delete) {
      // Backspace: 最後の文字を削除
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (key.ctrl && char === "c") {
      // Ctrl+C: 終了
      exit();
      return;
    }

    if (key.ctrl && char === "u") {
      // Ctrl+U: 入力をクリア
      setInput("");
      return;
    }

    // 通常の文字入力
    if (char && !key.ctrl && !key.meta) {
      setInput((prev) => prev + char);
    }
  });

  const handleSubmit = (value: string) => {
    const parsed = parseCommand(value);
    setInput("");
    setLastError(null);

    if (!parsed) return;

    // カスタムハンドラがあれば使用
    if (onCommand) {
      onCommand(parsed);
      return;
    }

    // 組み込みコマンドの処理
    switch (parsed.command) {
      case "chat":
        if (parsed.subCommand === "new") {
          navigate({
            type: "chat",
            isNew: true,
          });
        } else if (parsed.subCommand === "list") {
          // TODO: チャット一覧画面
          navigate({ type: "chat" });
        } else {
          navigate({ type: "chat" });
        }
        break;

      case "image":
        navigate({ type: "image" });
        break;

      case "search":
        navigate({ type: "search" });
        break;

      case "model":
        navigate({ type: "model" });
        break;

      case "template":
        navigate({ type: "template" });
        break;

      case "alias":
        navigate({ type: "alias" });
        break;

      case "stats":
        navigate({ type: "stats" });
        break;

      case "config":
        navigate({ type: "config" });
        break;

      case "help":
        navigate({
          type: "help",
          command: parsed.subCommand,
        });
        break;

      case "exit":
      case "quit":
      case "q":
        exit();
        break;

      default:
        setLastError(`Unknown command: /${parsed.command}`);
    }
  };

  return (
    <Box flexDirection="column">
      {/* Error Display */}
      {lastError && (
        <Box marginBottom={1}>
          <Log tag="error" text={lastError} />
        </Box>
      )}

      {/* Global Error */}
      {state.error && (
        <Box marginBottom={1}>
          <Log tag="error" text={state.error} />
        </Box>
      )}

      {/* Input Prompt */}
      <Box>
        <Text color="green" bold>
          {">"}{" "}
        </Text>
        <Text color="cyanBright">{input}</Text>
        <Text color="gray">▌</Text>
      </Box>

      {/* Placeholder when empty */}
      {!input && (
        <Box marginLeft={2}>
          <Text color="gray">Type a command here... (e.g., /help)</Text>
        </Box>
      )}

      {/* Hint */}
      <Box marginTop={1}>
        <Text color="gray">
          Commands: /chat, /image, /search, /model, /template, /alias, /stats,
          /config, /help, /exit
        </Text>
      </Box>
    </Box>
  );
}
