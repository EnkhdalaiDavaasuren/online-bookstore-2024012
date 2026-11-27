# online-bookstore-2024012

## Run locally

```sh
npm ci
npm run db:migrate:local
npm run db:seed:local
npm run build
npm run dev
```

Open `http://localhost:8787/` to browse the catalog. `/api/health` checks the local D1 binding.

Run `npm run generate-types` after changing Worker bindings. Run `npm run typecheck` and `npm test` to verify the Worker and React UI. The [lab tracker](docs/llm-wiki/wiki/lab-progress.md) links to the browser and SQL evidence.
