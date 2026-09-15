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


## GitHub Flow

Follow GitHub Flow for every task:

- Before starting work, create a separate branch from the current base branch. Do not make task changes directly on the base branch.
- Name the branch with the change type and a transliterated feature name: `feat/<nazvanie-fichi>` for new functionality or `fix/<nazvanie-ispravleniya>` for bug fixes. Use lowercase Latin characters, separate words with hyphens, and avoid spaces or Cyrillic characters.
- After completing the task and validating the changes, open a pull request into the base branch and merge the work only through that pull request.
