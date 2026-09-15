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

## Pull Request Workflow

Use this workflow for every change that is intended to reach `main`:

1. Start from the current base branch and verify that the working tree is clean:
   ```powershell
   git status --short --branch
   git switch main
   git pull --ff-only origin main
   ```
2. Create a task branch before editing files. Use a lowercase Latin name with a Conventional Commit type and a transliterated feature name, for example `feat/add-monitor-alerts`, `fix/handle-timeout`, or `docs/update-pr-process`.
3. Keep the change scoped to one logical task. Inspect the final diff and run the validation commands for every affected application before committing.
4. Commit with a Conventional Commit subject no longer than 72 characters, for example `docs: document pull request workflow`. Use an explanatory body only when the reason is not clear from the diff.
5. Push the branch and set its upstream:
   ```powershell
   git push --set-upstream origin <task-branch>
   ```
6. Open a pull request into `main`. The title must follow Conventional Commits and may use Russian, for example `docs: описать процесс pull request`. Write the entire pull request description in Russian.

Every pull request description must contain:

- `Краткое описание`: что изменено и зачем;
- `Изменения`: важные файлы, поведение или обновления документации;
- `Проверка`: точные команды и их результаты;
- `Риски или дальнейшие действия`: известные ограничения, миграции и изменения конфигурации либо `Нет`;
- `Скриншоты`: скриншоты для видимых изменений frontend либо `Не применимо`;
- ссылка на issue, если она существует.

Use this body template:

```markdown
## Краткое описание

<!-- Опишите цель изменения. -->

## Изменения

-

## Проверка

- `команда` — результат

## Риски или дальнейшие действия

Нет.

## Скриншоты

Не применимо.
```

Create the PR with the repository's configured GitHub tooling, for example:

```powershell
gh pr create --base main --head <task-branch> --title "<conventional-title>" --body-file <pr-description.md>
```

Do not merge the pull request automatically unless the user explicitly asks for merging. Before handing it off, report the PR URL, source and target branches, commit(s), validation results, and any remaining reviewer action.
