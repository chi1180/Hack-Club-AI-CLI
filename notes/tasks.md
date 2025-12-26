# Tasks

## Architecture (Completed ✅)

- [x] Refactor page.tsx to use state machine pattern
- [x] Separate InitFlow into dedicated component
- [x] Create AppContext for global state management
- [x] Create Router component for screen navigation
- [x] Fix DB initialization SQL

---

## Screens

### MainScreen

- [x] Basic command input with useInput
- [x] Command parsing (command, subCommand, args, flags)
- [x] Navigation to other screens
- [ ] Command history (up/down arrow navigation)
- [ ] Auto-complete suggestions
- [ ] Alias resolution

### HelpScreen

- [x] Basic screen (list of all commands)
- [x] Detailed screen (`/help [command]`)
- [x] Key navigation (Enter/Escape/q to go back)
- [ ] Scrollable content for long help text
- [ ] Search within help

### ChatScreen

- [ ] New chat creation (`/chat new [title]`)
- [ ] Chat list view (`/chat list`)
- [ ] Chat continuation (select from list)
- [ ] Message input and display
- [ ] File attachment syntax (`[[path/to/file]]`)
- [ ] Streaming response display
- [ ] Chat deletion (`/chat delete`)
- [ ] Chat search (`/chat search [query]`)
- [ ] Chat export (`/chat export`)
- [ ] Chat summarize (`/chat summarize`)
- [ ] Tags support (`--tags`)
- [ ] Temporary chat (`--tmp`)

### ImageScreen

- [ ] Image generation (`/image generate [prompt]`)
- [ ] Image list view (`/image list`)
- [ ] Image deletion (`/image delete`)
- [ ] Image analysis (`/image analyze [[path]]`)
- [ ] Output directory option (`--output`)
- [ ] Model selection for image generation

### SearchScreen

- [ ] Web search (`/search web [query]`)
- [ ] Display search results
- [ ] Open links in browser

### ModelScreen

- [ ] List available models (`/model list`)
- [ ] Set current model (`/model use [model_id]`)
- [ ] Add new models (`/model add`)
- [ ] Remove models (`/model remove`)
- [ ] Model info display (`/model info`)

### TemplateScreen

- [ ] Create template (`/template create [name]`)
- [ ] Use template (`/template use [name]`)
- [ ] List templates (`/template list`)
- [ ] Delete template (`/template delete`)
- [ ] Variable extraction from template content

### AliasScreen

- [ ] Set alias (`/alias set [alias] [command]`)
- [ ] List aliases (`/alias list`)
- [ ] Delete alias (`/alias delete`)

### StatsScreen

- [ ] Display usage statistics
- [ ] Filter by model (`--model`)
- [ ] Filter by date (`--date`)
- [ ] Table/box formatting

### ConfigScreen

- [ ] Show current config (`/config show`)
- [ ] Set config value (`/config set [key] [value]`)
- [ ] Get config value (`/config get [key]`)

### ContextScreen

- [ ] Start context mode (`/context start`)
- [ ] End context mode (`/context end`)
- [ ] Context indicator in MainScreen

---

## Components

### Interactive Selectors

- [ ] Single select component (for chat/template selection)
- [ ] Multi select component (for image deletion)
- [ ] Fuzzy search filter

### Input Components

- [ ] Text input with history
- [ ] Multi-line text input (for template content)
- [ ] Password input (for API key)

### Display Components

- [ ] Scrollable box
- [ ] Table component
- [ ] Progress indicator
- [ ] Markdown renderer

---

## Database

- [x] Config table
- [x] Chats table
- [x] Threads table
- [x] Images table
- [x] Templates table
- [x] Aliases table
- [x] Context table
- [ ] Migrations system (for future schema changes)

---

## AI Integration

- [ ] OpenRouter API client
- [ ] Streaming response handling
- [ ] Token counting
- [ ] Rate limit handling
- [ ] Multiple model support
- [ ] Image generation API
- [ ] Web search API

---

## Configuration

- [ ] API key management (environment variable)
- [ ] Default model setting
- [ ] Auto-save toggle
- [ ] Image output directory
- [ ] Context mode persistence

---

## Error Handling

- [ ] API error display
- [ ] Network error recovery
- [ ] Invalid command feedback
- [ ] File not found handling
- [ ] Permission error handling

---

## Testing

- [ ] Unit tests for command parser
- [ ] Unit tests for DB operations
- [ ] Integration tests for flows
- [ ] E2E tests with mock API

---

## Documentation

- [ ] README.md with installation instructions
- [ ] Usage examples
- [ ] Configuration guide
- [ ] API key setup guide
