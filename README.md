# Amazing Mandala

E-commerce per quadri mandala incisi e dipinti a mano su legno: pezzi unici, vendita in Italia e UE.

## Stack (proposto)

- Next.js (App Router) + TypeScript
- Payload CMS per pannello admin e blog
- PostgreSQL + Drizzle
- Stripe Checkout + webhook
- Tailwind CSS + shadcn/ui
- Deploy su Google Cloud Run + Cloud SQL (europe-west)

## Documentazione

- [Documento di design](docs/design-document.pdf)

## Roadmap

- **M0 · Fondamenta**: repo, Docker Compose, Next.js + Payload, Postgres, CI, deploy staging
- **M1 · Catalogo**: quadri, foto, catalogo con filtri, pagina prodotto, IT/EN
- **M2 · Checkout**: riserva del pezzo, Stripe, ordini, email
- **M3 · Account e contenuti**: account, wishlist, coupon, blog, newsletter
- **M4 · Lancio**: pagine legali, SEO, test e2e, Stripe live

## Convenzioni

- `main` sempre rilasciabile, lavoro su feature branch + pull request
- Commit in formato [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`…)
- Segreti solo in variabili d'ambiente, mai nel repo
