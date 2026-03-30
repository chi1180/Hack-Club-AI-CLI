import Hero from "./components/hero";
import { ChatContainer } from "./components/chat";

interface AppProps {
  type: "chat" | "init";
}
export default function App({ type }: AppProps) {
  switch (type) {
    case "chat":
      return <ChatContainer />;
    case "init":
      return <Hero />;
    default:
      return <Hero />;
  }
}
