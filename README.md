# MoneyShi

Your money, simply managed. A small, self-hosted money tracker: multiple
accounts, categories, budgets, charts, and an admin console — all as plain
files you host yourself on GitHub Pages, with an optional Android app.

- **docs/SETUP.md** — put this online in about ten minutes, no coding required.
- **docs/ADMIN.md** — using the admin console day to day.
- **docs/ARCHITECTURE.md** — how the project is organised, for when you want to change something.

## Two ways to store data
- **Local (default):** each person's entries stay in their own browser or phone. Nothing is sent anywhere. No setup needed.
- **Online (optional):** connect a free Supabase database (docs/SETUP.md) and everyone's data follows them to any device.

## Folders
```
config/     Site settings (name, colours, database connection) — editable from admin/site.html
css/        Styles
js/core/    Small building blocks: hashing, the Supabase client, shared helpers
js/data/    The database layer (local browser storage, or the online database)
js/auth/    Sign-in, sign-up, "forgot password"
js/app/     Header/navigation, the add-entry and detail popups, backups
js/pages/   One file per page's own logic
js/admin/   The admin console
admin/      The admin console's pages
android/    Notes for the Android app shell (built separately, see docs/SETUP.md)
supabase/   schema.sql — run once if you turn on the online database
tools/      Test-only mock servers (not needed to run the real site)
```

Every page is a separate .html file that loads only the .js files it needs.
Open any page's `<script src="...">` list to see exactly what it depends on.
