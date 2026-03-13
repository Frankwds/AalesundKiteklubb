This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Database (Supabase)

### Pushing migrations

Apply SQL migrations to your linked Supabase project:

```bash
supabase db push
# or
pnpm db:push
```

Ensure you have run `supabase link` once to connect the local project to your Supabase project.

### Generating types

Generate TypeScript types from the database schema and write them to `src/types/database.ts`:

```bash
SUPABASE_PROJECT_ID=your-project-ref supabase gen types --lang=typescript --project-id=$SUPABASE_PROJECT_ID > src/types/database.ts
# or
pnpm db:types
```

`db:types` requires the `SUPABASE_PROJECT_ID` environment variable. You can find your project ref in the Supabase Dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`.

### Migrations and types in one step

```bash
pnpm db:sync
```

Runs `db:push` then `db:types`, so migrations are applied and types are refreshed.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
