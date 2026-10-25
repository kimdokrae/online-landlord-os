<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Online Landlord template boundaries

- This is an existing Next.js / React / Three.js local template. Read README.md first.
- Preserve stable assetId, plotId, employeeId, menuId and existing localStorage schemas/keys.
- Never reset or replace a user's saved workspace to apply new demo defaults.
- local-template and public-demo are server execution modes. A browser setting grants no server permissions.
- Keep public-demo fictional; personal CSV/manual data is browser-local. No live AI execution is implemented.
- Do not read credential files or connect Neon, n8n, Slack or other operational services without a separate request.
- Do not include private backups, reference projects, environment files or local data in release archives.
- Project code is MIT, Copyright (c) 2026 kimdokrae, approved by the owner. Preserve LICENSE and third-party notices. Licensing changes require approval.
- Exclude unverified legacy artwork from release ZIPs; preserve the owner's original files. Never treat the code license as asset redistribution permission.
- Before changes, preserve source and export private browser backups. Check npm test, npm run typecheck, the relevant Playwright suites and npm run build:local when requested.
- Use npm run dev:local for the beginner template (127.0.0.1:3003); npm run dev retains the older demo on 3000.
