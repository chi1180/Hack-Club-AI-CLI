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
    1. --tmp : Temporary chat (no saving)
    1. --tags : Comma-separated tags for the chat
       - [tag tag ...] : Tags to add
  - `list` : List all existing chats
    1. [limit] : Number of chats to list (default: All of them)
    1. [--tags] : Filter by tags (e.g., `--tags work`)
  - `delete` : Delete an existing chat
    1. [title] : Title of the chat to delete (if omitted, shows interactive selector)
  - `search` : Search in local chat history
    1. [query]\* : Query to search in chat messages
  - `export` : Export chat to file
    1. [title] : Title of the chat to export (if omitted, shows interactive selector)
    1. [--format] : Export format: markdown, json, or txt (default: markdown)
    1. [--output] : Output directory path (default: ./exports/)
  - `summarize` : Generate summary of a chat
    1. [title] : Title of the chat to summarize (if omitted, shows interactive selector)
- `/image` : Generate images with AI
  - `generate` : Generate new images
    1. [prompt]\* : Prompt for image generation
    1. [--output] : Local directory to save images (default: none, saves to DB only)
  - `list` : List all generated images
    1. [limit] : Number of images to list (default: All of them)
  - `delete` : Delete an existing image
    1. [image_id image_id ...] : IDs of images to delete (if omitted, shows interactive selector)
  - `analyze` : Analyze an image with AI
    1. [path]\* : Path to the image file
    1. [--prompt] : Additional prompt for analysis (default: "What's in this image?")
- `/search` : Search with AI
  - `web` : Perform a web search
    1. [query]\* : Query to search on the web
- `/model`: Manage AI models
  - `list` : List all available AI models
  - `use` : Set the current AI model (last used model will be loaded on next time)
    1. [model_id]\* : ID of the model to set
  - `add` : Add new AI models
    1. [model_id model_id ...]\* : IDs of model to add
  - `remove` : Remove an existing AI model
    1. [model_id model_id ...]\* : IDs of model to remove
  - `info` : Get information about the AI model
    1. [model_id] : ID of the model to get info (default: current model)
- `/template` : Manage prompt templates
  - `create` : Create a new template
    1. [name]\* : Name for the template
  - `use` : Use an existing template
    1. [name] : Name of the template to use (if omitted, shows interactive selector)
  - `list` : List all templates
  - `delete` : Delete a template
    1. [name] : Name of the template to delete (if omitted, shows interactive selector)
- `/alias` : Manage command aliases
  - `set` : Create a new alias
    1. [alias]\* : Alias name
    1. [command]\* : Command to alias
  - `list` : List all aliases
  - `delete` : Delete an alias
    1. [alias] : Alias to delete (if omitted, shows interactive selector)
- `/stats` : Show usage statistics
  - [--model] : Filter by model ID
  - [--date] : Filter by date (YYYY-MM format)
- `/context` : Context-aware conversation mode
  - `start` : Start context mode (all commands share context)
  - `end` : End context mode
- `/config`: Manage application configuration
  - `show` : Show current configuration and usage statistics
  - `set` : Set a configuration value
    1. [key]\* : Configuration key
    1. [value]\* : Configuration value
  - `get` : Get a configuration value
    1. [key]\* : Configuration key
- `/help`: Show help information about this app
  - [command] : Show help for specific command

---

# Chat message syntax

## File attachment

```bash
> /chat new file-discussion
> [INFO] Started new chat: file-discussion
> Here is my file: [[path/to/file.ext]]
```

## Image generation

```bash
> /image generate "A beautiful sunset over the mountains with vibrant colors and a clear sky"
```

- In a case there are no models which support image generation, the app will ask user to add such models first.
  Show image generatable models checkbox to add.
- If multiple models are available, show model selection to choose one.

## Image generation with output directory

```bash
> /image generate "A beautiful sunset" --output ./my-images/
> [INFO] Image saved to DB and ./my-images/image-abc123.png
```

## Image analysis

```bash
> /image analyze [[./screenshot.png]]
> [INFO] Analyzing image...
> This image shows a user interface with...

> /image analyze [[./photo.jpg]] --prompt "Identify the objects in this image"
```

## Web search

```bash
> /search web "What is the capital of France?"
```

## Using templates

```bash
> /template create code-review
> Enter template content:
> Review this code and suggest improvements:
> [[code]]
> Focus on: performance, readability, security
> [INFO] Template 'code-review' created

> /template use code-review
> [INFO] Template loaded. Enter value for [[code]]:
> function example() { ... }
```

## Using aliases

```bash
> /alias set c "/chat continue"
> [INFO] Alias 'c' created for '/chat continue'

> c file-discussion
> [INFO] Continuing chat: file-discussion
```

## Context mode

```bash
> /context start
> [INFO] Context mode enabled. All commands will share context.
> Tell me about TypeScript
> [AI responds about TypeScript]
> Now explain generics
> [AI responds about generics, considering previous TypeScript context]
> /context end
> [INFO] Context mode disabled
```

---

# Interactive selections

When a command parameter is optional and omitted, the app shows an interactive selector:

```bash
> /chat continue
? Select a chat to continue:
  ❯ file-discussion (2024-12-26, tags: work, api)
    project-planning (2024-12-25, tags: personal)
    debug-session (2024-12-24)

> /image delete
? Select images to delete: (Space to select, Enter to confirm)
  ◉ sunset-mountains (abc-123) - 2024-12-26
  ◯ city-night (def-456) - 2024-12-25
  ◉ forest-scene (ghi-789) - 2024-12-24
```

---

# DB tables

## Config properties

- models : string[]
- currentModel : string
- totalChats : number (renamed from threads)
- totalRequests : number
- totalTokens : number
- totalPromptTokens : number
- totalCompletionTokens : number
- imageOutputDir : string | null
- autoSave : boolean
- contextMode : boolean

## Chats

- id : string (UUID) // made by this app
- title : string
- tags : string[] // array of tags
- summary : string | null // auto-generated summary
- messageCount : number
- tokenCount : number
- isFavorite : boolean
- isArchived : boolean
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
    id: "msg_abc123", // necessary extended message id from AI provider
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

## Images

- id : string (UUID) // made by this app
- model : string
- prompt : string
- content : string // response message from AI
- images : string[] // array of image urls(base64 encoded image)
- localPaths : string[] | null // array of local file paths if saved with --output
- createdAt : datetime

## Templates

- id : string (UUID)
- name : string
- content : string // template content with variables like [[code]], [[file]]
- variables : string[] // extracted variable names from content
- usageCount : number
- createdAt : datetime
- updatedAt : datetime

## Aliases

- alias : string // alias name (primary key)
- command : string // full command to execute
- createdAt : datetime

## Context

- id : string (UUID)
- isActive : boolean
- messages : array // shared context messages
- startedAt : datetime
- endedAt : datetime | null

---

# Configuration keys

Available configuration keys for `/config set`:

- `default-model` : Default AI model ID (e.g., "qwen/qwen3-32b")
- `auto-save` : Auto-save chats (true/false)
- `image-output-dir` : Default directory for saving generated images
- `context-mode` : Enable/disable context mode (true/false)

---

# Statistics output format

```bash
> /stats
┌─────────────────────────────────────┐
│ Usage Statistics                    │
├─────────────────────────────────────┤
│ Total Chats: 42                     │
│ Total Images: 15                    │
│ Total Requests: 127                 │
│ Total Tokens: 45,230                │
│ Prompt Tokens: 30,150               │
│ Completion Tokens: 15,080           │
│ Current Model: qwen/qwen3-32b       │
│ Average Chat Length: 8 messages     │
│ Context Mode: Disabled              │
└─────────────────────────────────────┘
```

---

# Error handling

- When required parameters are missing, show error message and prompt for interactive input
- When API rate limit is hit, display the error message from provider
- When file attachment fails, show clear error with file path and reason
- When database operations fail, show error and suggest `/config show` to check status
