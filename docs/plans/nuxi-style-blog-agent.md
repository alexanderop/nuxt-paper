# Nuxi-style AI agent for nuxt-paper

## Context

Port nuxt.com's "Nuxi" agent architecture **faithfully** onto this blog,
rendered in the blog's own AstroPaper style. Reference implementation lives in
`/tmp/nuxt.com/layers/nuxi/` (cloned for study). This is a deliberate
architecture-clone exercise; the small content corpus (currently 2 posts) is
accepted.

Hard constraints discovered while grounding:
- The blog is a **pure static GitHub Pages site** today — no server runtime. The
  agent requires one. Resolved by ADR 0001: move to **Vercel hybrid** (SSG pages
  + serverless functions).
- `better-sqlite3` cannot run on Vercel serverless → **Turso (libSQL)**.
- All Vue code must follow **Michael Thiessen's patterns** (project memory):
  composables for logic, humble/presentational components, Preserve Object
  props, computed over template logic, layouts over copied shells. Run the
  `vue-reviewer` agent on new components before they are done.
- Chat UI must match the AstroPaper aesthetic: reuse `app/assets/css/theme.css`
  tokens, `typography.css` for rendered assistant markdown, light/dark, view
  transitions.

### Decisions (from grill)
- **Runtime:** Vercel serverless functions (whole site moves to Vercel).
- **Scope:** faithful architecture clone — streaming, tools, MCP, persistence.
- **Data:** Turso (libSQL) + `drizzle-orm/libsql`; keep Nuxi's SQLite schema ~1:1.
- **Auth:** GitHub OAuth via `nuxt-auth-utils`; per-user chat history + a `/chat`
  dashboard (mirrors nuxt.com's logged-in path).
- **Chat UI:** a dedicated `/chat` route (and `/chat/[id]`). No floating button.
- **Capabilities:** MCP server (list/get/search posts) + `show_post` card tool +
  `search_posts` (reuse existing `minisearch`) + Anthropic `web_search`.
- **Extras:** message voting, LLM title generation, DB rate limiting, usage
  stats + admin tools — all in.
- **Model:** `anthropic/claude-sonnet-4.6` via **Vercel AI Gateway**,
  `providerOptions.gateway.caching: 'auto'`.

### Doc-verified library contracts (checked 2026-06-14)
- **AI SDK v6** (`ai@^6`) — server: `streamText`, `convertToModelMessages`,
  `createUIMessageStream` / `createUIMessageStreamResponse`, `stepCountIs`,
  `smoothStream`, `safeValidateUIMessages`. AI Gateway via model string
  `'anthropic/claude-sonnet-4.6'` (no key in client). Source:
  ai-sdk.dev/docs/getting-started/nuxt, /docs/migration-guides/migration-guide-5-0.
- **@ai-sdk/vue v2** — `Chat` class + `DefaultChatTransport({ api })`; no more
  `useChat` input state. Source: ai-sdk.dev migration guide.
- **@ai-sdk/mcp** — `createMCPClient({ transport: { type: 'http', url } })`,
  `await client.tools()`, `client.close()`. Source: mcp-toolkit.nuxt.dev/advanced/evals.
- **@nuxtjs/mcp-toolkit** (`^0.17`) — `defineMcpTool({ name, inputSchema (zod
  object map), handler → { content: [{ type:'text', text }] }, annotations,
  cache })`; `mcp: { name, route: '/mcp' }` in nuxt.config. Source:
  mcp-toolkit.nuxt.dev/getting-started/{introduction,configuration}.
- **nuxt-auth-utils** — `defineOAuthGitHubEventHandler({ config, onSuccess })`,
  `setUserSession` / `getUserSession` / `requireUserSession`;
  `runtimeConfig.oauth.github.{clientId,clientSecret}`, `NUXT_SESSION_PASSWORD`
  (≥32 chars). Source: atinux/nuxt-auth-utils.
- **Turso + Drizzle** — `import { drizzle } from 'drizzle-orm/libsql'` +
  `createClient({ url, authToken })` from `@libsql/client`; `drizzle-kit`
  `dialect: 'turso'`, `dbCredentials: { url, authToken }`. Source:
  drizzle-team docs connect-turso.

## Contracts

### Environment variables (Vercel + `.env.example`)
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway.
- `NUXT_SESSION_PASSWORD` — ≥32 chars, seals auth cookie.
- `NUXT_OAUTH_GITHUB_CLIENT_ID`, `NUXT_OAUTH_GITHUB_CLIENT_SECRET`.
- `DATABASE_URL`, `DATABASE_AUTH_TOKEN` — Turso libSQL.
- `NUXT_AGENT_ADMIN_TOKEN` — gates admin MCP tools (mirrors nuxt.com).

### Database (`server/db/schema.ts`, `drizzle-orm/sqlite-core` libSQL)
Tables port Nuxi's schema:
- `users` — `id` (text pk), `githubId`, `login`, `email`, `avatar`, timestamps.
  Upserted on OAuth success; FK target for chats.
- `chats` — `id` (uuid), `title?`, `userId` FK, `visibility`
  (`public|private|admin`, default private), `parentChatId?` (branching),
  `model`, `provider`, token/cost/duration/requestCount counters, `updatedAt`,
  `createdAt`.
- `messages` — `id`, `chatId` FK, `role`, `parts` (json), `metadata` (json),
  `createdAt`.
- `votes` — composite pk (`chatId`,`messageId`), `isUpvoted` (bool).
- `agentDailyUsage` — pk (`userId`,`dayKey`), `count`, `limitOverride?`.
- `agentStats` — aggregate counters for admin (requests, tokens, cost, errors).

### HTTP / server API surface
- `POST /api/chats/[id]` — **core streaming handler**. Body `{ messages:
  UIMessage[] }` validated by `safeValidateUIMessages`. Optional `x-page-path`
  header (post slug context). Runs rate-limit → persist user msg (if logged in)
  → `createMCPClient` to `${origin}/mcp` → `streamText` →
  `createUIMessageStreamResponse`. On finish: persist assistant messages + bump
  chat counters + `agentStats`.
- `GET /api/chats`, `POST /api/chats` — list / create (requireUserSession).
- `GET /api/chats/[id]`, `DELETE /api/chats/[id]`.
- `PATCH /api/chats/[id]/title`, `PATCH /api/chats/[id]/visibility`.
- `POST /api/chats/[id]/branch`, `DELETE /api/chats/[id]/messages`.
- `GET`/`POST /api/chats/[id]/votes`.
- `GET /auth/github` — `defineOAuthGitHubEventHandler`, upsert user + session.

### `streamText` configuration (faithful to Nuxi)
- `model: 'anthropic/claude-sonnet-4.6'` (AI Gateway), `maxOutputTokens: 8000`,
  `maxRetries: 2`, `stopWhen: stepCountIs(10)`, `prepareStep` forces
  `toolChoice:'none'` on the last step, `providerOptions.gateway.caching:'auto'`,
  `experimental_transform: smoothStream()`, abort on request close.
- `tools`: `{ ...mcpTools, web_search: anthropic.tools.webSearch_20250305(),
  search_posts, show_post, report_issue }`.
- `system`: blog-specific system prompt builder (see below).

### System prompt
New persona prompt for **Blogi**, the blog's agent (the counterpart to nuxt.com's
"Nuxi"). Same structural rules as nuxt.com: identity (you are Blogi, NuxtPaper's
companion), current-page mapping (`/posts/<slug>` → `get-post`), tool-usage
discipline (never call same tool twice with same path; prefer `show_post` card),
formatting (no markdown headings, root-relative links, concise), date line,
web-search restraint.

### MCP server (`server/mcp/tools/posts/*`, route `/mcp`)
- `list-posts` — title/slug/tags/pubDatetime over the `posts` collection.
- `get-post` — full markdown of one post by path (optional `sections`).
- `search-posts` — query the content via the same index `useSearch.ts` builds.
Configured with `mcp: { name: 'NuxtPaper', route: '/mcp' }` in nuxt.config.

### AI-SDK tools (`server/utils/tools/*`)
- `show_post` — returns structured post data → rendered as an AstroPaper
  `PostCard` inside the chat (UI/action side, like Nuxi `show_module`).
- `search_posts` — wraps the existing `minisearch` index (already a dep).
- `report_issue` — fallback when the agent can't resolve a question.

### Frontend
- `useAgentChat` composable wrapping `@ai-sdk/vue` `Chat` +
  `DefaultChatTransport({ api: '/api/chats/[id]' })`, `x-page-path` header,
  optimistic voting, title-stream handling. `useChats` for the history list.
- `/chat` (history + new chat) and `/chat/[id]` pages under a `chat` layout.
- Humble components: `AgentChatMessages`, `AgentChatPrompt`, `ChatTitle`,
  `ChatMessageActions` (vote), styled with existing theme tokens.
- Assistant markdown rendered with `@nuxt/content`'s `<MDC>` so prose matches
  `typography.css`.

## Open Non-Blocking Notes
- **Agent name = "Blogi"** (decided). Used in the system prompt identity, UI
  labels (chat header, empty-state, send button placeholder), and meta/SEO.
  Voice still to refine, but the name is fixed.
- **`evlog`** — nuxt.com uses it for AI logging/cost. Treated as optional;
  compute usage/cost from AI SDK `onFinish` metadata + a static per-token cost
  map instead, to avoid pulling in their observability stack. Revisit if real
  telemetry is wanted.
- **Streaming duration** — set `maxDuration` on the chat function; confirm
  Vercel plan limits cover long tool-looping turns.
- **Admin surface** — admin MCP tools gated by `NUXT_AGENT_ADMIN_TOKEN`; a UI
  dashboard for them is out of scope for v1.

## Tasks

- **Wave 1 — Foundation (single slice; everything else depends on it):**
  - Config, deps & deployment · owns `package.json` (add `ai`, `@ai-sdk/vue`,
    `@ai-sdk/anthropic`, `@ai-sdk/mcp`, `@nuxtjs/mcp-toolkit`, `nuxt-auth-utils`,
    `drizzle-orm`, `@libsql/client`, `-D drizzle-kit`; remove `better-sqlite3`),
    `nuxt.config.ts` (add modules `nuxt-auth-utils` + `@nuxtjs/mcp-toolkit`;
    `mcp` block; nitro `vercel` preset + route rules: prerender content pages,
    dynamic `/api/**` + `/chat/**`; `runtimeConfig.oauth.github`, session,
    `aiGatewayApiKey`), `drizzle.config.ts`, `.env.example`,
    `.github/workflows/deploy.yml` (retire Pages deploy → Vercel git integration
    or `vercel` CLI; keep `ci.yml` lint/type/test), `README.md` deploy section ·
    depends: none

- **Wave 2 — parallel (disjoint files, depend on Wave 1):**
  - DB schema + client · owns `server/db/schema.ts`, `server/utils/db.ts`,
    `drizzle/` migrations · depends: Wave 1 — *contract for all DB consumers*
  - MCP content server · owns `server/mcp/tools/posts/list-posts.ts`,
    `get-post.ts`, `search-posts.ts` (+ optional resources) · depends: Wave 1
  - AI-SDK tools · owns `server/utils/tools/show-post.ts`, `search-posts.ts`,
    `report-issue.ts` · depends: Wave 1
  - Shared types · owns `shared/types/agent.ts`, `chat.ts`, `tools.ts`,
    `shared/utils/chat.ts` · depends: Wave 1

- **Wave 3 — parallel (depend on Wave 2):**
  - Auth · owns `server/routes/auth/github.get.ts`, user-upsert util · depends:
    DB schema (users table)
  - Chat utils · owns `server/utils/rate-limit.ts`, `server/utils/stats.ts`,
    `server/utils/generate-chat-title.ts` · depends: DB schema
  - Core streaming handler · owns `server/api/chats/[id].post.ts` · depends: DB
    schema, MCP server, AI-SDK tools, shared types, chat utils, auth session
  - Chat CRUD routes · owns `server/api/chats/index.{get,post}.ts`,
    `[id].{get,delete}.ts`, `[id]/title.patch.ts`, `[id]/visibility.patch.ts`,
    `[id]/branch.post.ts`, `[id]/messages.delete.ts`, `[id]/votes.{get,post}.ts`
    · depends: DB schema, shared types, auth

- **Wave 4 — parallel (frontend, depend on Wave 3 API; Thiessen patterns + AstroPaper style):**
  - Chat composables · owns `app/composables/useAgentChat.ts`,
    `app/composables/useChats.ts` · depends: chat API routes
  - Chat pages + layout · owns `app/pages/chat/index.vue`,
    `app/pages/chat/[id].vue`, `app/layouts/chat.vue` · depends: composables
  - Chat components · owns `app/components/agent/AgentChatMessages.vue`,
    `AgentChatPrompt.vue`, `app/components/chat/ChatTitle.vue`,
    `ChatMessageActions.vue` (assistant markdown via `<MDC>`; reuse `PostCard`
    for `show_post`) · depends: composables, shared types
  - Auth entry UI · owns login button in `app/components/AppHeader.vue` +
    `app/pages/login.vue` · depends: auth route

**Verification**
1. `pnpm lint && pnpm typecheck && pnpm test` all green.
2. Local: `pnpm dev`, sign in with GitHub, send a message on `/chat`, confirm
   streaming text, a `show_post` card, and a `search_posts` result.
3. Hit `/mcp` with the AI-SDK MCP client (or the mcp-toolkit eval harness) and
   confirm `list-posts`/`get-post`/`search-posts` respond.
4. Verify rate limit (set a low cap, exceed it → 429), title auto-generation,
   and vote persistence round-trip.
5. Run `vue-reviewer` agent on every new Vue component (project rule).
6. Deploy a Vercel preview; confirm content pages are prerendered (static) and
   the chat function streams in production, key never reaching the client.
```
