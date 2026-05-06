# ADR-0006: RAG with Google Embeddings via Secure Backend

## Status

Accepted

## Context

MakedoTest currently supports AI-oriented JSON import but has no retrieval layer for curriculum-aware assistance, contextual hints, or controlled content grounding. We need:

- Classroom-safe AI behavior grounded in approved content.
- Better factual consistency for generated suggestions.
- A production-safe architecture that avoids exposing model secrets in the browser.

## Decision

Implement Retrieval-Augmented Generation (RAG) with Google Embeddings through a backend proxy.

- Embeddings provider: Google Embeddings ("Embeddings 2" target; exact model string remains env-configurable).
- Retrieval strategy: cosine similarity over stored vectors, with namespace isolation per school/tenant.
- Runtime flow:
  1. Ingest source documents (curriculum, question bank, teacher notes).
  2. Chunk and embed text on backend.
  3. Store vectors + metadata in vector storage.
  4. On query, embed user question, retrieve top-k chunks, pass context to generation model.
  5. Return answer with citations and confidence metadata.

## Why backend proxy is mandatory

- Browser code is public; embedding/model keys cannot be trusted client-side.
- Backend enforces rate limits, authz, audit logs, and prompt/content policy filtering.
- Backend can perform safety checks and namespace access control.

## Boundaries in this repository

- Frontend owns:
  - RAG client adapter (`src/features/rag/ragClient.js`)
  - Local chunking/retrieval utilities for deterministic tests and fallback tooling.
- Backend owns:
  - Google API calls
  - Vector write/read
  - Multi-tenant authorization
  - Observability, retries, and idempotency

## API contract (frontend -> backend)

- `POST /api/rag/index`
  - request: `{ namespace, items: [{ id, text, metadata }] }`
  - response: `{ ok, upserted }`
- `POST /api/rag/query`
  - request: `{ namespace, query, topK }`
  - response: `{ ok, matches: [{ id, text, score, metadata }] }`

## Operational requirements for production

- Secrets in server environment only.
- Per-user or per-school authorization for namespaces.
- Request timeouts and retry budget.
- Structured logs + tracing.
- SLOs:
  - P95 retrieval latency < 900ms
  - Error rate < 1%
- Cost controls:
  - max chunk count per ingestion request
  - max topK and query length

## Rollout plan

1. Ship frontend RAG adapter and testable retrieval utils.
2. Deploy backend proxy in staging.
3. Ingest one pilot curriculum namespace.
4. Pilot with a small teacher cohort.
5. Enable progressively behind feature flag.

## Consequences

- Pros:
  - Better answer grounding and classroom relevance.
  - Safer production posture.
  - Clear extensibility for analytics/citation quality.
- Cons:
  - Additional backend complexity.
  - Vector infra and monitoring cost.
