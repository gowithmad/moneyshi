# Using the admin console

Open **Admin** from the header (only visible to administrators) or go to `admin/index.html` on your site.

- **Overview** — a quick status check: is the online database connected, is GitHub connected, who is signed in.
- **Site settings** — the app's name, tagline, accent colour, which features are turned on, the starting accounts for new users, and the database connection. Saving here writes `config/app.config.js` to your GitHub repository.
- **Pages & files** — open, edit, create or delete any file in the site: any page, style, or script. Saving here commits straight to GitHub, the same as editing on github.com. If someone else changed the same file since you opened it, you'll be told rather than having your save overwrite theirs — reopen the file and redo your change.
- **Users** — the accounts that exist (in online mode: everyone; in local mode: only the accounts in the browser you're currently using), when they joined, and their role. Change **Member** to **Administrator** to give someone else admin access.

Every save here needs the GitHub connection box filled in (owner, repository, branch, and a token — see docs/SETUP.md step 4). It's asked for again each time you open a new tab, since the token is never saved to disk.

## Making a change you're unsure about

Every save is a normal commit to your repository. If something looks wrong after a change, open the file's history on github.com and revert it — the same as any other GitHub project.
