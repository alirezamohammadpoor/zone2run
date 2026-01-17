---
name: dev-journal
description: Auto-generate structured dev journal entries from conversation context. Triggers on "dev journal", "generate journal", "journal this session", "log this session", or end-of-session journaling requests. Scans the current conversation for technical work and outputs a ready-to-paste journal entry.
---

# Dev Journal Generator

Generate a structured dev journal entry by analyzing the current conversation.

## Process

1. Scan conversation for:
   - Code changes and implementations
   - Debugging sessions and fixes
   - Architecture decisions
   - Performance optimizations (before/after metrics)
   - Configuration changes
   - Learnings and gotchas (explicit or implicit)

2. Group related work by feature or area

3. Extract learnings even when not explicitly stated (e.g., "had to add X because Y" → learning about Y)

4. Omit empty sections

## Output Format

```markdown
## DD MMM YYYY

### [Session Title - descriptive, searchable]

**What I Did**

- [Grouped by feature/area, technical but scannable]
- [Use sub-bullets for related details]

**Results** (only if metrics/outcomes exist)

- [Before/after numbers, improvements achieved]

**Key Learnings**

- [Reusable insights, gotchas, patterns discovered]
- [Frame as future-reference: "X requires Y" not "I learned that..."]

**Next** (only if unresolved items exist)

- [Blockers, queued work, open questions]
```

## Style Rules

- Concise but complete enough to understand 6 months later
- Technical depth: assume stack knowledge, skip basics
- Direct tone, no fluff or filler
- Session title should be specific and searchable (e.g., "ISR + Performance Push" not "Working on site")
- Learnings as declarative statements: "Next.js 15 requires explicit fetch cache config" not "I learned that..."
- Group related items, don't list chronologically
