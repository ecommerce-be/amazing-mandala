# Amazing Mandala

E-commerce per quadri mandala incisi e dipinti a mano su legno: pezzi unici, vendita in Italia e UE.

## Stack (proposto)

- Next.js (App Router) + TypeScript
- Payload CMS per pannello admin e blog
- PostgreSQL + Drizzle
- Stripe Checkout + webhook
- Tailwind CSS + shadcn/ui
- Deploy su Google Cloud Run + Cloud SQL (europe-west)

## Sviluppo locale

Requisiti: Node.js 22.23.4+ (o 24.22.1+), Docker Desktop.

```powershell
Copy-Item .env.example .env   # poi imposta PAYLOAD_SECRET
npm install
npm run db:up                 # avvia Postgres in Docker
npm run dev                   # http://localhost:3000 e http://localhost:3000/admin

# oppure tutto insieme: database, sito e webhook Stripe
npm run dev:all
```

### Dati di prova

```powershell
npm run seed         # importa 30 quadri di prova con le foto (slug "seed-…")
npm run seed:reset   # li rimuove
```

Le foto vengono lette da `C:\Users\39347\Pictures\foto mandala\ecommerce`; per un'altra cartella impostare `$env:SEED_PHOTOS_DIR`.

## Documentazione

- [Documento di design](docs/design-document.pdf)

## Roadmap

- **M0 · Fondamenta**: repo, Docker Compose, Next.js + Payload, Postgres, CI, deploy staging
- **M1 · Catalogo**: quadri, foto, catalogo con filtri, pagina prodotto, IT/EN
- **M2 · Checkout**: riserva del pezzo, Stripe, ordini, email
- **M3 · Account e contenuti**: account, wishlist, coupon, blog, newsletter
- **M4 · Lancio**: pagine legali, SEO, test e2e, Stripe live

## Convenzioni

- Si lavora direttamente su `main`; prima di ogni push lanciare `npm run lint` e `npm run build`. La CI controlla ogni push
- Commit in formato [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`…)
- Segreti solo in variabili d'ambiente, mai nel repo
