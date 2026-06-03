---
title: "When the assistant sleeps"
summary: "A follow-up to The remembering assistant. The claim that nothing is silently absorbed no longer fully holds. A nightly consolidation pass took it over, with explicit gates and a rollback handle."
publishDate: 2026-06-03
tags: ["memory", "automation", "ai-tooling"]
related: ["the-remembering-assistant", "self-hosted-rag-claude-max"]
sources:
  - label: "Sleep-time consolidation system notes"
    kind: memory
  - label: "Site project page on the exocortex stack"
    kind: site
status: published
---

Two weeks ago I wrote that the memory layer never silently absorbs anything. Every fact got in because I had read it on a Sunday morning and chosen to keep it. The default was forget. The exception was keep, and the exception required a reason.

That rule still holds. The actor enforcing it changed.

What changed is that the system grew a sleep cycle. A small program runs at two in the morning, reads everything I drafted that day into a candidate list, and decides for each candidate whether it gets promoted into the long-lived memory files or stays in the inbox for me to review. At three thirty, a second pass applies those decisions to disk. By the time I am awake, the system has already done what I used to do by hand on a Sunday morning, and the file diff is sitting in git for me to read.

The pattern has a name. It is called sleep-time consolidation, and there is recent research that describes it formally for language-model agents. The idea is older than the research. Cognitive science has called this hippocampal to neocortical consolidation for decades, the process by which the brain takes the noisy episodic events of the day and folds them into stable semantic structure overnight. The fact that two communities, one biological and one computational, converged on the same architecture is not a coincidence. It is what happens when the constraints are the same. Working memory is small, the world is large, and the conversion has to happen at a moment when no new input is competing for the bandwidth.

The honest version of what the consolidator can and cannot do.

**What it can do.** Promote a candidate fact silently when all of these hold: the classifier rated it high confidence, the candidate names a specific destination file, the candidate does not contradict anything already in memory, and the topic was not actively in conversation in the last twenty-four hours. The last gate matters because a fact that is still moving in conversation is not a fact yet. It is a draft of one.

**What it cannot do.** Touch anything classified as identity, health, finance, or legal. These always surface for me to review, even when the classifier is confident. A confident classifier on the wrong category is exactly the kind of error that I cannot afford in those four domains, and the cost of having me read four flagged items per week is much smaller than the cost of an autonomous edit to a file that describes who I am or what I owe.

**What can be undone.** Every nightly apply is wrapped in two git commits, one before, one after. The before commit is the rollback handle. If I look at the morning diff and disagree, one command takes the system back to the state I left it in last night. The cost of a wrong promotion is, at worst, thirty seconds and a commit message.

The framing I want to keep honest about this. The assistant did not get smarter. It got a sleep cycle. There is no model of me running in the background between sessions. There is a classifier that reads what I said today, an applier that writes it to disk, and a log I can revert. The smartness, such as it is, lives in the schema and the gates, not in the system "knowing me."

When I wrote the previous note I called the default forget and the exception keep. That structure still holds. The only difference is that I am no longer the only entity allowed to make the call. The cron has a vote on the easy ones, with the receipts to prove its work. The hard ones, I still see.
