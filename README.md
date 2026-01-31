# Hack Club AI CLI

A terminal-based chat interface for Hack Club AI API. Built with [Bun](https://bun.sh), [Ink](https://github.com/vadimdemedes/ink), and React.

## Features

- 💬 **Interactive Chat**: Real-time streaming chat with AI models
- 🎨 **Beautiful UI**: Colorful terminal interface with rainbow gradient hero
- 📝 **Multiple Models**: Support for various AI models via Hack Club AI API
- 🖼️ **Image Generation**: Generate images using Gemini models
- 💾 **Chat History**: Save and restore conversations
- ⚡ **Fast**: Built with Bun for maximum performance

## Prerequisites

- [Bun](https://bun.sh) v1.0.0 or later
- A Hack Club AI API key (get one from [ai.hackclub.com/dashboard](https://ai.hackclub.com/dashboard))

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hackclubaicli.git
cd hackclubaicli

# Install dependencies
bun install
```

## Setup

Set your Hack Club AI API key as an environment variable:

```bash
export HACK_CLUB_AI_API=your_api_key_here
```

Or create a `.env` file in the project root:

```
HACK_CLUB_AI_API=your_api_key_here
```

## Usage

```bash
# Start the CLI
bun run start

# Or run directly
bun run index.tsx
```

### Commands

| Command      | Description                 |
| ------------ | --------------------------- |
| `/chats`     | Manage saved conversations  |
| `/chats new` | Start a new conversation    |
| `/models`    | Switch AI model             |
| `/stats`     | View token usage statistics |
| `/help`      | Toggle help display         |
| `/clear`     | Clear current conversation  |
| `/quit`      | Exit the CLI                |

### Special Prefixes

| Prefix   | Description                         |
| -------- | ----------------------------------- |
| `@file`  | Attach file content to your message |
| `#image` | Generate an image                   |

### Keyboard Shortcuts

| Key       | Action               |
| --------- | -------------------- |
| `Enter`   | Send message         |
| `Ctrl+U`  | Clear input line     |
| `Ctrl+A`  | Move cursor to start |
| `Ctrl+E`  | Move cursor to end   |
| `←` / `→` | Move cursor          |

## Project Structure

```
.
├── index.tsx              # Entry point
├── src/
│   ├── app/
│   │   ├── app.tsx        # Main App component
│   │   └── components/    # UI components
│   │       ├── chat/      # Chat components
│   │       ├── hero.tsx   # Hero banner
│   │       └── label.tsx  # Label component
│   ├── lib/
│   │   ├── ai/            # AI API integration
│   │   ├── db/            # Database (lowdb)
│   │   ├── util/          # Utilities
│   │   └── log.ts         # Logging
│   ├── types/             # TypeScript types
│   └── config.ts          # Configuration
└── .hackclubaicli/        # Per-project data
    ├── settings.json      # Settings
    └── chats.json         # Chat history
```

## Development

```bash
# Run tests
bun test

# Type check
bunx tsc --noEmit

# Update models list
bun run index.tsx --update
```

## API

This CLI uses the [Hack Club AI API](https://ai.hackclub.com). Available endpoints:

- **Chat Completions**: `/proxy/v1/chat/completions`
- **Responses API**: `/proxy/v1/responses`
- **Models**: `/proxy/v1/models`
- **Stats**: `/proxy/v1/stats`
- **Image Generation**: Via chat completions with `modalities: ["image", "text"]`

## License

MIT

## Credits

Built with ❤️ for [Hack Club](https://hackclub.com)
