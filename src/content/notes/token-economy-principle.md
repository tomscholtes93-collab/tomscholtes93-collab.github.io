---
title: "The token economy principle"
slug: "token-economy-principle"
summary: "Why the general ledger should never enter the context window, and what that constraint forces you to design instead."
publishDate: 2026-05-16
tags: ["principles", "design", "llms"]
related: ["self-hosted-rag-claude-max", "mcp-workstream"]
sources:
  - label: "Personal design notes"
    kind: notion
  - label: "Practical experience routing data through Claude Code"
    kind: memory
status: published
---

The single most useful constraint I have adopted while building automation around LLMs is this: the general ledger never enters the context window.

By "general ledger" I mean any large, structured, transactional dataset that you would normally hand to a SQL engine, a pivot table, or a reconciliation script. Hundreds of thousands of rows. Long histories. Things that already have a natural query layer.

The temptation, when you start, is to paste a slice of it into the prompt and ask the model to compute. Two columns of figures, a date range, "find the discrepancies". The model will try. Sometimes it will even succeed. But you are paying a real cost that is invisible at first: every token you spend rendering raw data is a token not spent on reasoning. The bill is not financial, it is cognitive. The model has less room to think because it is busy reading.

The principle I now follow: the data lives where it lives. The context window carries the *question*, the *schema*, and the *result of one targeted query*. That is it. The model is the analyst, not the database.

In practice this looks like:

- A trial balance is not pasted into the prompt. The prompt says, "here is the schema and the filename; ask for the slice you need."
- A reconciliation is not asked of the model directly. The model writes the script, the script runs against the file, the result comes back as a small table.
- A long PDF is not summarised in one shot. The model is told the chapter structure, asked which sections matter, fed only those.

This forces a particular discipline on the system around the model. You need a tool layer the model can call, a small set of typed actions, a way to land results back into context without bloating it. MCP plays a part here. So does just having well-named files on disk that the model can read on demand.

A few corollaries I have learned to respect.

**Retrieval is not the same as ingestion.** Ingesting a corpus means dumping it into context. Retrieving means asking, "what part of this corpus is relevant to the question I have right now", and bringing back only that. The first scales badly. The second is what humans actually do when they read.

**Schemas are cheap, data is expensive.** Describing the *shape* of a dataset in fifty tokens costs almost nothing and lets the model reason about queries against it. Describing every row in the dataset costs everything and lets the model reason about almost nothing.

**The window is a working memory, not a hard drive.** Treat it the way a human treats the desk: a small surface for the artefacts of the current decision, kept tidy because clutter is what makes you forget.

The reason this matters, beyond cost and beyond speed, is that the model behaves differently when it is not buried under data. It asks better questions. It admits when it does not know. It stops hallucinating numbers from columns it has only half-read. Those are not properties of the model, they are properties of the conversation. You design the conversation by deciding what goes into the window and what does not.

If a workflow seems to require the entire ledger in context, that is a sign that the workflow is doing analysis the LLM should not be doing. Move the analysis to the system. Keep the model for the parts only the model can do: framing, judgement, language.
