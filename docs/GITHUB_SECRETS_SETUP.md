# GitHub Secrets Setup — innova-clients

Para que los workflows CI/CD funcionen correctamente, agrega estos secrets en el repositorio GitHub (`Settings > Secrets and variables > Actions`):

## Vercel Deployment Secrets (para `deploy.yml`)

- `VERCEL_TOKEN_PRACTICE`: Token de Vercel para deploy de `apps/practice`
- `VERCEL_TOKEN_TEACHER`: Token de Vercel para deploy de `apps/teacher`
- `VERCEL_ORG_ID`: Organization ID en Vercel
- `VERCEL_PROJECT_ID_PRACTICE`: ID del proyecto Vercel para practice
- `VERCEL_PROJECT_ID_TEACHER`: ID del proyecto Vercel para teacher

## Expo EAS Secrets (para `deploy-expo.yml`)

- `EAS_TOKEN`: Token de Expo/EAS para build no interactivo

## AWS Landing Secrets (para `deploy-landing-s3.yml`)

- `AWS_ACCESS_KEY_ID`: IAM key con permisos para S3 y CloudFront
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`: normalmente `us-east-1`
- `S3_BUCKET_NAME`: bucket estático de la landing
- `CLOUDFRONT_DISTRIBUTION_ID`: distribución para invalidación opcional

## Environment Variables (Next.js - required en `.env.production`)

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `SENTRY_DSN`

Estos se setean en Vercel/Cloudflare panels o via secrets:

- `NEXT_PUBLIC_API_URL`: URL base del backend (ej: `https://api.superprofes.app`)
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`: ID del User Pool de Cognito (ej: `us-east-1_XXXXXXX`)
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`: Client ID de Cognito

## Cómo obtener estos secrets

### Vercel

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en Settings → Tokens
3. Crear nuevo token (scope: Full Account)
4. Copiar el token y pegarlo en GitHub como `VERCEL_TOKEN_PRACTICE` o `VERCEL_TOKEN_TEACHER`
5. ORG_ID: En dashboard, copiar del URL o Settings → General
6. PROJECT_ID: Project Settings → General → Project ID

### Cloudflare Pages

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Crear nuevo proyecto Pages o usar existente
3. Settings → API → Generate API Token (scope: Account.Pages)
4. Copiar token como `CF_API_TOKEN`
5. Project Name: visible en Pages dashboard

### Cognito

1. AWS Console → Cognito → User Pools
2. Crear pool (name: `innova-prod`) o usar existente
3. Copy User Pool ID (ej: `us-east-1_XXXXXXX`) → `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
4. App Clients → Crear cliente OAuth → Copy Client ID → `NEXT_PUBLIC_COGNITO_CLIENT_ID`

## Ejemplo de .env.production

```
NEXT_PUBLIC_API_URL=https://api.superprofes.app
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_TESTPOOL
NEXT_PUBLIC_COGNITO_CLIENT_ID=testclientid
```

## Testing locally

```bash
# Export secrets locally (solo dev, NUNCA en .env.production commiteado)
export VERCEL_TOKEN_PRACTICE=<token>
export VERCEL_ORG_ID=<org>
export VERCEL_PROJECT_ID_PRACTICE=<project>

# O test sin deploy
pnpm build
```

## CI/CD Flow

1. **CI (`ci.yml`)**: Runs on all pushes/PRs
   - Install → Download fonts → Generate OpenAPI → Build → Lint → Test
   
2. **Deploy (`deploy.yml`)**: Runs on `main` push only
   - Test & build → Deploy practice (Vercel) → Deploy teacher (Vercel) → Deploy landing (Cloudflare)
