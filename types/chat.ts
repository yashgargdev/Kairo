export type ThinkingStepType =
  | 'thinking'
  | 'planning'
  | 'searching'
  | 'analyzing'
  | 'generating_image'
  | 'creating_diagram'
  | 'writing_notes'
  | 'designing'
  | 'researching'
  | 'reasoning'

export interface ThinkingStep {
  id: string
  type: ThinkingStepType
  label: string
  detail?: string
  content?: string   // full raw text (e.g. from <think> block)
  status: 'active' | 'done'
}

export type ToolType = 'image' | 'diagram' | 'note' | 'code'

export interface ToolResult {
  id: string
  type: ToolType
  title: string
  // Image
  imageUrl?: string
  imagePrompt?: string
  // Diagram
  mermaidCode?: string
  diagramType?: string
  // Note
  noteContent?: string
  // Code
  code?: string
  language?: string
}

export interface MessageImage {
  mimeType: string   // e.g. 'image/jpeg'
  data: string       // base64 (no data:... prefix)
  name: string
}

export interface FileAttachment {
  name: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: MessageImage[]
  fileAttachments?: FileAttachment[]  // text/doc files shown as pills, content not displayed
  thinking?: ThinkingStep[]
  toolResults?: ToolResult[]
  timestamp: Date
  model?: string
  isStreaming?: boolean
  isThinking?: boolean
  thinkingDuration?: number // seconds
  // API key / error state
  noKey?: boolean
  noKeyProvider?: string
  errorMessage?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  model: string
}
