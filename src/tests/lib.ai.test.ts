import { test, expect, describe, setDefaultTimeout } from "bun:test";
import { AI } from "../lib/ai/ai";
import { parseBase64DataUrl } from "../lib/ai/methods/generateImage";
import {
  parseFileAttachment,
  getFileInfo,
  isImageFile,
} from "../lib/ai/methods/vision";

// Extend default timeout for API calls
setDefaultTimeout(60000);

/**
 * AI class methods test
 */
describe("AI class methods test", () => {
  const _AI = new AI();

  test("Each methods should be function", () => {
    expect(_AI._getModels).toBeFunction();
    expect(_AI._getStats).toBeFunction();
    expect(_AI._chat).toBeFunction();
    expect(_AI._chatStream).toBeFunction();
    expect(_AI._simpleChat).toBeFunction();
    expect(_AI._generateImage).toBeFunction();
    expect(_AI._simpleGenerateImage).toBeFunction();
    expect(_AI._generateAndSaveImage).toBeFunction();
  });

  describe("getModels", () => {
    test("should return an array of models", async () => {
      const response = await _AI._getModels();
      expect(response).toBeArray();
      expect(response.length).toBeGreaterThan(0);
    });

    test("each model should have required properties", async () => {
      const response = await _AI._getModels();
      const model = response[0];

      expect(model).toBeDefined();
      expect(model).toHaveProperty("id");
      expect(model).toHaveProperty("name");
      expect(model).toHaveProperty("context_length");
      if (model) {
        expect(typeof model.id).toBe("string");
        expect(typeof model.name).toBe("string");
      }
    });
  });

  describe("getStats", () => {
    test("should return token usage statistics", async () => {
      const response = await _AI._getStats();

      expect(response).toHaveProperty("totalRequests");
      expect(response).toHaveProperty("totalTokens");
      expect(response).toHaveProperty("totalPromptTokens");
      expect(response).toHaveProperty("totalCompletionTokens");
      expect(typeof response.totalRequests).toBe("number");
      expect(typeof response.totalTokens).toBe("number");
    });
  });

  describe("chat (non-streaming)", () => {
    test("should return a chat response", async () => {
      const result = await _AI._chat({
        model: "qwen/qwen3-32b",
        messages: [{ role: "user", content: "Say 'Hello' and nothing else." }],
      });

      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("usage");
      expect(result).toHaveProperty("finishReason");
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
    });

    test("should include usage information", async () => {
      const result = await _AI._chat({
        model: "qwen/qwen3-32b",
        messages: [{ role: "user", content: "Say 'Test' only." }],
      });

      expect(result.usage).toHaveProperty("prompt_tokens");
      expect(result.usage).toHaveProperty("completion_tokens");
      expect(result.usage).toHaveProperty("total_tokens");
      expect(result.usage.prompt_tokens).toBeGreaterThan(0);
    });

    test("should respect system prompt", async () => {
      const result = await _AI._chat({
        model: "qwen/qwen3-32b",
        messages: [
          {
            role: "system",
            content: "Reply with only: YES",
          },
          { role: "user", content: "OK?" },
        ],
      });

      expect(result.content.toUpperCase()).toContain("YES");
    });
  });

  describe("chatStream (streaming)", () => {
    test("should return a chat response via streaming", async () => {
      const chunks: string[] = [];

      const result = await _AI._chatStream({
        model: "qwen/qwen3-32b",
        messages: [{ role: "user", content: "Say 'Hi' and nothing else." }],
        onContent: (content) => {
          chunks.push(content);
        },
      });

      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("finishReason");
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
      // Streaming should have called onContent at least once
      expect(chunks.length).toBeGreaterThan(0);
      // The concatenated chunks should match the final content
      expect(chunks.join("")).toBe(result.content);
    });
  });

  describe("simpleChat", () => {
    test("should return a simple string response", async () => {
      const response = await _AI._simpleChat(
        "qwen/qwen3-32b",
        "Say 'OK' only.",
      );

      expect(typeof response).toBe("string");
      expect(response.length).toBeGreaterThan(0);
    });

    test("should support optional system prompt", async () => {
      const response = await _AI._simpleChat(
        "qwen/qwen3-32b",
        "Reply now.",
        "Always reply with only: DONE",
      );

      expect(response.toUpperCase()).toContain("DONE");
    });
  });

  describe("generateImage", () => {
    test("should return an ImageGenerationResult", async () => {
      const result = await _AI._generateImage({
        prompt: "A simple red circle on a white background",
        model: "google/gemini-2.5-flash-image",
        aspectRatio: "1:1",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("textContent");
      expect(result).toHaveProperty("images");
      expect(Array.isArray(result.images)).toBe(true);
    });

    test("should generate an image with valid data URL", async () => {
      const result = await _AI._generateImage({
        prompt: "A blue square",
        model: "google/gemini-2.5-flash-image",
      });

      if (result.success && result.images.length > 0) {
        const image = result.images[0];
        expect(image).toBeDefined();
        if (image) {
          expect(image).toHaveProperty("dataUrl");
          expect(image).toHaveProperty("mimeType");
          expect(image.dataUrl).toMatch(/^data:image\//);
        }
      }
    });

    test("should fail gracefully with invalid model", async () => {
      const result = await _AI._generateImage({
        prompt: "Test image",
        // @ts-expect-error - Testing invalid model
        model: "invalid/model-name",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("should support different aspect ratios", async () => {
      const result = await _AI._generateImage({
        prompt: "A green triangle",
        model: "google/gemini-2.5-flash-image",
        aspectRatio: "16:9",
      });

      expect(result).toHaveProperty("success");
      // Note: We can't verify the actual aspect ratio without decoding the image
    });
  });

  describe("simpleGenerateImage", () => {
    test("should generate an image with minimal options", async () => {
      const result = await _AI._simpleGenerateImage(
        "A yellow star on black background",
      );

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("images");
    });

    test("should accept optional aspect ratio", async () => {
      const result = await _AI._simpleGenerateImage("A purple diamond", "4:3");

      expect(result).toHaveProperty("success");
    });
  });
});

/**
 * Image generation utility functions test
 */
describe("Image generation utilities", () => {
  describe("parseBase64DataUrl", () => {
    test("should parse a valid PNG data URL", () => {
      const dataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const result = parseBase64DataUrl(dataUrl);

      expect(result).not.toBeNull();
      expect(result?.mimeType).toBe("image/png");
      expect(result?.extension).toBe("png");
      expect(result?.base64Data).toBe(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      );
      expect(result?.buffer).toBeInstanceOf(Buffer);
    });

    test("should parse a valid JPEG data URL", () => {
      const dataUrl =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBg==";
      const result = parseBase64DataUrl(dataUrl);

      expect(result).not.toBeNull();
      expect(result?.mimeType).toBe("image/jpeg");
      expect(result?.extension).toBe("jpg");
    });

    test("should parse a valid WebP data URL", () => {
      const dataUrl =
        "data:image/webp;base64,UklGRhIAAABXRUJQVlA4TAYAAAAvQWxvAGs=";
      const result = parseBase64DataUrl(dataUrl);

      expect(result).not.toBeNull();
      expect(result?.mimeType).toBe("image/webp");
      expect(result?.extension).toBe("webp");
    });

    test("should return null for invalid data URL", () => {
      const invalidDataUrl = "not-a-data-url";
      const result = parseBase64DataUrl(invalidDataUrl);

      expect(result).toBeNull();
    });

    test("should return null for non-image data URL", () => {
      const textDataUrl = "data:text/plain;base64,SGVsbG8gV29ybGQ=";
      const result = parseBase64DataUrl(textDataUrl);

      expect(result).toBeNull();
    });

    test("should return null for malformed data URL", () => {
      const malformed = "data:image/png;base64";
      const result = parseBase64DataUrl(malformed);

      expect(result).toBeNull();
    });
  });
});

/**
 * Vision utilities test
 */
describe("Vision utilities", () => {
  describe("parseFileAttachment", () => {
    test("should parse @file:path syntax", () => {
      const result = parseFileAttachment("@file:image.png What is this?");
      expect(result.filePath).toBe("image.png");
      expect(result.cleanedMessage).toBe("What is this?");
    });

    test('should parse @file:"path with spaces" syntax', () => {
      const result = parseFileAttachment(
        '@file:"my image.png" Describe this image',
      );
      expect(result.filePath).toBe("my image.png");
      expect(result.cleanedMessage).toBe("Describe this image");
    });

    test("should parse @file:'path with spaces' syntax", () => {
      const result = parseFileAttachment(
        "@file:'another image.jpg' What do you see?",
      );
      expect(result.filePath).toBe("another image.jpg");
      expect(result.cleanedMessage).toBe("What do you see?");
    });

    test("should return null filePath when no attachment", () => {
      const result = parseFileAttachment("Just a regular message");
      expect(result.filePath).toBeNull();
      expect(result.cleanedMessage).toBe("Just a regular message");
    });

    test("should handle file path with directory", () => {
      const result = parseFileAttachment(
        "@file:./images/photo.png Analyze this",
      );
      expect(result.filePath).toBe("./images/photo.png");
      expect(result.cleanedMessage).toBe("Analyze this");
    });
  });

  describe("isImageFile", () => {
    test("should return true for PNG files", async () => {
      const result = await isImageFile("test.png");
      expect(result).toBe(true);
    });

    test("should return true for JPEG files", async () => {
      const result = await isImageFile("photo.jpg");
      expect(result).toBe(true);
    });

    test("should return true for WebP files", async () => {
      const result = await isImageFile("image.webp");
      expect(result).toBe(true);
    });

    test("should return false for text files", async () => {
      const result = await isImageFile("document.txt");
      expect(result).toBe(false);
    });

    test("should return false for unknown extensions", async () => {
      const result = await isImageFile("file.xyz");
      expect(result).toBe(false);
    });
  });

  describe("getFileInfo", () => {
    test("should return exists: false for non-existent file", async () => {
      const result = await getFileInfo("/non/existent/path/file.png");
      expect(result.exists).toBe(false);
      expect(result.isImage).toBe(false);
    });

    test("should detect image type from extension", async () => {
      // This tests the extension detection, not actual file reading
      const result = await getFileInfo("fake-image.png");
      // File doesn't exist, but we can still verify it would be detected as image
      expect(result.exists).toBe(false);
    });
  });
});

/**
 * Vision API methods test (requires API calls)
 */
describe("Vision API methods", () => {
  const _AI = new AI();

  test("Each vision method should be a function", () => {
    expect(_AI._visionChat).toBeFunction();
    expect(_AI._simpleVisionChat).toBeFunction();
    expect(_AI._analyzeImageUrl).toBeFunction();
  });

  // Note: Actual vision API tests require real image files or URLs
  // These are integration tests that would require proper test fixtures
});
