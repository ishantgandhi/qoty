# Qoty

Qoty extracts hotel quote pricing from pasted text, HTML emails, or PDF/HTML/TXT files. It returns four fields (**total**, **guestroom**, **meeting room**, and **food & beverage**), with a short explanation for each. You can then save the result to Supabase and review or unsave it later.

Parser and Saved are separate tabs. Extraction does not write to the database until you click **Save quote**.

## Video submission

- [Loom](https://www.loom.com/share/4cf344d8888f44e7a8276b107ea77a24)
- [Google Drive](https://drive.google.com/file/d/11cMVxteCx3ruXOcBAZlZXLQDLvXOqpde/view?usp=sharing)

## Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com/) project
- API keys for the models you want to use:
  - [Anthropic](https://console.anthropic.com/) — Claude Sonnet 5
  - [OpenAI](https://platform.openai.com/) — GPT-5.4 Mini
  - [Google AI](https://aistudio.google.com/) — Gemini 3.7 Flash

## Setup

```bash
git clone <your-repo-url>
cd hotel-quote-parser
npm install
```

Create `.env.local` in the project root (this file is gitignored):

```
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get the Supabase URL and anon key from **Project Settings → API**.

## Supabase

In the SQL editor, create (or update) the `quotes` table:

```sql
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_type text,
  raw_text text,
  total_quote numeric,
  guestroom_total numeric,
  meeting_room_total numeric,
  fb_total numeric,
  computed_total numeric,
  model_used text,
  field_basis jsonb
);

alter table quotes enable row level security;

create policy "Allow selects from app"
on quotes
for select
to anon
using (true);

create policy "Allow inserts from app"
on quotes
for insert
to anon
with check (true);

create policy "Allow deletes from app"
on quotes
for delete
to anon
using (true);
```

The app uses the **anon** key from the server. Select, insert, and delete policies are all required, or list/save/unsave will fail.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Paste a quote, upload `.html` / `.pdf` / `.txt`, or both.
2. Pick a model (cheapest and Pricey are labeled).
3. Click **Run Qoty**.
4. Optionally click **Save quote**.
5. Open the **Saved** tab to expand a quote or **Unsave** it.

Example files are in `examples/`.

## Deployed (Vercel)

The live app is at [https://qotyapp.vercel.app/](https://qotyapp.vercel.app/).

Vercel Hobby has a ~4.5MB request-body limit (413 if exceeded) and a function timeout. Extract sets `maxDuration = 60`. Large HTML emails with embedded images or huge PDFs should be pasted as text or trimmed. Add the same env vars in the Vercel project settings.

## How it works

1. The browser builds `{ type, content, label }` inputs (`lib/quote.ts`) and sends them with the selected model.
2. `POST /api/extract` normalizes HTML/PDF/text (`lib/normalize.js`).
3. The Vercel AI SDK calls Claude, GPT, or Gemini with a shared schema (`lib/quote-schema.ts`, `lib/models.ts`).
4. The route checksums total vs guestroom + meeting + F&B. It does not save.
5. The UI shows the four amounts. If the checksum disagrees, it also shows a calculated total. Click a row for the explanation.
6. `POST /api/save` inserts into `quotes` (including `model_used`).
7. `GET /api/quotes` loads the Saved tab. `DELETE /api/unsave?id=` removes a row.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
