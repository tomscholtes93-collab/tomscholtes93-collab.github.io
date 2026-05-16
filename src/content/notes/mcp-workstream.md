---
title: "The MCP workstream"
slug: "mcp-workstream"
summary: "Wiring Outlook and Monday.com into Claude Code through MCP, and what it taught me about the scope of automation in regulated workflows."
publishDate: 2026-05-16
tags: ["mcp", "automation", "tools"]
related: ["self-hosted-rag-claude-max", "token-economy-principle"]
sources:
  - label: "Personal notes on MCP wiring"
    kind: notion
  - label: "Anthropic MCP specification"
    kind: external
status: published
---

I keep returning to a small distinction that, once you internalise it, reshapes how you think about office automation. There is the work of *doing the task*, and there is the work of *finding the task to do*. The first is local. The second is glued together from inboxes, calendars, project boards, and whatever the team uses to nudge each other in the morning.

For a long time, "automation" in my head meant the first kind. Write a script that processes a file. Build a macro that fills a template. The second kind felt too messy to touch, because the inputs lived in five separate places that did not know about each other.

The MCP workstream is the part of my week where I started taking the second kind seriously. The Model Context Protocol gives an LLM a typed, scoped way to talk to a specific external system. Concretely, I wired Outlook and a project board into one Claude Code session through MCP servers. Inbox triage on one side, task state on the other, a single agent that can read both and act on either. No new SaaS layer in between.

What surprised me was how much of the "finding the task" friction is just naming. Once the agent can ask, *what is unanswered in the inbox*, and separately, *what is open on the board*, the difference between those two queries collapses into one mental motion: where is the next thing for me. The agent does not have to be clever. It just has to be authoritative about the surface.

A few principles I am holding on to as I expand the workstream.

**Scope is the safety property.** Each MCP server only exposes a thin slice of an underlying system. The Outlook server can read mail and draft replies; it cannot empty a folder. The project board server can read columns and move cards; it cannot delete a workspace. The allow-list is the abstraction. Without it the model has too much surface and the wrong kinds of mistakes get cheap to make.

**The interesting glue is the prompt, not the protocol.** MCP is plumbing. It only gets you to the point where the data exists in one context. What you do with it, how you weight one signal against another, how you decide whether something is actually urgent, that is the prompt and the routing logic on top of it. The protocol does not save you from having to think.

**You can feel the latency budget.** Each tool call is a round trip. Two or three are fine. Twelve is a noticeable pause. This forces a useful discipline: fetch broadly once, then think with what you have, instead of asking a follow-up question per item.

The piece I have not solved is closing the loop in the other direction. Reading these systems is easy. Writing to them in a way that respects approvals, audit trails, and human-in-the-loop is the harder half. I think that is mostly a workflow question, not a protocol one. For now I have the agent stage drafts and changes; I press the button.

If I had to summarise what the workstream taught me in one line: MCP is not a magic adapter that automates your job. It is a way to make the lookup phase of your job cheap enough that the cognitive load shifts to the decisions you actually wanted to be making.
