# Claude Executor Service

Независимый микросервис, предоставляющий HTTP API для выполнения AI-задач через Claude CLI в изолированной рабочей среде (claude-workspace).

**Основная ценность:** Абстракция сложности вызова Claude CLI в простой контракт "запрос → структурированный результат" с гарантированной валидностью JSON-ответа.

## Возможности

- REST API для выполнения AI-задач
- Structured output с гарантированным JSON по схеме
- Workspace Management: Agents, Skills, Hooks, Commands
- Логирование всех вызовов с метриками
- Retry логика с exponential backoff
- Статистика и аналитика

## API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/v1/execute` | POST | Выполнить AI-задачу |
| `/api/v1/schemas` | GET | Список доступных схем |
| `/api/v1/schemas/:name` | GET | Получить схему по имени |
| `/api/v1/stats` | GET | Статистика выполнений |

## Установка

```bash
npm install
```

## Конфигурация

Скопируйте `.env.example` в `.env` и настройте переменные окружения:

```bash
cp .env.example .env
```

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервиса | 3000 |
| `CLAUDE_CLI_PATH` | Путь к Claude CLI | claude |
| `CLAUDE_WORKSPACE_PATH` | Путь к workspace | ./claude-workspace |
| `CLAUDE_DEFAULT_MODEL` | Модель по умолчанию | sonnet |
| `CLAUDE_DEFAULT_TIMEOUT` | Таймаут в мс | 120000 |
| `DATABASE_HOST` | Хост PostgreSQL | localhost |
| `DATABASE_PORT` | Порт PostgreSQL | 5432 |
| `DATABASE_USERNAME` | Пользователь БД | postgres |
| `DATABASE_PASSWORD` | Пароль БД | postgres |
| `DATABASE_NAME` | Имя БД | claude_executor |

## Запуск

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## Пример использования

```bash
curl -X POST http://localhost:3000/api/v1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "fact_extraction",
    "prompt": "Extract facts from: Иван работает техническим директором в Acme Corp",
    "schema": {
      "type": "object",
      "properties": {
        "facts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "factType": { "type": "string" },
              "value": { "type": "string" }
            }
          }
        }
      }
    },
    "model": "haiku"
  }'
```

## Структура проекта

```
src/
├── common/           # Общие компоненты (DTO, exceptions, interfaces)
├── config/           # Конфигурация
├── database/         # Entities
├── executor/         # Основной модуль выполнения
├── schemas/          # Управление JSON Schema
└── stats/            # Статистика

claude-workspace/
├── CLAUDE.md         # Глобальные инструкции
├── .claude/
│   ├── settings.json # Конфигурация
│   ├── agents/       # Субагенты
│   ├── skills/       # Skills
│   └── commands/     # Slash-команды
└── schemas/          # JSON Schema файлы
```

## Лицензия

MIT
