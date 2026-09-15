# Backend Guidelines

## Structure

The backend is a Python 3.12+ package. Production code is under `src/uptime/`:

- `domain/` contains business entities, grouped by feature such as `monitors/`, `checks/`, and `incidents/`.
- `application/` contains use cases and orchestration.
- `infrastructure/` contains integrations with external systems.

Keep domain logic independent of infrastructure. Add tests in `tests/`, mirroring the source package path where useful; for example, test monitor entities in `tests/domain/monitors/test_entities.py`.

## Commands

Run commands from `backend/` after installing the project's Python dependencies:

```powershell
pytest            # discover and run tests in tests/
```

## Style and Testing

Use four spaces for indentation and follow the style of nearby modules. Use `snake_case` for modules, functions, variables, and packages; use `PascalCase` for classes. Keep entity modules named `entities.py` and give classes focused, descriptive names such as `Monitor` or `CheckResult`.

The project uses `pytest` with `tests/` as its configured test path. Name files `test_*.py` and tests `test_<behavior>`. Add focused tests with every behavior change, including domain rules and application use cases.
