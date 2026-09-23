/* MoneyShi settings. The admin page (admin/site.html) rewrites this file for you.
   backend: "local"    = every person's data stays inside their own browser or phone.
            "supabase" = data lives in your online database (see docs/SETUP.md), so it follows each user to any device. */
window.MONEYSHI_CONFIG = {
  "name": "MoneyShi",
  "tagline": "Your money, simply managed",
  "backend": "supabase",
  "supabase": {
    "url": "https://xxvsbxxvpkpaayushsms.supabase.co",
    "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dnNieHh2cGtwYWF5dXNoc21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5NTQsImV4cCI6MjEwNTczMTk1NH0.ih7EX-I6GEm7tB4ib0fwcyWfWFjrbmHX5mbHxqA4mq4"
  },
  "github": {
    "owner": "gowithmad",
    "repo": "moneyshi",
    "branch": "main"
  },
  "theme": {
    "accent": "#1d7852"
  },
  "features": {
    "charts": true,
    "budgets": true,
    "importExport": true
  },
  "defaults": {
    "accounts": [
      {
        "k": "Cash",
        "l": "Cash"
      },
      {
        "k": "Bank",
        "l": "Bank account"
      }
    ]
  }
};
