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

## CMS

The Daily Transit CMS is a local-first Jamstack pipeline. Canonical content lives in `content/` as Markdown files with YAML front matter.

Current content directories:

- `content/articles/` — articles and explainers
- `content/reels/` — short-form video metadata
- `content/projects/` — citizen-science participation links
- `content/inbox/` — private editorial inputs, excluded from public generated output

Local commands:

```bash
npm run cms:validate
npm run cms:build
npm run cms:preview
```

Docker commands:

```bash
docker compose run --rm cms npm run cms:validate
docker compose run --rm cms npm run cms:build
docker compose up web
```

`npm run build` runs `cms:build` before `next build`. Generated CMS files are build artifacts and are ignored by git.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
