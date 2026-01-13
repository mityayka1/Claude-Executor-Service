export interface ClaudeCliCallParams {
  prompt: string;
  schema: object;
  model?: 'haiku' | 'sonnet' | 'opus';
  timeout?: number;
  allowedTools?: string[];
}

export interface ClaudeCliResponse<T = unknown> {
  data: T;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  costUsd: number;
  sessionId: string;
  durationMs: number;
}

export interface ClaudeCliRawResult {
  type: string;
  subtype?: string;
  result?: string;
  structured_output?: unknown;
  session_id?: string;
  total_cost_usd?: number;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ParsedResponse<T = unknown> {
  data: T;
  usage: { inputTokens: number; outputTokens: number };
  costUsd: number;
  sessionId: string;
}
