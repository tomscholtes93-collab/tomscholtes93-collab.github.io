---
title: "A self-hosted RAG on Claude Max"
slug: "self-hosted-rag-claude-max"
summary: "OpenKB, Meridian, and a Claude Max OAuth route. Notes on building a personal retrieval-augmented stack with no per-token API bill."
publishDate: 2026-05-16
tags: ["rag", "self-hosted", "knowledge"]
related: ["token-economy-principle", "the-remembering-assistant"]
sources:
  - label: "Site project page on the exocortex stack"
    kind: site
  - label: "OpenKB compile and query notes"
    kind: notion
status: published
---

I wanted a personal knowledge base that I could query from a smart-glasses voice command, with no monthly token bill, no third-party indexing service, and no opaque hosted RAG product in the middle. The stack I ended up with has three named parts and a clear economic shape.

**OpenKB** is the index. It takes the documents I care about (papers, contracts, reference material, personal notes) and compiles them into a queryable wiki with cross-document links. It exposes itself to Claude Code as a stdio MCP server, which means a Claude session can ask it questions through a typed tool interface. The compile step does its own LLM call internally; I have it set to Sonnet, because the linking is better than at smaller sizes and the speed difference does not matter for a background job.

**Meridian** is the router. It is a small always-on service that holds an OAuth session to Claude Max and presents an OpenAI-shaped endpoint locally. Anything in my house that wants to talk to a Claude model talks to Meridian first. Meridian then talks to Claude through the OAuth route, which is the part that flips the marginal cost from per-token to zero. The trade-off is rate limits instead of bills, which is the right trade for a personal stack.

**Claude Code** is the agent that ties the two together. When I ask a question that needs document context, it calls into OpenKB through MCP, gets back the relevant fragments, and answers. When I ask a question that does not, it answers directly. The routing is in the CLAUDE.md, not in the wire.

A few things this taught me that I would not have predicted.

**Self-hosted RAG is mostly about latency and trust, not cost.** The cost saving is real but it is not what makes the experience better. What makes it better is that the index lives on the same network as the agent, so a query feels like asking a colleague rather than calling a vendor. And I know exactly what is in the index because I put it there.

**The hardest part is not the retrieval; it is the curation.** A naive RAG over everything I have ever written is worse than a careful index of forty documents. The model is more useful when the corpus is smaller, more cohesive, and more semantically dense. I spent more time deciding what should not be in the index than what should.

**OAuth routing has an unforgiving failure mode.** If the API key is set in any shell anywhere on the host, the proxy is silently bypassed and the real metered API is hit. The first time I traced this I learned to grep my dotfiles for stray exports. Defensive habit now: unset that variable at the top of every entry point that should route through Meridian.

**The model knows when it is wearing a name tag.** Every response carries a small bracketed signal indicating which path served it: a direct call, a tool-augmented call, a slow opt-in escalation to a bigger model. This is not just diagnostic; it changes how I read the answer. A direct call is a confident guess. A tool-augmented call has receipts. The escalation answer is the considered one.

What I have not solved yet is the boundary between the personal index and the world. RAG is good when the answer lives in the index. The web search and the model's own training are good when it does not. The current routing is rules in a markdown file. The next step is to make those rules legible to the model itself, so it can choose at query time instead of having me describe the choice ahead of time.

For now, the stack runs, the bills are predictable, and the index grows about as fast as my attention does. That is roughly what I wanted.
