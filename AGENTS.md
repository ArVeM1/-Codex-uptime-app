# Repository Guidelines

## Project Structure

This uptime-monitoring repository has two independent applications:

- `frontend/` contains the web client. Its local instructions are in `frontend/AGENTS.md`.
- `backend/` contains the Python service. Its local instructions are in `backend/AGENTS.md`.

Work from the relevant project directory when running project-specific commands. Keep changes scoped to the application they affect; coordinate interface changes that cross the frontend/backend boundary.

## Commit & Pull Request Guidelines

No Git history is available in this checkout, so no existing commit convention can be inferred. Use concise, imperative commit subjects, such as `Add monitor status entity`. Keep commits scoped. Pull requests should state the purpose, summarize implementation and validation commands, link relevant issues, and include screenshots for visible frontend changes. Never commit secrets; use local environment files for credentials and document required variable names.


## Коммиты

- Формат: Conventional Commits (feat, fix, refactor, test, docs, chore)
- Заголовок до 72 символов, в повелительном наклонении
- Без эмодзи, без "significantly improved" и прочей воды
- Тело - только если нужно объяснить "почему", а не "что"
- Один логический шаг - один комит
