import { HttpException, HttpStatus } from '@nestjs/common';

export enum ExecutorErrorCode {
  CLI_NOT_FOUND = 'CLI_NOT_FOUND',
  CLI_TIMEOUT = 'CLI_TIMEOUT',
  CLI_ERROR = 'CLI_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  SCHEMA_INVALID = 'SCHEMA_INVALID',
  PROMPT_TOO_LONG = 'PROMPT_TOO_LONG',
  RATE_LIMIT = 'RATE_LIMIT',
  MODEL_ERROR = 'MODEL_ERROR',
  WORKSPACE_ERROR = 'WORKSPACE_ERROR',
  SCHEMA_NOT_FOUND = 'SCHEMA_NOT_FOUND',
}

export const ERROR_HTTP_STATUS: Record<ExecutorErrorCode, HttpStatus> = {
  [ExecutorErrorCode.CLI_NOT_FOUND]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ExecutorErrorCode.CLI_TIMEOUT]: HttpStatus.GATEWAY_TIMEOUT,
  [ExecutorErrorCode.CLI_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ExecutorErrorCode.PARSE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ExecutorErrorCode.SCHEMA_INVALID]: HttpStatus.BAD_REQUEST,
  [ExecutorErrorCode.PROMPT_TOO_LONG]: HttpStatus.BAD_REQUEST,
  [ExecutorErrorCode.RATE_LIMIT]: HttpStatus.TOO_MANY_REQUESTS,
  [ExecutorErrorCode.MODEL_ERROR]: HttpStatus.BAD_GATEWAY,
  [ExecutorErrorCode.WORKSPACE_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ExecutorErrorCode.SCHEMA_NOT_FOUND]: HttpStatus.NOT_FOUND,
};

export const RETRIABLE_ERRORS: ExecutorErrorCode[] = [
  ExecutorErrorCode.CLI_TIMEOUT,
  ExecutorErrorCode.CLI_ERROR,
  ExecutorErrorCode.RATE_LIMIT,
  ExecutorErrorCode.MODEL_ERROR,
];

export class ExecutorException extends HttpException {
  constructor(
    public readonly code: ExecutorErrorCode,
    message: string,
    public readonly runId?: string,
    public readonly durationMs?: number,
  ) {
    super(
      {
        success: false,
        error: {
          code,
          message,
          retriable: RETRIABLE_ERRORS.includes(code),
        },
        runId,
        durationMs,
      },
      ERROR_HTTP_STATUS[code],
    );
  }

  isRetriable(): boolean {
    return RETRIABLE_ERRORS.includes(this.code);
  }
}
