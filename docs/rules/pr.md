# PR instructions

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
