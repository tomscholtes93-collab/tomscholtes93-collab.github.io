---
title: "The remembering assistant"
slug: "the-remembering-assistant"
summary: "Not a Jarvis. A reflection on what it would mean for the assistant in my glasses to remember the right things, and which things it should forget on purpose."
publishDate: 2026-05-16
tags: ["memory", "wearables", "design"]
related: ["self-hosted-rag-claude-max", "token-economy-principle"]
sources:
  - label: "Personal notes on the G2 stack"
    kind: notion
  - label: "Site project page on the exocortex stack"
    kind: site
status: published
---

When people see a heads-up display talking to a large language model, the reference they reach for is Jarvis. That comparison is doing a lot of work, and most of it is the wrong work. Jarvis is a character. What I am building, and even more so what I am thinking about while I build it, is the much smaller, much more useful thing in the shadow of that character: an assistant whose only superpower is that it remembers what I asked it to remember.

This is a first-person reflection, not a product claim. I am not trying to ship a Jarvis. I am trying to think clearly about what memory should and should not be in a personal AI stack, and the honest version of that thinking is more interesting than the marketing version.

The starting observation is that "memory" in current LLM products is mostly two things. The model has training-time knowledge, which is broad but frozen and not about me. And it has a context window, which is about now but fades the moment the conversation ends. Neither of those is what I mean when I say I want the assistant to remember.

What I want is closer to a logbook. Three properties.

**Explicit.** Things get into memory because I said so, or because a rule I wrote said so. Nothing is silently absorbed. If the assistant remembers a date, a preference, or a decision, I can point at the line where it was written.

**Inspectable.** The store is a directory of small text files, not an embedding cloud I cannot see. I can read everything that is "in memory" at any moment. There is no surprise.

**Bounded.** Memory has a quota. New facts displace old ones unless I promote them. The default is forget. The exception is keep, and that exception requires a reason.

The reason this shape matters is not nostalgia for plaintext. It is that all three properties are what make the assistant feel like a tool rather than a presence. A presence remembers everything and you cannot tell what. A tool remembers what you asked it to and you can tell exactly what.

This is also the part where I have to be honest about what is built and what is just sitting in my head.

What is built: a small file-based memory layer that the local agent reads at session start. It knows things I have explicitly told it: my languages, the project I am working on, the books I am tracking. It is allowed to propose new memories at the end of a session; I read the proposals on weekends and either keep them or strike them through.

What is not built: anything that would deserve a name like Jarvis. There is no autonomous behaviour. No proactive nudges. No "ambient" awareness of what I am doing. The assistant is, at all times, asleep until I speak to it. That is by design and not by laziness. The first time I let an agent decide on its own when to interrupt me will be after I have understood why I want to be interrupted, and I have not understood that yet.

A few honest constraints that show up when you try to design memory carefully.

**Forgetting is harder than remembering.** Adding facts is one line. Pruning them requires a policy. I currently use a weekly review to do this by hand, which is not scalable, but it is teaching me what the policy should look like.

**Most "memories" are noise.** The interesting facts about a week are five or six. Everything else is journaling. The point of a memory layer is to surface the five, not to log the rest.

**The voice of the assistant is mostly the voice of its memory.** If memory is curated, the assistant sounds curated. If memory is dumped, the assistant sounds like a chatbot trying to remember your birthday.

The frame I keep coming back to: I do not want an assistant that pretends to know me. I want one that holds the small set of things I have asked it to hold, and is honest about the limits of that set. That is much less than Jarvis, and much more useful.
