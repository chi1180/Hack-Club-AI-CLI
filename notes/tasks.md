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
- [ ] 35. Command history (up/down arrow navigation)
- [ ] 36. Auto-complete suggestions
- [ ] 37. Alias resolution

### HelpScreen

- [x] Basic screen (list of all commands)
- [x] Detailed screen (`/help [command]`)
- [x] Key navigation (Enter/Escape/q to go back)
- [ ] 38. Scrollable content for long help text
- [ ] 39. Search within help

### ChatScreen

- [ ] 8. New chat creation (`/chat new [title]`)
- [ ] 9. Chat list view (`/chat list`)
- [ ] 10. Chat continuation (select from list)
- [ ] 11. Message input and display
- [ ] 12. File attachment syntax (`[[path/to/file]]`)
- [ ] 13. Streaming response display
- [ ] 40. Chat deletion (`/chat delete`)
- [ ] 41. Chat search (`/chat search [query]`)
- [ ] 42. Chat export (`/chat export`)
- [ ] 43. Chat summarize (`/chat summarize`)
- [ ] 44. Tags support (`--tags`)
- [ ] 45. Temporary chat (`--tmp`)

### ImageScreen

- [ ] 46. Image generation (`/image generate [prompt]`)
- [ ] 47. Image list view (`/image list`)
- [ ] 48. Image deletion (`/image delete`)
- [ ] 49. Image analysis (`/image analyze [[path]]`)
- [ ] 50. Output directory option (`--output`)
- [ ] 51. Model selection for image generation

### SearchScreen

- [ ] 52. Web search (`/search web [query]`)
- [ ] 53. Display search results
- [ ] 54. Open links in browser

### ModelScreen

- [ ] 22. List available models (`/model list`)
- [ ] 23. Set current model (`/model use [model_id]`)
- [ ] 24. Add new models (`/model add`)
- [ ] 25. Remove models (`/model remove`)
- [ ] 26. Model info display (`/model info`)

### TemplateScreen

- [ ] 55. Create template (`/template create [name]`)
- [ ] 56. Use template (`/template use [name]`)
- [ ] 57. List templates (`/template list`)
- [ ] 58. Delete template (`/template delete`)
- [ ] 59. Variable extraction from template content

### AliasScreen

- [ ] 60. Set alias (`/alias set [alias] [command]`)
- [ ] 61. List aliases (`/alias list`)
- [ ] 62. Delete alias (`/alias delete`)

### StatsScreen

- [ ] 63. Display usage statistics
- [ ] 64. Filter by model (`--model`)
- [ ] 65. Filter by date (`--date`)
- [ ] 66. Table/box formatting

### ConfigScreen

- [ ] 27. Show current config (`/config show`)
- [ ] 28. Set config value (`/config set [key] [value]`)
- [ ] 29. Get config value (`/config get [key]`)

### ContextScreen

- [ ] 67. Start context mode (`/context start`)
- [ ] 68. End context mode (`/context end`)
- [ ] 69. Context indicator in MainScreen

---

## Components

### Interactive Selectors

- [ ] 19. Single select component (for chat/template selection)
- [ ] 70. Multi select component (for image deletion)
- [ ] 71. Fuzzy search filter

### Input Components

- [ ] 20. Text input with history
- [ ] 72. Multi-line text input (for template content)
- [ ] 30. Password input (for API key)

### Display Components

- [ ] 73. Scrollable box
- [ ] 74. Table component
- [ ] 75. Progress indicator
- [ ] 76. Markdown renderer

---

## Database

### Tables (Completed ✅)

- [x] Config table
- [x] Chats table
- [x] Threads table
- [x] Images table
- [x] Templates table
- [x] Aliases table
- [x] Context table

### CRUD Methods

- [x] Config methods (getConfig, setConfig, getAllConfig)
- [x] Chat methods (createChat, getChat, getChatByTitle, listChats, deleteChat)
- [x] Thread methods (getThread, updateThreadMessages)
- [ ] 1. Image methods (createImage, getImage, listImages, deleteImage)
- [ ] 2. Template methods (createTemplate, getTemplate, getTemplateByName, listTemplates, updateTemplate, deleteTemplate)
- [ ] 3. Alias methods (createAlias, getAlias, listAliases, deleteAlias)
- [ ] 4. Context methods (createContext, getActiveContext, updateContext, endContext)

### Migrations

- [ ] 77. Migrations system (for future schema changes)

---

## AI Integration

- [ ] 5. OpenRouter API client
- [ ] 6. Streaming response handling
- [ ] 7. Token counting
- [ ] 14. Rate limit handling
- [ ] 15. Multiple model support
- [ ] 78. Image generation API
- [ ] 79. Web search API

---

## Configuration

- [ ] 80. API key management (environment variable)
- [ ] 81. Default model setting
- [ ] 82. Auto-save toggle
- [ ] 83. Image output directory
- [ ] 84. Context mode persistence

---

## Error Handling

- [ ] 16. API error display
- [ ] 17. Network error recovery
- [ ] 18. Invalid command feedback
- [ ] 85. File not found handling
- [ ] 86. Permission error handling

---

## Testing

- [ ] 87. Unit tests for command parser
- [ ] 88. Unit tests for DB operations
- [ ] 89. Integration tests for flows
- [ ] 90. E2E tests with mock API

---

## Documentation

- [ ] 31. README.md with installation instructions
- [ ] 32. Usage examples
- [ ] 33. Configuration guide
- [ ] 34. API key setup guide

---

## Implementation Order Summary

| Priority    | Range | Category            | Description                                    |
| ----------- | ----- | ------------------- | ---------------------------------------------- |
| 🔴 Critical | 1-7   | DB + AI Core        | DB CRUD methods + OpenRouter client            |
| 🟠 High     | 8-18  | Chat + Errors       | ChatScreen core + basic error handling         |
| 🟡 Medium   | 19-30 | Components + Config | Selectors, inputs, config, model screens       |
| 🟢 Standard | 31-45 | Docs + Chat Extras  | Documentation + advanced chat features         |
| 🔵 Later    | 46-69 | Other Screens       | Image, Search, Template, Alias, Stats, Context |
| ⚪ Optional | 70-90 | Polish              | Advanced components, migrations, testing       |
