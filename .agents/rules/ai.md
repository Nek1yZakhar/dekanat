# AI Assistant & RAG Invariants

## 1. Grounding & Anti-Hallucination
- The Deanery AI Assistant answers strictly from retrieved fictional university regulations (`regulation_chunks` table).
- When answering regulatory questions (transfers, retakes, academic leaves, scholarships), the assistant MUST cite the exact article/clause from the regulation chunks.
- If a question cannot be resolved using the retrieved chunks, the assistant must explicitly state that the regulation does not contain this rule and recommend contacting staff at `/requests`.

## 2. Server-Only Execution & Stream Protocol
- LLM API calls execute strictly in server route handlers (`app/api/ai/chat/route.ts`).
- AI provider keys (`AI_API_KEY`, `OPENAI_API_KEY`) must never be leaked to client bundles or browser network payloads.
- Responses stream to the client using Server-Sent Events (SSE) or standard ReadableStream.

## 3. Offline Heuristic Fallback
- If `AI_API_KEY` is omitted or provider unreachable, the assistant routes to a deterministic keyword/similarity heuristic over the local regulation dataset, returning matched clauses and citations without failure.

## 4. Prompt Versioning
- System prompts are stored as versioned Markdown files in `prompts/` (e.g., `prompts/deanery-assistant.md`). No hidden, unversioned prompt strings inside code.
