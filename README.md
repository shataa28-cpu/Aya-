# Medara

Medara is a mobile-first household medicine cabinet prototype.

- **Hosting target:** Vercel, connected to the GitHub repository. Production deploys from `main`; pull requests receive Preview deployments.
- **Backend target:** Supabase Auth, Postgres with Row Level Security, and private Storage.
- [Product requirements](Medara-PRD.md)
- [SFDA lookup notes](SFDA-SDI-lookup.md)
- [App setup and prototype limits](medara-app/README.md)

The current prototype stores records in the browser and does not yet connect to Supabase or a medicine catalog. Product entries are not verified. Do not treat the hosting or backend targets as live until the Vercel and Supabase projects are configured.