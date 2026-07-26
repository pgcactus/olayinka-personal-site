# Olayinka Titilola — personal site

Personal website for [olayinka.xyz](https://olayinka.xyz), built with React,
TypeScript, Vite and Express.

## Local development

Requirements:

- Node.js 22 or newer
- pnpm 10.4.1

```bash
pnpm install
pnpm dev
```

## Verification

```bash
pnpm lint
pnpm check
pnpm test
pnpm build
pnpm test:build
pnpm audit --prod --audit-level high
```

`pnpm build` creates the client in `dist/public` and the production server at
`dist/index.js`. `pnpm test:build` checks the generated HTML, production routes,
404 responses and security headers.

## Production

```bash
pnpm build
pnpm start
```

The server reads `PORT` from the environment. Analytics are optional; copy
`.env.example` to `.env` and set both values to enable the analytics script.

## Deployment

This repository has no hosting-provider configuration or GitHub deployment
workflow. The current host must be connected separately to this repository.

Before releasing:

1. Run the verification commands above.
2. Commit the changes and push `main` to GitHub.
3. If the host watches `main`, wait for its build to complete. Otherwise,
   trigger a deployment in the hosting provider.
4. Confirm that `/`, `/nato`, `/things/books`, `/things/vinyls`,
   `/things/places` and an invalid URL behave correctly on `olayinka.xyz`.
