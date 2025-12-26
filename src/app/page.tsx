import { Box } from "ink";
import { useEffect, useMemo } from "react";
import Hero from "../components/hero";
import {
  AppProvider,
  useAppContext,
  useCurrentScreen,
} from "../hooks/useAppContext";
import Router from "./Router";
import InitFlow from "./flows/InitFlow";
import { DB } from "../lib/db";
import { DB_FILE_NAME } from "../config";

// =============================================================================
// Main Page Component
// =============================================================================

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

// =============================================================================
// App Content - Provider内で実際のロジックを処理
// =============================================================================

function AppContent() {
  const { navigate, setDB, exit } = useAppContext();
  const screen = useCurrentScreen();

  // 初回チェック：DBが既に存在するかどうか
  const dbExists = useMemo(() => {
    const tempDB = new DB(DB_FILE_NAME);
    return tempDB.exists();
  }, []);

  // DBが既に存在すれば自動的に接続してメイン画面へ
  useEffect(() => {
    if (dbExists && screen.type === "init") {
      try {
        const db = new DB(DB_FILE_NAME);
        db.connect();
        setDB(db);
        navigate({ type: "main" });
      } catch (error) {
        // エラーが発生した場合は初期化フローを表示（既存DBが壊れている可能性）
        console.error("Failed to connect to existing DB:", error);
      }
    }
  }, [dbExists, screen.type, navigate, setDB]);

  // 初期化フロー完了時のハンドラ
  const handleInitComplete = (newDB: DB) => {
    setDB(newDB);
    navigate({ type: "main" });
  };

  // 初期化キャンセル時のハンドラ
  const handleInitCancel = () => {
    exit();
  };

  return (
    <Box flexDirection="column">
      {/* Hero Banner */}
      <Hero />

      {/* Screen Content */}
      {screen.type === "init" && !dbExists ? (
        <InitFlow onComplete={handleInitComplete} onCancel={handleInitCancel} />
      ) : screen.type !== "init" ? (
        <Router />
      ) : null}
    </Box>
  );
}
