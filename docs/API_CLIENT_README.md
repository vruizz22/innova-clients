# API client (OpenAPI) — generation

We generate a TypeScript API client from the backend OpenAPI spec (`innova-backend-serverless/docs/openapi.json`).

Example (requires `openapi-generator-cli`):

```bash
# install generator (one-time)
npm install @openapitools/openapi-generator-cli -g

# generate client
openapi-generator generate -i https://raw.githubusercontent.com/vruizz22/innova-backend-serverless/main/docs/openapi.json -g typescript-axios -o packages/api-client
```

CI: Add a step in the frontend CI to run client generation before `pnpm build` and commit generated client to the monorepo or publish to an internal package registry.
