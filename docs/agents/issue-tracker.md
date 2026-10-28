# Issue tracker for agents

This repository uses **local ticket files as the tracker**. There is no hosted
tracker to install, authenticate against, or keep in sync, and no plugin is
required to run a build.

## Where the tickets live

    .factory/tickets/<NN>-<slug>.md

One file per ticket. Each file carries four machine-checked headers:

    **Blocked by:** None | <ticket ids>
    **Engine:** opus | codex | local-exec
    **Files:** <space-separated path scopes this ticket may touch>
    **Acceptance-test:** <one runnable command, exit 0 = pass>
    **Covers:** REQ-1 REQ-2

The compiler reads the first four grammars. Anything ambiguous is a compile error
naming the offending line, so a ticket is never half-understood. `Covers` names the
SPEC.md requirements (`- **REQ-1** (objectives: anchor-id) ...`) the ticket delivers;
the design gate checks that every requirement is covered by a ticket.

Ticket 01 is always the walking skeleton: no blockers, it owns
`scripts/quality-gate.sh`, and its acceptance test runs `bash scripts/quality-gate.sh`.
Every other ticket depends on it.

Ticket completion is milestone completion. Original outcome anchors in INTENT.md
must be covered by .factory/COMPLETION.json and bound current proof. Default
factory audit, completion, and finalization use the shared objective evaluator.
Native supervisors close through factory close; no production journal is faked.

## Reading the state of a ticket

State lives in the run journal, not in the ticket file:

    .factory/runs/<run-id>/journal.jsonl

Use `factory status` to read it. Do not edit the journal by hand; it is
append-only and any edit that breaks the fold halts the run on purpose.

## Adding a ticket mid-run

Write the file, then run `factory plan --amend`. A silent edit is refused: the
run compares the compiled plan against the one it started with, and stops rather
than executing a plan nobody recorded.

## Hosted trackers

GitHub, Linear and Beads adapters are possible behind the same seam, and none of
them is a dependency. Local files stay the source of truth.
