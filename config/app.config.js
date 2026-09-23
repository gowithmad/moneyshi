/* MoneyShi settings. The admin page (admin/site.html) rewrites this file for you.
   backend: "local"    = every person's data stays inside their own browser or phone.
            "supabase" = data lives in your online database (see docs/SETUP.md), so it follows each user to any device. */
window.MONEYSHI_CONFIG = {
  "name": "MoneyShi",
  "tagline": "Your money, simply managed",
  "backend": "local",
  "supabase": { "url": "", "anonKey": "" },
  "github": { "owner": "", "repo": "", "branch": "main" },
  "theme": { "accent": "#1D7852" },
  "features": { "charts": true, "budgets": true, "importExport": true },
  "defaults": { "accounts": [ { "k": "Cash", "l": "Cash" }, { "k": "Bank", "l": "Bank account" } ] }
};
