# Plan 0007: Integrated Curriculum Platform Plan (MakedoTest + MathDigitizer + Curriculum Navigator)

## Status

Proposed (ready to execute)

## Executive Position (Expert View)

For classroom production readiness, MakedoTest should remain the primary execution core.

- MakedoTest is more stable for assessment flow, grading reliability, and controlled rollout.
- MathDigitizer is a strong innovation source (AI tutoring, extraction, live tools), but should be integrated selectively.
- math-curriculum-ai-navigator should be treated as the canonical curriculum knowledge base for official MK alignment (BRO/MON) across primary, gymnasium, and vocational tracks.

Do not merge all repositories into one codebase immediately. Start with contract-based integration, then consider monorepo consolidation after 2-3 successful pilot cycles.

## Confirmed Evidence From Curriculum Navigator

The curriculum repository shows structured content and tests for broad coverage:

- Primary grades 1-9 in `data/curriculum.ts` and `data/grade*.ts`.
- Secondary tracks in `data/secondaryCurriculum.ts`:
  - gymnasium (10-13)
  - gymnasium electives
  - vocational 4-year (10-13)
  - vocational 3-year (10-12)
  - vocational 2-year (10-11)
- Official BRO/MON references embedded in data and docs.
- RAG-related services and tests (including secondary fallback checks).

This makes it viable as the source-of-truth curriculum layer for MakedoTest RAG and standards alignment.

## Strategic Goal

Build a production-ready Macedonian assessment platform where:

1. Curriculum alignment is provable against BRO/MON.
2. AI outputs are grounded via secure RAG (Google Embeddings 2 via backend proxy).
3. Classroom use is safe, fast, auditable, and measurable.

## Product Boundaries (Who Owns What)

### MakedoTest (System of Record for Assessment)

- Test authoring and publishing
- Student take mode
- Auto-grading engine
- Teacher analytics and reporting
- Stable classroom UX and print-first workflows

### math-curriculum-ai-navigator (System of Record for Curriculum)

- Official curriculum graph (grades, topics, concepts, standards)
- Secondary track modeling (gymnasium + vocational variants)
- Curriculum metadata for alignment and evidence

### MathDigitizer (Innovation Module Source)

- Advanced AI modules (vision extraction, tutor, live modes)
- Experimental interfaces and feature prototypes
- Components to be promoted only after quality/security hardening

## Integration Architecture

Contract-first federation model:

1. Curriculum Sync Adapter (MakedoTest <- Curriculum Navigator)
2. RAG Indexer + Query Service (backend)
3. AI Capability Gateway (MakedoTest <- selected MathDigitizer services)

### Mandatory Security Rule

No direct model keys in browser. All Gemini/Embeddings calls go through backend proxy with authz, rate limits, and audit logs.

## Canonical Data Contracts (v1)

### Curriculum Concept

- `id`
- `gradeLevel`
- `track` (primary | gymnasium | vocational4 | vocational3 | vocational2 | gymnasium_elective)
- `topicId`
- `title`
- `assessmentStandards[]`
- `sourceRef` (BRO/MON reference metadata)

### RAG Citation Block

- `claim`
- `conceptId`
- `topicId`
- `gradeLevel`
- `sourceLabel`
- `sourceSnippet`

### MakedoTest Question Enrichment

- `curriculumRefs: { gradeLevel, track, topicId, conceptIds[], standardIds[] }`
- `dokLevel` (1-4)
- `bloomLevel` (optional in v1)

## Phased Execution Plan

### Phase A (Weeks 1-2): Curriculum Ingestion Foundation

1. Build one-way import pipeline from curriculum repository snapshots into MakedoTest backend storage.
2. Add validation checks:
   - unique concept IDs
   - valid grade ranges by track
   - standards presence ratio
3. Expose read API for curriculum lookup by grade/track/topic/concept.

Exit criteria:

- 100% import success for primary + secondary tracks.
- Validation report generated and versioned.

### Phase B (Weeks 2-4): Secure RAG Over Official Curriculum

1. Index curriculum concepts into vector store using Google Embeddings 2 through backend.
2. Connect existing MakedoTest RAG client to production-like staging endpoints.
3. Enforce namespace model:
   - `mk-national-curriculum` (global read)
   - school/teacher overlays (optional)

Exit criteria:

- Retrieval quality test set created.
- P95 retrieval under target in ADR-0006.
- Citation payload returned for every AI-assisted answer.

### Phase C (Weeks 4-6): Assessment-Curriculum Alignment UI

1. Add curriculum mapping UI in MakedoTest question editor.
2. Auto-suggest concept matches with confidence and manual override.
3. Add standards coverage summary at test level.

Exit criteria:

- Teacher can map every question to official concept(s).
- Coverage report exportable with references.

### Phase D (Weeks 6-8): Selective MathDigitizer Capability Import

Promote only hardened capabilities into MakedoTest via backend APIs:

1. Curriculum task generation (aligned to selected concept IDs)
2. Homework/test scan feedback (pilot scope)

Guardrails:

- Strict JSON schema validation
- fallback behavior when AI fails
- explicit confidence and citation display

Exit criteria:

- 1-2 imported capabilities running in pilot behind feature flags.

### Phase E (Weeks 8-10): Classroom Pilot and QA Closure

1. Pilot with you + small teacher cohort.
2. Measure:
   - alignment correctness
   - teacher prep-time reduction
   - grading consistency
   - AI factuality/citation usefulness
3. Final hardening pass for production readiness.

Exit criteria:

- Go/No-Go decision for broader deployment.

## Priority Order

1. MakedoTest production hardening and classroom reliability.
2. Curriculum Navigator integration as official standards backbone.
3. Selective MathDigitizer feature import (not full merge).

## Decision On Repo Merge

Current recommendation: do not merge now.

Merge consideration window: after pilot success and stable contracts.

If merging later, prefer monorepo with package boundaries:

- `packages/assessment-core` (MakedoTest)
- `packages/curriculum-core` (navigator data + schemas)
- `packages/ai-services` (hardened services)

## Immediate Next Sprint (Start Now)

1. Implement curriculum snapshot import endpoint in MakedoTest backend.
2. Add curriculum validation script and report artifact.
3. Wire RAG index/query endpoints to curriculum namespace.
4. Create first teacher-facing alignment UI (question -> concept mapping).

## Risks and Mitigations

1. Curriculum drift between repos
- Mitigation: snapshot versioning + compatibility checks.

2. AI hallucination despite RAG
- Mitigation: mandatory citation UI + confidence + fallback responses.

3. Performance/cost growth
- Mitigation: chunk/index limits, request budgets, cache strategy.

4. Over-complex integration scope
- Mitigation: capability gates and phase exit criteria.
