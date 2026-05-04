# packages/api-client

This folder is the generated TypeScript API client produced from the backend OpenAPI spec.

CI will attempt to generate the client into this folder using `@openapitools/openapi-generator-cli`.

If you prefer to generate locally:

```bash
# requires openapi-generator-cli
npx @openapitools/openapi-generator-cli generate -i https://raw.githubusercontent.com/vruizz22/innova-backend-serverless/main/docs/openapi.json -g typescript-axios -o packages/api-client
```
