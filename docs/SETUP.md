# Setting up MoneyShi

You do not need to know how to code. Follow the steps for the parts you want.

## 1. Put the site on GitHub (5 minutes)

1. On GitHub, create a new **public** repository (Settings → General; Pages needs the repo to be public unless you're on a paid plan).
2. Upload every file and folder from this project into it (drag-and-drop on the repository's page works, or use `git push` if you're comfortable with it).
3. In the repository, go to **Settings → Pages**. Under **Source**, choose **GitHub Actions**. The included workflow (`.github/workflows/deploy.yml`) then publishes the site automatically every time you upload changes.
4. After a minute or two, your site is live at `https://<your-username>.github.io/<repository-name>/`. Open it.

## 2. Sign in for the first time

Open your site's `register.html` page and create an account. **The very first account created becomes the administrator.** Do this yourself, first, before sharing the link with anyone else.

At this point the site is in **local mode**: everyone's entries stay in their own browser, nothing syncs between devices. That's a complete, working setup — you can stop here.

## 3. Turn on the online database (optional, ~10 minutes)

This makes everyone's data follow them to any device, instead of staying on one browser.

1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase project, open **SQL Editor**, paste in the contents of `supabase/schema.sql` from this project, and run it. This creates the tables and the privacy rules that keep each person's entries visible only to them.
3. In Supabase, go to **Project Settings → API**. Copy the **Project URL** and the **anon public** key (never the `service_role` key — that one must never appear in the site).
4. On your live site, sign in as the administrator and go to **Admin → Site settings**. Enter your GitHub repository details and a GitHub token (see step 4), turn the backend to **Online**, paste in the Supabase URL and anon key, and save.
5. In Supabase, go to **Authentication → URL Configuration** and add your site's address (`https://<your-username>.github.io/<repository-name>/`) so password-reset links point back to your site.
6. By default, Supabase requires people to click a confirmation link in their email before they can sign in. To make the first sign-in as smooth as this project's local mode, you can turn that off in **Authentication → Providers → Email → Confirm email**, or leave it on for extra safety.

From here on, "Sign in" asks for an **email address** instead of a username, since that's how the online database identifies people.

## 4. Let the admin console save changes to GitHub

The admin console (**Admin → Pages & files**, **Admin → Site settings**) edits your site by committing straight to your GitHub repository, the same as editing on github.com. For it to do that, it needs a token:

1. On GitHub, go to **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Give it access to **only this one repository**, and under **Permissions**, set **Contents** to **Read and write**.
3. Copy the token. Paste it into the "GitHub connection" box on any admin page, along with your GitHub username and repository name. It's kept only in that browser tab (not saved), so you'll paste it again next time.

## 5. The Android app (optional)

The Android app is a thin shell that shows this same site. Ask Claude to rebuild `MoneyShi.apk` any time you want a fresh copy — for example after changing the app's name, colours or icon. Install it the same way as before (allow "install unknown apps" for whichever app you open the file from).

The app works fully offline for everyday use. It only needs the internet for the online database (if you turned that on) and for administrators using the GitHub admin pages from their phone.

## Keeping things backed up

Every account has **Data & backup → Export backup (JSON)**. This is the only true copy of local-mode data — there is no password recovery for it beyond the recovery code shown at sign-up, and no server keeps a copy. Encourage everyone to export a backup now and then.
