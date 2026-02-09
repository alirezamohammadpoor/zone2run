---
name: study-doc-generator
description: Generate structured study documents from raw notes, problems, or topics. Triggers on "study doc", "study document", "learning doc", "create a study note", "I want to learn about", "help me understand", or when user shares rough notes/context and wants a structured reference document. Outputs markdown optimized for Notion. Can optionally create directly in Notion under "Next.js Study Documents" or "Private" databases.
---

# Study Document Generator

Transform raw input (notes, problems, context, or just a topic) into structured study documents optimized for learning and future reference.

## Input Types

- **Raw notes**: Bullet points, fragments, copy-pasted content
- **Problem context**: "I just solved X, want to understand it deeper"
- **Topic request**: "Create a study doc on [concept]"
- **Existing docs**: Restructure into study format

## Output Format

Generate markdown file. Target length: 300-500 lines (scale with topic complexity).

### Section Selection

Include only relevant sections. Skip sections that don't apply to the topic.

**Core sections (include when relevant):**

| Section                 | When to Include                                |
| ----------------------- | ---------------------------------------------- |
| ELI5                    | Always — 2-3 sentences, assumes dev background |
| The Problem This Solves | When there's a clear pain point or use case    |
| Core Concept            | Always — mechanical "how it works"             |
| Code Examples           | Dev/technical topics only                      |
| Common Mistakes         | When pitfalls exist and matter                 |
| Performance Impact      | When measurable/quantifiable differences exist |
| Interview Questions     | Technical topics — Q&A format for recall       |
| Quick Reference         | When tables/checklists aid scanning            |
| Resources               | When quality external links exist              |

### Template

````markdown
# [Topic Title]

> **ELI5 (Dev Edition):** [2-3 sentence explanation assuming basic dev knowledge. What is this thing and why should I care?]

---

## The Problem This Solves

[What pain/friction exists without this? Why does it matter? Keep it concrete.]

---

## Core Concept

[How it actually works. Mechanical explanation. Can include:]

- Process flow
- Key terminology
- Mental model

[ASCII diagrams when they clarify:]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Input │ ──▶ │ Process │ ──▶ │ Output │
└─────────────┘ └─────────────┘ └─────────────┘

---

## Code Examples

[Practical patterns. Pseudocode or real code. Annotate what matters.]

### Basic Usage

```[language]
// Pattern description
[code]
```
````

### Advanced Pattern

```[language]
// When to use this variant
[code]
```

---

## Common Mistakes

### 1. [Mistake name]

```[language]
// ❌ Wrong
[bad code]

// ✅ Correct
[good code]
```

**Why:** [Brief explanation]

### 2. [Mistake name]

[Continue pattern...]

---

## Performance Impact

| Approach   | Impact              |
| ---------- | ------------------- |
| [Option A] | [Quantified result] |
| [Option B] | [Quantified result] |

[Additional context if needed]

---

## Interview Questions

**Q: [Question]**

> "[Concise answer suitable for interview context]"

**Q: [Question]**

> "[Answer]"

---

## Quick Reference

| [Column 1] | [Column 2] | [Column 3] |
| ---------- | ---------- | ---------- |
| [data]     | [data]     | [data]     |

---

## Summary

[3-5 bullet takeaways. What to remember.]

- Key point 1
- Key point 2
- Key point 3

---

## Resources

- [Resource name](url) — [one-line description]
- [Resource name](url) — [one-line description]

```

## Writing Guidelines

1. **ELI5 Dev Edition**: Assume reader knows React, HTTP, basic CS. Skip true beginner explanations.

2. **Concrete over abstract**: Use specific examples, not theoretical descriptions.

3. **Tables for comparison**: When comparing options, approaches, or properties—use tables.

4. **ASCII diagrams**: Include when visualizing flow, architecture, or relationships aids understanding.

5. **Code annotations**: Comment the non-obvious. Skip explaining syntax.

6. **Interview answers**: Write as if speaking to an interviewer—concise, confident, demonstrates understanding.

7. **No fluff**: Every sentence should teach something. Cut filler.

## Output Delivery

**Default**: Create markdown file, present to user for copy-paste to Notion.

**If user requests Notion integration**: Use Notion MCP to create page in specified database:
- "Next.js Study Documents" — technical/dev topics
- "Private" — personal/non-technical topics

## Examples

**Input**: "I just implemented ISR with on-demand revalidation using webhooks. Want a study doc."

**Output**: Study doc covering ISR mechanics, revalidation strategies, webhook integration patterns, common gotchas, interview angles.

---

**Input**: "Study doc on SQL indexes"

**Output**: Study doc covering index types, B-tree mechanics, when to index, query planning, common mistakes (over-indexing, missing composite indexes), performance benchmarks.

---

**Input**: Raw bullet points about caching strategies

**Output**: Restructured study doc synthesizing the notes into organized sections with added context, examples, and interview prep.
```
