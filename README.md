# Qoty

Qoty extracts hotel quote pricing from pasted text, HTML emails, or PDF/HTML files. It returns four fields (**total**, **guestroom**, **meeting room**, and **food & beverage**) then saves the result to Supabase.

## Prerequisites

- Node.js 20+
- npm
- An [Anthropic](https://console.anthropic.com/) API key
- A [Supabase](https://supabase.com/) project

## Setup

```bash
git clone <your-repo-url>
cd hotel-quote-parser
npm install
```

Create `.env.local` in the project root (this file is gitignored):

```
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get the Anthropic key from [console.anthropic.com](https://console.anthropic.com/). Get the Supabase URL and anon key from **Project Settings → API**.

## Supabase

In the SQL editor, create (or update) the `quotes` table:

```sql
create table if not exists quotes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  source_type text,
  raw_text text,
  total_quote numeric,
  guestroom_total numeric,
  meeting_room_total numeric,
  fb_total numeric,
  computed_total numeric,
  field_basis jsonb
);

alter table quotes enable row level security;

create policy "Allow inserts from app"
on quotes
for insert
to anon
with check (true);
```


The app uses the **anon** key from the server, so the insert policy above is required or saves will fail.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Paste a quote, upload `.html` / `.pdf` / `.txt`, or both, then click **Run Qoty**.

Samples are in the sample folder.

## Deployed (Vercel)

Although the app is deployed it has a limit to file size. You can still view it here at 

https://hotel-quote-parser.vercel.app/

**Notes**

- Request bodies over ~4.5MB return 413. Large HTML emails with embedded images or huge PDFs should be pasted as text or trimmed.

## How it works

1. The browser builds `{ type, content, label }` inputs (`lib/quote.ts`).
2. `POST /api/extract` normalizes HTML/PDF/text (`lib/normalize.js`).
3. Claude fills `extract_quote_fields` (`lib/extract-tools.js`).
4. The route checksums total vs guestroom + meeting + F&B, then inserts into `quotes`.
5. The UI shows the four amounts; if the checksum disagrees, it also shows a calculated total.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
