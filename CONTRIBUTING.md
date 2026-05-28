# Contributing to gpx

## ✍️ Making Changes

✅ Follow existing code style and naming conventions.

✅ Ensure your change is:

* Well-scoped (one logical change per PR).
* Covered by tests when applicable.
* Passing all checks before opening a PR.

✅ For GPX files:

- Use naming format: `YYYY-MM-DD-activity-type-name.gpx`
- Recommended activity types: `bike`, `run`, `trekking`
- Ensure the date is a valid calendar date

✅ If you change behavior:

Update README.md when needed.

## 💻 Local Development

1. Install dependencies (if needed):

   npm install

2. Run the site locally:

   npm run dev

3. Run tests:

   npm test

## 🧹 GPX Cleanup

- Staged GPX files are automatically cleaned before commit via `.githooks/pre-commit`.
- Manual cleanup (all GPX files):

  npm run gpx:clean

- Manual cleanup (only staged GPX files):

  npm run gpx:clean:staged

Cleanup removes non-essential `<extensions>` blocks and unused Garmin extension namespaces.

## 🚀 Release Flow

1. Create and push an RC tag manually, for example:

   git tag v0.3.0-rc.1
   git push origin v0.3.0-rc.1

2. CD deploys automatically on RC tag creation.

3. Promote RC to stable using GitHub Actions workflow `Promote RC to Stable` and input `rc_tag`.

   Note: configure repository secret `RELEASE_PAT` (scopes: `repo`, `workflow`) for reliable tag push from the workflow.

4. The workflow creates stable tag `vX.Y.Z` and GitHub Release.

5. CD deploys automatically on stable tag creation and updates `version.json`.

## 🚦 Submitting a Pull Request

1. Push your changes to your fork.
2. Open a Pull Request. Please use the [pull request template](.github/pull_request_template.md) when opening a PR to ensure completeness.

## 🤝 Code of Conduct

Please be respectful and constructive in your communication. Contributions are welcome from all skill levels.

## ⚠️ Maintainer note

> [!IMPORTANT]
> Please note that this project is developed and maintained in **focused time blocks** to ensure quality. Contributions and issues will be addressed on a **best-effort basis**, depending on ongoing priorities.
