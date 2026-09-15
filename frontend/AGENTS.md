<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Frontend Guidelines

The frontend is a Next.js 16 App Router application. Route files and shared layout code live in `src/app/`; put browser-served assets in `public/`.

Run commands from `frontend/`:

```powershell
npm install       # install dependencies from package-lock.json
npm run dev       # start the local development server
npm run lint      # check ESLint and Next.js rules
npm run build     # create a production build
```

Write TypeScript and follow the formatting in nearby files. Use `PascalCase` for React components and `camelCase` for functions and variables. Follow App Router filenames such as `page.tsx` and `layout.tsx`, and use Tailwind utility classes for styling. This project has no frontend test runner yet; run `npm run lint` and `npm run build` for UI or configuration changes.
