```bash
curl https://ai.hackclub.com/proxy/v1/chat/completions \
-H "Authorization: Bearer sk-hc-v1-f768cf5366404c698ebfba7d477d22d1c0e772e98344415c9223d007633b73f6" \
-H "Content-Type: application/json" \
-d '{"model": "qwen/qwen3-32b", "messages": [{"role": "user", "content": "Hi"}]}'
{"id":"gen-1766560958-qN7Gt3oXln7EEUox2h5N","provider":"Groq","model":"qwen/qwen3-32b","object":"chat.completion","created":1766560958,"choices":[{"logprobs":null,"finish_reason":"stop","native_finish_reason":"stop","index":0,"message":{"role":"assistant","content":"Hello! How can I help you today? 😊","refusal":null,"reasoning":"Okay, the user sent \"Hi\". I need to respond appropriately. Since it's a greeting, I should acknowledge it and ask how I can assist. Maybe something like \"Hello! How can I help you today?\" That should be friendly and open-ended. Let me make sure there's no need for a longer response here. Just keep it simple and welcoming.\n","reasoning_details":[{"format":null,"index":0,"type":"reasoning.text","text":"Okay, the user sent \"Hi\". I need to respond appropriately. Since it's a greeting, I should acknowledge it and ask how I can assist. Maybe something like \"Hello! How can I help you today?\" That should be friendly and open-ended. Let me make sure there's no need for a longer response here. Just keep it simple and welcoming.\n"}]}}],"system_fingerprint":"fp_efa9879028","usage":{"prompt_tokens":9,"completion_tokens":89,"total_tokens":98,"cost":0.00005512,"is_byok":false,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0,"video_tokens":0},"cost_details":{"upstream_inference_cost":null,"upstream_inference_prompt_cost":0.00000261,"upstream_inference_completions_cost":0.00005251},"completion_tokens_details":{"reasoning_tokens":82,"image_tokens":0}}}
```

---

```typescript
// Show Hero text
await Hero();

const _DB = new DB(DB_FILE_NAME);
// Check project initialization
if (!_DB.exists()) {
  render(Log({ tag: "warning", text: "This directory isn't used before." }));

  // Start initialization process
  render(
    Log({
      tag: "system",
      text: "In order to save your settings and chat history, I need to initialize a local database.",
    }),
  );

  const initializable = await confirm({
    message: "Don't you mind to make a database for Hack Club AI CLI?",
  });
  if (initializable) {
    Paragraph({
      tag: "info",
      text: "Great! Initializing...",
    });
  } else {
    Paragraph({
      tag: "system",
      text: "Initialization rejected. Exiting...",
    });
    process.exit(0);
  }
}

// Connect to the database
_DB.connect();

// Then, check if there is `HACK_CLUB_AI_API_KEY` in the environment variables
const apiKey = process.env[API_ENVIRONMENT_VARIABLE_KEY];
if (!apiKey) {
  Paragraph({
    tag: "warning",
    text: `You don't have your Hack Club AI API key set in the environment variables.`,
  });
  Paragraph({
    tag: "warning",
    text: `Please visit https://ai.hackclub.com/dashboard to get your API key and set it in the environment variable named ${API_ENVIRONMENT_VARIABLE_KEY}.`,
  });
  Paragraph({
    tag: "info",
    text: `After setting the environment variable, please restart the application.`,
  });
  process.exit(0);
}
```
