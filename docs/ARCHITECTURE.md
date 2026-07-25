# Profile Engine Architecture

## Data flow

Human-maintained content lives in three YAML files:

- `profile.yml` contains identity, positioning, current focus and contact data.
- `projects.yml` contains project evidence and the repository audit.
- `capabilities.yml` contains the six-domain capability matrix.

GitHub-derived data lives in `generated.json`. `fetch-github-data.ts` queries
only public repository metadata, merged pull requests authored by
`xxiaoxiong`, and `contributionsCollection`. Every external response is parsed
through Zod before it reaches a template.

## Generation

`generate-profile.ts` orchestrates small renderers. Hero, six-project showcase,
capability orbit, architecture and contribution visuals are native SVG strings
with explicit dimensions, `viewBox`, title and description. `README.md` is the
default Chinese profile generated from `README.template.md`; `README.en.md` is
generated from `README.en.template.md`.

Generation is deterministic for a fixed set of input files. `--check` compares
the expected output to the committed files and fails on drift.

## Cache and failure fallback

`generated.json` is the last-known-good cache. Each API section is refreshed
independently. A failed request or an empty PR/calendar response retains the
previous non-empty section. A fresh repository may render an explicit
“verified data refresh pending” contribution grid, but it never invents
activity.

No private repository name is requested or written. Contribution counts are
calendar totals returned by GitHub and do not disclose private project names.

## Workflow permissions

`validate-profile.yml` has `contents: read` and runs on pull requests and pushes
to `main`.

`update-profile.yml` grants `contents: write` only to its refresh job. It runs
at `03:23 UTC`, uses the repository-scoped `GITHUB_TOKEN`, commits only when a
diff exists, and is not triggered by its own push.

## Operational boundary

The profile works without Actions because all generated assets are versioned.
Actions refresh evidence in both languages; they are not a runtime dependency
for the GitHub homepage.
