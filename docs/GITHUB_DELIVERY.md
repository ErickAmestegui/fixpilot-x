# GitHub delivery — human fallback

Verified publication update, 19 October 2026: the signed-in browser created [ErickAmestegui/fixpilot-x](https://github.com/ErickAmestegui/fixpilot-x), and an authenticated Git push published V1 commit `df0cb7c` on `main` with tag `v1-stable`. V2 passed 164 unit/integration tests and eight Chrome browser scenarios; final release publication is pending. The connector lacks repository creation and GitHub CLI is unavailable; browser creation and the existing authorized Git credential manager supplied the actual route.

Do not create a duplicate repository. The creation instructions below are retained only as a reproducible fallback, not an outstanding task. Push V2 only after the final checks and review; record its actual commit and branch after success.

## Create the empty repository

1. Sign in to [GitHub repository creation](https://github.com/new) as **ErickAmestegui**. Check the owner field before proceeding.
2. Set repository name to **fixpilot-x**, choose **Public**, and use description: “Adaptive 3D assembly copilot with a dependency planner and real local MCP tools. Simulated Alexa+ experience.”
3. Leave README, `.gitignore` and license initialization unchecked; the local project already has them. Create the repository.
4. Copy the resulting HTTPS URL. Expected form, only if that exact owner/name was successfully created: `https://github.com/ErickAmestegui/fixpilot-x.git`.

## Push the reviewed source

Open PowerShell in the project directory and run the following after final V2 changes are reviewed and committed. Confirm the branch printed by the first command is `v2-competition` and the working tree is ready before pushing.

```powershell
Set-Location -LiteralPath 'C:\Users\emili\Documents\Codex\2026-10-19\files-mentioned-by-the-user-codex\outputs\fixpilot-x'
git status --short --branch
git remote -v
```

If no `origin` exists, add the URL actually returned by GitHub, then push:

```powershell
git remote add origin https://github.com/ErickAmestegui/fixpilot-x.git
git push -u origin v2-competition
```

If `origin` already exists, inspect it and use its verified matching URL; do not add a duplicate or overwrite an unrelated remote. Authenticate with GitHub's normal browser/credential flow. Do not paste a password or token into source files or chat. This procedure does not force-push or replace local history.

On GitHub, change **Settings → Branches → Default branch** to `v2-competition` if needed so judges open the final build. Use the repository's actual default-branch page as the submission link. Preserve the V1 checkpoint in Git history. Confirm `README.md`, `LICENSE`, `package-lock.json`, `src/`, `server/`, `tests/` and documentation are present; dependencies, build output, credentials and private local files must not be committed.

## Verify the judge route

Open the repository while logged out and inspect the README. In a separate fresh directory, clone the actual URL, run `npm ci`, then follow README instructions for app and optional MCP server. Record the result in `EVIDENCE_V2.md`; do not call the clone verified until it is run. Check repository and video remain freely accessible through judging. Paste the real repository URL into `DEVPOST.md` and the actual Devpost form only after publication succeeds.
