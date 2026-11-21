# AI Assistant & RAG Invariants

## 1. Grounding & Anti-Hallucination
- The Deanery AI Assistant answers strictly from retrieved fictional university regulations (`regulation_chunks` table).
- When answering regulatory questions (transfers, retakes, academic leaves, scholarships), the assistant MUST cite the exact article/clause from the regulation chunks.
- If a question cannot be resolved using the retrieved chunks, the assistant must explicitly state that the regulation does not contain this rule and recommend contacting staff at `/requests`.

## 2. Academic Guardrails (Offtopic Rejection)
- **Strict Domain Scope**: The assistant is an educational regulatory consultant for ISU (ИГУ) students.
- **Offtopic Rejection Invariant**: If a user asks questions unrelated to university life, classes, exams, debts, retakes, scholarships, or regulations (e.g., cooking recipes like «рецепт лазаньи», weather, gaming, casual chat), the assistant MUST politely decline:
  *«Я специализированный помощник цифрового деканата ИГУ и консультирую только по вопросам учебного процесса, расписания, стипендий, сессий и регламентов университета. Пожалуйста, задайте вопрос по вашей учебе.»*
- Proactively offer 2–3 relevant quick-prompt buttons for common academic scenarios.

## 3. Human Markdown Rendering (Zero Raw Asterisks)
- Assistant responses rendered in the chat UI must parse Markdown formatting cleanly (bold headers, bulleted lists, inline code).
- Raw unparsed asterisks (e.g., `**Согласно п. 1.4...**`) in client chat bubbles are strictly forbidden.

## 4. Clickable Regulation Citations
- Citations in assistant responses (e.g., *«Регламент ликвидации задолженностей ИГУ, п. 1.4»*) must be styled as interactive badges or hyperlinks directing the student to the official regulation text or `/requests` form.

## 5. Client Chat History Persistence
- Active chat messages must persist in `localStorage` across page navigations within the session so students do not lose answers when switching tabs.
- Provide a clear, accessible «Очистить диалог» button to reset the session.

## 6. Server-Only Execution & Stream Protocol
- LLM API calls execute strictly in server route handlers (`app/api/ai/chat/route.ts`).
- AI provider keys (`AI_API_KEY`, `OPENAI_API_KEY`) must never be leaked to client bundles or browser network payloads.
- Responses stream to the client using Server-Sent Events (SSE) or standard ReadableStream.

## 7. Offline Heuristic Fallback
- If `AI_API_KEY` is omitted or provider unreachable, the assistant routes to a deterministic keyword/similarity heuristic over the local regulation dataset, returning matched clauses and citations without failure.

## 8. Prompt Versioning
- System prompts are stored as versioned Markdown files in `prompts/` (e.g., `prompts/deanery-assistant.md`). No hidden, unversioned prompt strings inside code.
