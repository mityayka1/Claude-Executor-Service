import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExecutorModule } from './executor/executor.module';
import { SchemasModule } from './schemas/schemas.module';
import { StatsModule } from './stats/stats.module';
import { ClaudeCliRun } from './database/entities/claude-cli-run.entity';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const usePostgres = process.env.DATABASE_ENABLED !== 'false';

        if (usePostgres) {
          return {
            type: 'postgres',
            host: configService.get<string>('database.host'),
            port: configService.get<number>('database.port'),
            username: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.database'),
            entities: [ClaudeCliRun],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV === 'development',
          };
        }

        // SQLite in-memory fallback for testing without PostgreSQL
        return {
          type: 'sqlite',
          database: ':memory:',
          entities: [ClaudeCliRun],
          synchronize: true,
          logging: false,
        };
      },
    }),
    ExecutorModule,
    SchemasModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
