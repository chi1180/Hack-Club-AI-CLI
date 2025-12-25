# Start

```bash
$ hack-club-ai
 >
 > Type a command here...
```

---

# Command options

The top of command should be start with `/`

- `/chat` : Chat with AI
  - `new` : Start a new chat
    1. [title] : Title for the new chat
    1. [--temporary] : Temporary chat (no saving)
  - `continue` : Continue an existing chat
    1. [title]\* : Title of the chat to continue
  - `list` : List all existing chats
    1. [limit] : Number of chats to list (default: All of them)
  - `delete` : Delete an existing chat
    1. [title]\* : Title of the chat to delete
- `/model`: Manage AI models
  - `list` : List all available AI models
  - `set` : Set the current AI model (last used model will be loaded on next time)
    1. [model_id]\* : ID of the model to set
  - `add` : Add a new AI model
    1. [model_id]\* : ID of the model to add
  - `remove` : Remove an existing AI model
    1. [model_id]\* : ID of the model to remove
  - `info` : Get information about the current AI model
- `/config`: Show application configuration in current directory
- `/help`: Show help information about this app

---

# Chat message syntax

- File attachment

```bash
> Here is my file: [[path/to/file.ext]]
```

---

# DB tables

## Config properties

- models : string[]
- threads : number
- totalRequests : number
- totalTokens : number
- totalPromptTokens : number
- totalCompletionTokens : number

## Chats

- id : string (UUID)
- title : string
- createdAt : datetime
- updatedAt : datetime

## Threads

- id : string (UUID) same as chat id
- messages:

```typescript
[
  {
    type: "message",
    role: "user",
    content: [{ type: "input_text", text: "What is the capital of France?" }],
  },
  {
    type: "message",
    role: "assistant",
    id: "msg_abc123", // necessary
    status: "completed", // necessary
    content: [
      {
        type: "output_text",
        text: "The capital of France is Paris.",
        annotations: [],
      },
    ],
  },
];
```

---

```bash
curl https://ai.hackclub.com/proxy/v1/chat/completions \
-H "Authorization: Bearer sk-hc-v1-f768cf5366404c698ebfba7d477d22d1c0e772e98344415c9223d007633b73f6" \
-H "Content-Type: application/json" \
-d '{"model": "qwen/qwen3-32b", "messages": [{"role": "user", "content": "Hi"}]}'
{"id":"gen-1766560958-qN7Gt3oXln7EEUox2h5N","provider":"Groq","model":"qwen/qwen3-32b","object":"chat.completion","created":1766560958,"choices":[{"logprobs":null,"finish_reason":"stop","native_finish_reason":"stop","index":0,"message":{"role":"assistant","content":"Hello! How can I help you today? 😊","refusal":null,"reasoning":"Okay, the user sent \"Hi\". I need to respond appropriately. Since it's a greeting, I should acknowledge it and ask how I can assist. Maybe something like \"Hello! How can I help you today?\" That should be friendly and open-ended. Let me make sure there's no need for a longer response here. Just keep it simple and welcoming.\n","reasoning_details":[{"format":null,"index":0,"type":"reasoning.text","text":"Okay, the user sent \"Hi\". I need to respond appropriately. Since it's a greeting, I should acknowledge it and ask how I can assist. Maybe something like \"Hello! How can I help you today?\" That should be friendly and open-ended. Let me make sure there's no need for a longer response here. Just keep it simple and welcoming.\n"}]}}],"system_fingerprint":"fp_efa9879028","usage":{"prompt_tokens":9,"completion_tokens":89,"total_tokens":98,"cost":0.00005512,"is_byok":false,"prompt_tokens_details":{"cached_tokens":0,"audio_tokens":0,"video_tokens":0},"cost_details":{"upstream_inference_cost":null,"upstream_inference_prompt_cost":0.00000261,"upstream_inference_completions_cost":0.00005251},"completion_tokens_details":{"reasoning_tokens":82,"image_tokens":0}}}
```
