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
- [ ] 32. Command history (up/down arrow navigation)
- [ ] 33. Auto-complete suggestions
- [ ] 34. Alias resolution

### HelpScreen

- [x] Basic screen (list of all commands)
- [x] Detailed screen (`/help [command]`)
- [x] Key navigation (Enter/Escape/q to go back)
- [ ] 35. Scrollable content for long help text
- [ ] 36. Search within help

### ChatScreen

- [ ] 8. New chat creation (`/chat new [title]`)
- [ ] 9. Chat list view (`/chat list`)
- [ ] 10. Chat continuation (select from list)
- [ ] 11. Message input and display
- [ ] 12. File attachment syntax (`[[path/to/file]]`)
- [ ] 13. Streaming response display
- [ ] 37. Chat deletion (`/chat delete`)
- [ ] 38. Chat search (`/chat search [query]`)
- [ ] 39. Chat export (`/chat export`)
- [ ] 40. Chat summarize (`/chat summarize`)
- [ ] 41. Tags support (`--tags`)
- [ ] 42. Temporary chat (`--tmp`)

### ImageScreen

- [ ] 43. Image generation (`/image generate [prompt]`)
- [ ] 44. Image list view (`/image list`)
- [ ] 45. Image deletion (`/image delete`)
- [ ] 46. Image analysis (`/image analyze [[path]]`)
- [ ] 47. Output directory option (`--output`)
- [ ] 48. Model selection for image generation

### SearchScreen

- [ ] 49. Web search (`/search web [query]`)
- [ ] 50. Display search results
- [ ] 51. Open links in browser

### ModelScreen

- [ ] 19. List available models (`/model list`)
- [ ] 20. Set current model (`/model use [model_id]`)
- [ ] 21. Add new models (`/model add`)
- [ ] 22. Remove models (`/model remove`)
- [ ] 23. Model info display (`/model info`)

### TemplateScreen

- [ ] 52. Create template (`/template create [name]`)
- [ ] 53. Use template (`/template use [name]`)
- [ ] 54. List templates (`/template list`)
- [ ] 55. Delete template (`/template delete`)
- [ ] 56. Variable extraction from template content

### AliasScreen

- [ ] 57. Set alias (`/alias set [alias] [command]`)
- [ ] 58. List aliases (`/alias list`)
- [ ] 59. Delete alias (`/alias delete`)

### StatsScreen

- [ ] 60. Display usage statistics
- [ ] 61. Filter by model (`--model`)
- [ ] 62. Filter by date (`--date`)
- [ ] 63. Table/box formatting

### ConfigScreen

- [ ] 24. Show current config (`/config show`)
- [ ] 25. Set config value (`/config set [key] [value]`)
- [ ] 26. Get config value (`/config get [key]`)

---

## Components

### Interactive Selectors

- [ ] 16. Single select component (for chat/template selection)
- [ ] 64. Multi select component (for image deletion)
- [ ] 65. Fuzzy search filter

### Input Components

- [ ] 17. Text input with history
- [ ] 66. Multi-line text input (for template content)
- [ ] 27. Password input (for API key)

### Display Components

- [ ] 67. Scrollable box
- [ ] 68. Table component
- [ ] 69. Progress indicator
- [ ] 70. Markdown renderer

---

## Database

### Tables (Completed ✅)

- [x] Config table
- [x] Chats table
- [x] Threads table
- [x] Images table
- [x] Templates table
- [x] Aliases table

### CRUD Methods

- [x] Config methods (getConfig, setConfig, getAllConfig)
- [x] Chat methods (createChat, getChat, getChatByTitle, listChats, deleteChat)
- [x] Thread methods (getThread, updateThreadMessages)
- [x] 1. Image methods (createImage, listImages, deleteImage)
- [x] 2. Template methods (createTemplate, getTemplateByName, listTemplates, updateTemplate, deleteTemplate)
- [x] 3. Alias methods (createAlias, getAlias, listAliases, deleteAlias)

### Improvements (from db.ts.review.md)

- [ ] 85. Add error handling to all DB methods (try-catch, error logging, boolean returns) ⚠️ 最重要
- [ ] 86. Add transaction support for multi-query operations (createChat, deleteChat) ⚠️
- [ ] 87. Unify return types (read: data|null, write: boolean, delete: boolean)
- [ ] 88. Handle UNIQUE constraint violations (createAlias, createTemplate - UPSERT or explicit check)
- [ ] 89. Return boolean from delete methods (check `result.changes > 0`)

### Migrations

- [ ] 71. Migrations system (for future schema changes)

---

## AI Integration

- [ ] 4. OpenRouter API client
- [ ] 5. Streaming response handling
- [ ] 6. Token counting
- [ ] 7. Rate limit handling
- [ ] 14. Multiple model support
- [ ] 72. Image generation API
- [ ] 73. Web search API

---

## Configuration

- [ ] 74. API key management (environment variable)
- [ ] 75. Default model setting
- [ ] 76. Auto-save toggle
- [ ] 77. Image output directory

---

## Error Handling

- [ ] 15. API error display
- [ ] 18. Network error recovery
- [ ] 28. Invalid command feedback
- [ ] 78. File not found handling
- [ ] 79. Permission error handling
- [ ] 84. Database operation error handling (SQL query failures) → See #85-89

---

## Testing

- [ ] 80. Unit tests for command parser
- [ ] 81. Unit tests for DB operations
- [ ] 82. Integration tests for flows
- [ ] 83. E2E tests with mock API

---

## Documentation

- [ ] 29. README.md with installation instructions
- [ ] 30. Usage examples
- [ ] 31. Configuration guide
- [ ] API key setup guide

---

## Implementation Order Summary

| Priority    | Range | Category              | Description                                     |
| ----------- | ----- | --------------------- | ----------------------------------------------- |
| 🔴 Critical | 1-7   | DB + AI Core          | DB CRUD methods + OpenRouter client + streaming |
| 🔴 Critical | 85-89 | DB Improvements       | Error handling, transactions, return types      |
| 🟠 High     | 8-18  | Chat + Errors         | ChatScreen core + components + error handling   |
| 🟡 Medium   | 19-31 | Model + Config + Docs | ModelScreen, ConfigScreen, documentation        |
| 🟢 Standard | 32-42 | MainScreen + Chat     | Command history, autocomplete, chat extras      |
| 🔵 Later    | 43-63 | Other Screens         | Image, Search, Template, Alias, Stats           |
| ⚪ Optional | 64-84 | Polish                | Advanced components, migrations, testing        |
