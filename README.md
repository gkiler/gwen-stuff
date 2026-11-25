# gwen-stuff

Little family apps, hosted on GitHub Pages. Each app lives in its own folder with a random suffix, so the only way to find one is to be sent the link. The home page lists nothing.

Nothing here is private. The repo is public, so anyone who looks at it can see every app.

## Apps

| App | Folder |
| --- | --- |
| Snoopy shirt vote | `snoopy-vote-62prq2/` |

## Adding an app

1. Make a folder named `<app-name>-<6 random letters/digits>/` with an `index.html` in it.
2. Add `<meta name="robots" content="noindex, nofollow">` to its `<head>`.
3. If it needs to save data, load `../shared/config.js` and `../shared/api.js`, call `GwenAPI.list(app)` and `GwenAPI.put(app, key, data)`, and add the app's name to `APPS` in `backend/Code.gs` (then redeploy the script: Deploy > Manage deployments > edit > New version).
4. Push. GitHub Pages republishes in about a minute.

## Data storage (backend/)

`backend/Code.gs` is a Google Apps Script attached to a Google Sheet. Each app gets its own tab, one row per entry (Updated, Key, Data as JSON). To fix or remove an entry, edit or delete its row in the Sheet.

Setup, once:

1. Make a new Google Sheet (sheets.new) named "gwen-stuff data".
2. Extensions > Apps Script. Replace the contents of `Code.gs` with `backend/Code.gs`. Save.
3. Deploy > New deployment > type: Web app. Execute as: Me. Who has access: Anyone. Deploy, then approve the permissions.
4. Copy the Web app URL (ends in `/exec`) into `shared/config.js`, and push.
