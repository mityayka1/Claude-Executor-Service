export class UsageDto {
  inputTokens: number;
  outputTokens: number;
}

export class ExecuteSuccessResponseDto<T = unknown> {
  success: true;
  data: T;
  runId: string;
  sessionId: string;
  durationMs: number;
  usage: UsageDto;
  costUsd: number;
}

export class ErrorDetailsDto {
  code: string;
  message: string;
  retriable: boolean;
}

export class ExecuteErrorResponseDto {
  success: false;
  error: ErrorDetailsDto;
  runId?: string;
  durationMs: number;
}

export type ExecuteResponseDto<T = unknown> =
  | ExecuteSuccessResponseDto<T>
  | ExecuteErrorResponseDto;
