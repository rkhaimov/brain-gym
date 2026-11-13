# Local production use

Ceramics runs as a local Node.js application in an evergreen Chromium browser such as Chrome or
Edge. Configure one of those browsers as the operating system default before starting the
application.

## Start and stop

From the repository root, run:

```powershell
npm start
```

The command rebuilds the client and server, verifies and backs up the production database, applies
pending migrations, starts a server bound only to `127.0.0.1`, and then opens the application in the
default browser. If backup or migration preparation fails, the browser is not opened.

Keep the terminal open while using Ceramics. Press Ctrl+C once to stop it normally; the server
finishes active requests and closes SQLite before the process exits. Confirmed changes remain in
`.local/production/ceramics-ledger.sqlite`, with recoverable copies under
`.local/production/backups/`. See [recovery.md](recovery.md) before restoring a backup.

## Yandex Mail import

Ordinary local work does not require Yandex credentials. To enable the explicit
«Загрузить отчёты из почты» action, create `.local/yandex-mail.env` containing:

```dotenv
YANDEX_MAIL_USER=creator@yandex.ru
YANDEX_MAIL_APP_PASSWORD=application-password
```

The file is local and ignored by Git. The application reads it at startup, but connects to Yandex
only when the import action is explicitly used.
