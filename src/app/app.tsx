import { useState, useEffect } from "react";
import { Box } from "ink";
import Hero from "./components/hero";
import { ChatContainer } from "./components/chat";

export default function App() {
  const [showHero, setShowHero] = useState(true);

  // Hide hero after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHero(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showHero) {
    return <Hero />;
  }

  return (
    <Box flexDirection="column" width="100%">
      <ChatContainer />
    </Box>
  );
}
