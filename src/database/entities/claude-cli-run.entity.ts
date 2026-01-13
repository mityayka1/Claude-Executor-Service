import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('claude_cli_runs')
export class ClaudeCliRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_type', type: 'varchar', length: 50 })
  taskType: string;

  @Column({ type: 'varchar', length: 50 })
  model: string;

  @Column({ name: 'agent_name', type: 'varchar', length: 50, nullable: true })
  agentName: string | null;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string | null;

  @Column({ name: 'tokens_in', type: 'int', nullable: true })
  tokensIn: number | null;

  @Column({ name: 'tokens_out', type: 'int', nullable: true })
  tokensOut: number | null;

  @Column({
    name: 'cost_usd',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  costUsd: number | null;

  @Column({ name: 'duration_ms', type: 'int' })
  durationMs: number;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ name: 'error_code', type: 'varchar', length: 50, nullable: true })
  errorCode: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({
    name: 'reference_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  @Index()
  referenceId: string | null;

  @Column({ name: 'input_preview', type: 'text', nullable: true })
  inputPreview: string | null;

  @Column({ name: 'output_preview', type: 'text', nullable: true })
  outputPreview: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_date', type: 'date' })
  @Index()
  createdDate: Date;
}
