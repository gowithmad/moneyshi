# How this project is put together

No build step, no framework, no bundler. Every page is a plain `.html` file
that lists the exact `.js` files it needs, in order, as `<script>` tags —
open any page and read the list to see its dependencies.

## Loading order (why it matters)
Later files use things defined in earlier ones (plain global functions and
variables, no modules). The order every app page uses:

1. `config/app.config.js` — your settings (name, theme, backend, GitHub link)
2. `js/core/util.js` — `$()`, formatting, dialogs, `CFG`
3. `js/core/crypto.js` — password hashing (used by local-mode accounts)
4. `js/core/supabase.js` — the online-database client
5. `js/data/local-db.js`, `js/data/cloud-db.js`, `js/data/db.js` — the database layer
6. `js/auth/local-auth.js`, `js/auth/cloud-auth.js`, `js/auth/auth.js` — sign-in
7. `js/app/categories.js`, `state.js`, `calc.js`, `templates.js`, `layout.js`, `entry-form.js`, `detail.js`, `backup.js`, `boot.js` — shared app pieces
8. `js/core/pwa.js` — installable/offline support
9. `js/pages/<page>.js` — that one page's own logic, ending in a call to `bootApp({...})`

## Adding a new page
1. Copy the `<head>` and script list from an existing page such as `budgets.html`.
2. Write your markup inside `<main class="wrap">…</main>`.
3. Create `js/pages/yourpage.js` ending with:
   ```js
   bootApp({page:'yourpage', render:[yourRenderFunction]});
   ```
   `bootApp` checks sign-in, opens the database, loads `TX`/`CUSTOM`/`BUDGETS`/etc, draws the header and popups, then calls every function in `render` whenever something changes (month switched, entry added, category edited...).
4. Add a link to it wherever makes sense (the `NAV` array in `js/app/layout.js` for a main tab, or a plain link elsewhere).

## Adding a category, chart, or field
- Built-in categories: `js/app/categories.js` (`B_OUT`, `B_IN`).
- Category guessing for new entries: `guessCat()` in the same file.
- Totals and budget math: `js/app/calc.js`.
- The add/edit entry form's fields: `TPL_ENTRY` in `js/app/templates.js`, wired up in `js/app/entry-form.js`.

## The two database backends
`js/data/db.js` exposes one `DB` object (`add`, `put`, `del`, `all`, `getMeta`,
`setMeta`...). It forwards every call to whichever of `local-db.js` (an
IndexedDB store per person, in their own browser) or `cloud-db.js` (Supabase
tables, shared by everyone) is active — chosen by `config/app.config.js`'s
`backend` setting. Pages never need to know which one is running.

Local-mode accounts (`js/auth/local-auth.js`) live in their own small
IndexedDB database (`moneyshi-users`) — separate from anyone's entries — and
hold a salted PBKDF2-SHA256 password hash and a hashed recovery code, never
the password itself.

## Editing through the admin console vs. editing the files directly
The admin console's **Pages & files** page edits files on GitHub directly
through GitHub's API — the same commits you'd make by hand. There is no
difference between a change made there and one made by editing the file on
github.com or in a text editor and pushing it; use whichever is convenient.

## Testing
`tools/mock-supabase.js` and `tools/mock-github.js` are small stand-ins for
the real services, used only to test changes without needing real accounts.
They are never loaded by the actual site.
