export interface ExecutorConfig {
  paths: {
    claudeCliPath: string;
    workspacePath: string;
  };
  defaults: {
    model: 'haiku' | 'sonnet' | 'opus';
    timeout: number;
  };
  limits: {
    maxPromptLength: number;
    maxConcurrent: number;
  };
  retry: {
    attempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfig {
  port: number;
  apiKey: string | undefined;
  executor: ExecutorConfig;
  database: DatabaseConfig;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  apiKey: process.env.API_KEY || undefined,
  executor: {
    paths: {
      claudeCliPath: process.env.CLAUDE_CLI_PATH || 'claude',
      workspacePath:
        process.env.CLAUDE_WORKSPACE_PATH ||
        `${process.cwd()}/claude-workspace`,
    },
    defaults: {
      model:
        (process.env.CLAUDE_DEFAULT_MODEL as 'haiku' | 'sonnet' | 'opus') ||
        'sonnet',
      timeout: parseInt(process.env.CLAUDE_DEFAULT_TIMEOUT, 10) || 120000,
    },
    limits: {
      maxPromptLength:
        parseInt(process.env.CLAUDE_MAX_PROMPT_LENGTH, 10) || 50000,
      maxConcurrent: parseInt(process.env.CLAUDE_MAX_CONCURRENT, 10) || 5,
    },
    retry: {
      attempts: parseInt(process.env.CLAUDE_RETRY_ATTEMPTS, 10) || 3,
      delayMs: parseInt(process.env.CLAUDE_RETRY_DELAY_MS, 10) || 1000,
      backoffMultiplier: 2,
    },
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'claude_executor',
  },
});
