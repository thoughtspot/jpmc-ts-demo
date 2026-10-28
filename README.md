# Acme × ThoughtSpot — Embedded Analytics Portal

A demo revenue-intelligence portal styled as an **Acme** product surface, with
ThoughtSpot embedded throughout via the
[Visual Embed SDK](https://developers.thoughtspot.com/docs). Built with Vite +
React + TypeScript. Deploys to Vercel.

This is a rebranded twin of the Salesloft demo — identical functionality, theme,
and ThoughtSpot data; only the logo and the **Acme / Acme AI** branding differ.

## What's in it

| Tab | ThoughtSpot embed | Notes |
| --- | --- | --- |
| **My Reports** | — | Landing / overview |
| **Analytics** | `LiveboardEmbed` | Full liveboard with a **Rep** dropdown runtime filter (`HostEvent.UpdateRuntimeFilters`) |
| **Cadences** | — | Static view |
| **Signals** | `LiveboardEmbed` (single viz) | One visualization from the Analytics liveboard; right-click a row → **Re-engage cadence** custom action opens a Win-Back Cadence modal |
| **Ask Acme** | `SpotterEmbed` | "Acme AI" chat: general questions answered from a small FAQ/knowledge base, data questions routed to Spotter via `HostEvent.SpotterSearch`; playful trial-upgrade modal |

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc + vite build -> dist/
npm run preview  # preview the production build
```

> If `node`/`npm` aren't on your PATH, they may live at `~/.node/bin`:
> `export PATH="$HOME/.node/bin:$PATH"`.

## Configuration

- **ThoughtSpot IDs & flags** live in [`src/config.ts`](src/config.ts).
- **ThoughtSpot host** and auth are set in [`src/lib/thoughtspot.ts`](src/lib/thoughtspot.ts).
- **Optional LLM routing** for Ask Acme — copy `.env.example` to `.env` and set
  `VITE_ANTHROPIC_API_KEY`. Without it, the chatbot falls back to a keyword
  router + FAQ and still routes data questions to Spotter.

## Deploy

Configured for Vercel ([`vercel.json`](vercel.json)) — framework `vite`,
output `dist/`, SPA rewrite to `/index.html`.
