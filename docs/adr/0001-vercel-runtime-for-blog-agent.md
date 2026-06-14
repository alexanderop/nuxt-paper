# 1. Move hosting from GitHub Pages (static) to Vercel (hybrid) to run the blog agent

Date: 2026-06-14

## Status

Accepted

## Context

nuxt-paper currently deploys as a **pure static site** to GitHub Pages
(`pnpm generate` → static artifact; `nuxt-og-image` `zeroRuntime`; only
`rss.xml`/`sitemap.xml` server routes, both prerendered). There is no server
runtime in production.

We want to clone nuxt.com's "Nuxi" agent **faithfully**: streaming `streamText`
responses, a self-hosted MCP server, Drizzle persistence, GitHub OAuth, daily
rate limiting, and a **secret AI Gateway API key**. Every one of these requires
a server runtime, and the key can never ship to a static client.

Pure GitHub Pages cannot host any of this. The realistic options were: (a) move
the whole site to a serverless platform; (b) keep Pages static and run only the
chat API as a separate external worker; (c) a client-only agent with a
user-supplied key. (b) means two services/repos; (c) sacrifices key safety,
persistence, and rate limiting.

## Decision

Move the entire site to **Vercel** as a hybrid deployment:

- Content/listing pages stay **prerendered** (SSG) via Nitro route rules — same
  fast static delivery as today.
- The chat endpoint, auth routes, MCP server, and CRUD APIs run as **Vercel
  serverless functions** (Nitro `vercel` preset).
- Persistence is **Turso (libSQL)** over the network (Vercel serverless has no
  persistent filesystem, so `better-sqlite3` is dropped).
- The model runs through the **Vercel AI Gateway** (`anthropic/claude-sonnet-4.6`),
  key held in a Vercel env var.

## Consequences

- **Positive:** near-1:1 fidelity to nuxt.com's architecture; streaming + secret
  key + persistence all work; content pages keep static performance; AI Gateway
  gives unified billing/telemetry and prompt caching.
- **Negative / trade-offs:** hosting provider change (DNS, build settings,
  secrets migration); GitHub Pages deploy workflow is retired; `better-sqlite3`
  removed in favour of `@libsql/client`; new external dependency (Turso) and a
  paid LLM key with running cost (mitigated by the daily rate limiter).
- **Reversibility:** low. Reverting to GitHub Pages means deleting the agent
  entirely — the agent and the static-only model are mutually exclusive.
