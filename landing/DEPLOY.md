Deployment notes — Landing (S3 + CloudFront)

Required GitHub Secrets (repo: innova-clients):

- `AWS_ACCESS_KEY_ID` — IAM key with S3 + CloudFront permissions
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` — e.g. `us-east-1`
- `S3_BUCKET_NAME` — target S3 bucket for the landing (website hosting)
- `CLOUDFRONT_DISTRIBUTION_ID` — (optional) for invalidation

What the workflow does:

- Runs `node innova-clients/scripts/check-absolute-paths.js` to detect relative asset/import paths in the landing
- Builds the Astro site (`innova-clients/landing/dist`)
- Copies `SuperProfes-Design-System` into `public/design-system` during build
- Syncs `dist/` to the S3 bucket and triggers a CloudFront invalidation

DNS (Name.com / Route setup):

- Ensure the apex `superprofes.app` A/ALIAS record points to CloudFront distribution (if using ALIAS) or use the CNAME values provided by API Gateway for subdomains as needed.
- Common flow: create an `A`/ALIAS from `superprofes.app` → CloudFront distribution domain, and `CNAME` for `www` to the distribution.

Notes:

- This workflow expects the landing to be built independently; Next.js apps should continue to deploy to Vercel/Netlify as before.
- For local testing: `cd innova-clients/landing && npm ci && npm run build && npx serve dist` (requires `serve`)
