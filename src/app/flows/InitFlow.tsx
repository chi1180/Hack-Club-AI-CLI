import { Box, Text, Newline } from "ink";
import { useState } from "react";
import ConfirmInput from "../../components/confirm-input";
import Log from "../../components/log";
import { DB } from "../../lib/db";
import { DB_FILE_NAME } from "../../config";

// =============================================================================
// Types
// =============================================================================

type InitStep = "confirm" | "initializing" | "success" | "error" | "cancelled";

interface InitFlowProps {
  onComplete: (db: DB) => void;
  onCancel: () => void;
}

// =============================================================================
// Config
// =============================================================================

const TRANSITION_DELAY_MS = 500;

// =============================================================================
// Component
// =============================================================================

export default function InitFlow({ onComplete, onCancel }: InitFlowProps) {
  const [step, setStep] = useState<InitStep>("confirm");
  const [error, setError] = useState<string>("");

  const handleConfirm = (confirmed: boolean) => {
    if (!confirmed) {
      setStep("cancelled");
      setTimeout(() => {
        onCancel();
      }, TRANSITION_DELAY_MS);
      return;
    }

    setStep("initializing");

    // 少し待ってから初期化（UIの更新を見せるため）
    setTimeout(() => {
      try {
        const db = new DB(DB_FILE_NAME);
        db.connect();
        setStep("success");

        // 成功メッセージを見せてからメイン画面へ
        setTimeout(() => {
          onComplete(db);
        }, TRANSITION_DELAY_MS);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error ? e.message : "Unknown error occurred";
        setError(errorMessage);
        setStep("error");
      }
    }, 300);
  };

  // ステップごとに異なるUIを返す
  switch (step) {
    case "confirm":
      return (
        <Box flexDirection="column">
          <Log tag="warning" text="This directory isn't used before." />
          <Newline />
          <Log
            tag="system"
            text="In order to save your settings and chat history, I need to initialize a local database."
          />
          <Newline />
          <Box>
            <Log
              tag="question"
              text="Don't you mind to make a database for Hack Club AI CLI?"
            />
            <ConfirmInput onSubmit={handleConfirm} />
          </Box>
        </Box>
      );

    case "initializing":
      return (
        <Box flexDirection="column">
          <Log tag="info" text="Initializing database..." />
        </Box>
      );

    case "success":
      return (
        <Box flexDirection="column">
          <Log tag="success" text="Database initialized successfully!" />
        </Box>
      );

    case "error":
      return (
        <Box flexDirection="column">
          <Log tag="error" text="Failed to initialize database." />
          <Newline />
          <Text color="red">{error}</Text>
          <Newline />
          <Log tag="system" text="Please check permissions and try again." />
        </Box>
      );

    case "cancelled":
      return (
        <Box flexDirection="column">
          <Log tag="system" text="Initialization cancelled." />
          <Newline />
          <Log tag="system" text="Exiting..." />
        </Box>
      );
  }
}
