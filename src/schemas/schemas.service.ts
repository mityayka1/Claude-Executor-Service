import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SchemaInfoDto } from '../common/dto/schema.dto';
import {
  ExecutorException,
  ExecutorErrorCode,
} from '../common/exceptions/executor.exception';
import { ExecutorConfig } from '../config/configuration';

interface SchemaMetadata {
  name: string;
  description?: string;
  schema: object;
}

@Injectable()
export class SchemasService implements OnModuleInit {
  private readonly logger = new Logger(SchemasService.name);
  private readonly schemasPath: string;
  private schemasCache: Map<string, SchemaMetadata> = new Map();

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<ExecutorConfig>('executor');
    this.schemasPath = path.join(config.paths.workspacePath, 'schemas');
  }

  async onModuleInit() {
    await this.loadSchemas();
  }

  async loadSchemas(): Promise<void> {
    try {
      const files = await fs.readdir(this.schemasPath);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      for (const file of jsonFiles) {
        const filePath = path.join(this.schemasPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const schema = JSON.parse(content);

        const name = file.replace('-schema.json', '').replace('.json', '');
        this.schemasCache.set(name, {
          name,
          description: schema.description || schema.title,
          schema,
        });

        this.logger.debug(`Loaded schema: ${name}`);
      }

      this.logger.log(`Loaded ${this.schemasCache.size} schemas`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`Schemas directory not found: ${this.schemasPath}`);
        return;
      }
      this.logger.error(`Failed to load schemas: ${error.message}`);
    }
  }

  async listSchemas(): Promise<SchemaInfoDto[]> {
    return Array.from(this.schemasCache.entries()).map(([name, metadata]) => ({
      name,
      path: `schemas/${name}-schema.json`,
      description: metadata.description,
    }));
  }

  async getSchema(name: string): Promise<object> {
    const metadata = this.schemasCache.get(name);
    if (!metadata) {
      throw new ExecutorException(
        ExecutorErrorCode.SCHEMA_NOT_FOUND,
        `Schema not found: ${name}`,
      );
    }
    return metadata.schema;
  }

  async reloadSchemas(): Promise<void> {
    this.schemasCache.clear();
    await this.loadSchemas();
  }
}
