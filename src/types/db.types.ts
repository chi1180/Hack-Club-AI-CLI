export interface ConfigRow {
  key: string;
  value: string;
}

export interface ChatRow {
  id: string;
  title: string;
  tags: string; // JSON array
  summary: string | null;
  messageCount: number;
  tokenCount: number;
  isFavorite: number; // SQLite boolean (0 or 1)
  isArchived: number; // SQLite boolean (0 or 1)
  createdAt: string;
  updatedAt: string;
}

export interface ThreadRow {
  id: string;
  messages: string; // JSON array
}

export interface ImageRow {
  id: string;
  model: string;
  prompt: string;
  content: string;
  images: string; // JSON array of base64 encoded images
  localPaths: string | null; // JSON array of local file paths
  createdAt: string;
}

export interface TemplateRow {
  id: string;
  name: string;
  content: string;
  variables: string; // JSON array
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AliasRow {
  alias: string;
  command: string;
  createdAt: string;
}
