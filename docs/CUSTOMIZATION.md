# Customization

## Text and identity

Edit `data/profile.yml` to change the role, statement, system signature,
current focus, links or email address.

## Projects

Edit `data/projects.yml`. Keep `problem`, `architecture` and `evidence`
specific. `pinRecommendation` controls the audit recommendation; actual GitHub
Profile pins must still be changed in the GitHub UI.

## Capabilities

Edit `data/capabilities.yml`. Add only technologies and practices that are
supported by a public project or another reproducible artifact.

## Colors and motion

The shared palette lives in `scripts/lib/svg.ts`. Animation is limited to the
Hero and contribution map. Preserve the `prefers-reduced-motion` fallback.

## Regeneration

```bash
pnpm install --frozen-lockfile
pnpm generate
pnpm validate
```

To refresh GitHub data locally, set a token in the process environment and run
`pnpm fetch:github`. Never put a token in a file or command that will be
committed.

## Manual workflow

Open the repository’s **Actions** tab, choose **Update Profile**, then select
**Run workflow**.

If refresh fails, inspect the rate-limit or GraphQL message in the job log.
The workflow will retain the last known-good cache and assets. A token with
broader scopes is optional; the default repository token is expected to be
sufficient for public data.
