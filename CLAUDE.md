# CLAUDE.md

@AGENTS.md

## Stack

- Next.js 16, React 19, Tailwind CSS 4, TypeScript 5
- DB: PostgreSQL via `pg`. Migrations: plain `.sql` in `db/migrations/`, run via `npm run db:migrate`.

## Workflow

After any code edit:
1. Run dev → fix errors → kill dev.
2. Run `npm run build` → fix errors → repeat from 1.
3. Build passes = done.

- After adding a migration → `npm run db:migrate`. Never edit applied migrations.
