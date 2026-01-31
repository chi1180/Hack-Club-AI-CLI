import { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { PALETTE, APP_DIRECTORY_NAME } from "../../../config";
import type {
  AspectRatio,
  ImageGenerationResult,
} from "../../../types/ai/generateImage.types";
import { ASPECT_RATIO_DESCRIPTIONS } from "../../../types/ai/generateImage.types";
import { AI } from "../../../lib/ai/ai";
import InputBox from "../chat/InputBox";
import path from "node:path";

/**
 * Available aspect ratios for selection
 */
const ASPECT_RATIOS: AspectRatio[] = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "4:5",
  "5:4",
  "3:2",
  "2:3",
  "21:9",
];

type GeneratorStep = "prompt" | "aspectRatio" | "generating" | "done";

interface ImageGeneratorProps {
  onComplete?: (result: ImageGenerationResult | null) => void;
  onCancel?: () => void;
  initialPrompt?: string;
}

/**
 * ImageGenerator - Interactive component for generating images
 */
export default function ImageGenerator({
  onComplete,
  onCancel,
  initialPrompt,
}: ImageGeneratorProps) {
  // State
  const [step, setStep] = useState<GeneratorStep>(
    initialPrompt ? "aspectRatio" : "prompt",
  );
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [selectedAspectRatioIndex, setSelectedAspectRatioIndex] = useState(0);
  const [result, setResult] = useState<ImageGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI instance
  const [ai] = useState(() => new AI());

  /**
   * Handle prompt submission
   */
  const handlePromptSubmit = useCallback((text: string) => {
    if (text.trim()) {
      setPrompt(text.trim());
      setStep("aspectRatio");
    }
  }, []);

  /**
   * Start image generation
   */
  const startGeneration = useCallback(async () => {
    setStep("generating");
    setError(null);

    const selectedAspectRatio =
      ASPECT_RATIOS[selectedAspectRatioIndex] ?? "1:1";

    // Default save directory
    const saveDirectory = path.join(
      process.cwd(),
      APP_DIRECTORY_NAME,
      "images",
    );

    try {
      const generationResult = await ai._generateImage({
        prompt,
        model: "google/gemini-2.5-flash-image",
        aspectRatio: selectedAspectRatio,
        saveDirectory,
      });

      setResult(generationResult);
      setStep("done");

      if (generationResult.success) {
        onComplete?.(generationResult);
      } else {
        setError(generationResult.error || "Unknown error occurred");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Image generation failed";
      setError(errorMessage);
      setStep("done");
      onComplete?.(null);
    }
  }, [ai, prompt, selectedAspectRatioIndex, onComplete]);

  /**
   * Handle keyboard input for selection steps
   */
  useInput(
    (input, key) => {
      // Cancel on Escape
      if (key.escape) {
        onCancel?.();
        return;
      }

      if (step === "aspectRatio") {
        if (key.upArrow) {
          setSelectedAspectRatioIndex((prev) =>
            prev > 0 ? prev - 1 : ASPECT_RATIOS.length - 1,
          );
        } else if (key.downArrow) {
          setSelectedAspectRatioIndex((prev) =>
            prev < ASPECT_RATIOS.length - 1 ? prev + 1 : 0,
          );
        } else if (key.return) {
          startGeneration();
        }
      } else if (step === "done") {
        if (key.return || input === " ") {
          onComplete?.(result);
        }
      }
    },
    { isActive: step !== "prompt" && step !== "generating" },
  );

  // Render based on current step
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color={PALETTE.highlight}>
          🎨 Image Generator
        </Text>
        <Text color={PALETTE.dim}> (using Gemini 2.5 Flash)</Text>
      </Box>

      {/* Step: Prompt Input */}
      {step === "prompt" && (
        <Box flexDirection="column">
          <Text color={PALETTE.info}>
            Describe the image you want to generate:
          </Text>
          <Box marginTop={1}>
            <InputBox
              onSubmit={handlePromptSubmit}
              placeholder="Enter your image description..."
            />
          </Box>
          <Box marginTop={1}>
            <Text color={PALETTE.dim}>Press Escape to cancel</Text>
          </Box>
        </Box>
      )}

      {/* Step: Aspect Ratio Selection */}
      {step === "aspectRatio" && (
        <Box flexDirection="column">
          <Text>
            <Text color={PALETTE.dim}>Prompt: </Text>
            <Text>{prompt}</Text>
          </Text>
          <Box marginTop={1} marginBottom={1}>
            <Text color={PALETTE.info}>Select aspect ratio:</Text>
          </Box>
          {ASPECT_RATIOS.map((ratio, index) => (
            <Box key={ratio}>
              <Text
                color={
                  index === selectedAspectRatioIndex
                    ? PALETTE.highlight
                    : undefined
                }
              >
                {index === selectedAspectRatioIndex ? "▸ " : "  "}
                {ASPECT_RATIO_DESCRIPTIONS[ratio]}
              </Text>
            </Box>
          ))}
          <Box marginTop={1}>
            <Text color={PALETTE.dim}>
              ↑/↓ to navigate, Enter to generate, Escape to cancel
            </Text>
          </Box>
        </Box>
      )}

      {/* Step: Generating */}
      {step === "generating" && (
        <Box flexDirection="column">
          <Text>
            <Text color={PALETTE.dim}>Prompt: </Text>
            <Text>{prompt}</Text>
          </Text>
          <Text>
            <Text color={PALETTE.dim}>Aspect Ratio: </Text>
            <Text>{ASPECT_RATIOS[selectedAspectRatioIndex] ?? "1:1"}</Text>
          </Text>
          <Box marginTop={1}>
            <Text color={PALETTE.warning}>⏳ Generating image...</Text>
          </Box>
          <Box marginTop={1}>
            <Text color={PALETTE.dim}>
              This may take a moment. Please wait...
            </Text>
          </Box>
        </Box>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <Box flexDirection="column">
          {result?.success ? (
            <>
              <Text color={PALETTE.success}>
                ✓ Image generated successfully!
              </Text>
              {result.textContent && (
                <Box marginTop={1}>
                  <Text color={PALETTE.dim}>{result.textContent}</Text>
                </Box>
              )}
              {result.images.map((img, index) => (
                <Box
                  key={`image-${index}-${img.savedPath ?? "unsaved"}`}
                  marginTop={1}
                >
                  {img.savedPath ? (
                    <Text>
                      <Text color={PALETTE.info}>📁 Saved: </Text>
                      <Text>{img.savedPath}</Text>
                    </Text>
                  ) : (
                    <Text color={PALETTE.dim}>
                      Image {index + 1}: {img.mimeType} (not saved)
                    </Text>
                  )}
                </Box>
              ))}
              {result.usage !== undefined && (
                <Box marginTop={1}>
                  <Text color={PALETTE.dim}>
                    Tokens used: {result.usage.totalTokens}
                  </Text>
                </Box>
              )}
            </>
          ) : (
            <>
              <Text color={PALETTE.error}>✗ Image generation failed</Text>
              {error && (
                <Box marginTop={1}>
                  <Text color={PALETTE.error}>{error}</Text>
                </Box>
              )}
            </>
          )}
          <Box marginTop={1}>
            <Text color={PALETTE.dim}>Press Enter to continue</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
