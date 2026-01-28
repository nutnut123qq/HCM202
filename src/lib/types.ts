export interface SourceReference {
  title: string;
  chapter?: string;
  startLine: number;
  endLine: number;
  score: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  sources?: SourceReference[];
}

export interface BlackboxChatRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface BlackboxChatResponse {
  id: string;
  created: number;
  model: string;
  object: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}
