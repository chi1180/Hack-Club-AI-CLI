import { Box, Text } from "ink";
import { useAppContext } from "../hooks/useAppContext";
import { MainScreen, HelpScreen } from "./screens";
import Log from "../components/log";

// =============================================================================
// Placeholder Screens - 未実装画面の仮コンポーネント
// =============================================================================

interface PlaceholderProps {
  name: string;
}

function PlaceholderScreen({ name }: PlaceholderProps) {
  return (
    <Box flexDirection="column">
      <Log tag="info" text={`${name} Screen`} />
      <Box marginTop={1}>
        <Text color="gray">This screen is not yet implemented.</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray">Type /help or press Ctrl+C to go back.</Text>
      </Box>
    </Box>
  );
}

// =============================================================================
// Router Component
// =============================================================================

export default function Router() {
  const { state } = useAppContext();
  const { screen } = state;

  // 画面タイプに応じて適切なコンポーネントを返す
  switch (screen.type) {
    case "main":
      return <MainScreen />;

    case "help":
      return <HelpScreen command={screen.command} />;

    case "chat":
      return <PlaceholderScreen name="Chat" />;

    case "image":
      return <PlaceholderScreen name="Image" />;

    case "search":
      return <PlaceholderScreen name="Search" />;

    case "model":
      return <PlaceholderScreen name="Model" />;

    case "template":
      return <PlaceholderScreen name="Template" />;

    case "alias":
      return <PlaceholderScreen name="Alias" />;

    case "stats":
      return <PlaceholderScreen name="Stats" />;

    case "context":
      return <PlaceholderScreen name="Context" />;

    case "config":
      return <PlaceholderScreen name="Config" />;

    case "exit":
      return (
        <Box flexDirection="column">
          <Log tag="system" text="Goodbye! See you next time." />
        </Box>
      );

    case "init":
      // InitFlowはPageコンポーネントで直接ハンドルされる
      // ここには来ないはずだが、念のため
      return null;

    default: {
      // 型安全のためのexhaustive check
      const _exhaustive: never = screen;
      return null;
    }
  }
}
