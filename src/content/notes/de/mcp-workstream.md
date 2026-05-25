---
title: "Der MCP-Workstream"
summary: "Outlook und Monday.com über MCP in Claude Code anbinden, und was das über den Umfang von Automatisierung in regulierten Arbeitsabläufen gelehrt hat."
publishDate: 2026-05-16
tags: ["mcp", "automatisierung", "tools"]
related: ["self-hosted-rag-claude-max", "token-economy-principle"]
sources:
  - label: "Persönliche Notizen zur MCP-Verdrahtung"
    kind: notion
  - label: "Anthropic MCP-Spezifikation"
    kind: external
status: published
---

Ich komme immer wieder zu einer kleinen Unterscheidung zurück, die, sobald man sie verinnerlicht, die Art und Weise umformt, wie man über Büroautomatisierung denkt. Es gibt die Arbeit, *die Aufgabe zu erledigen*, und es gibt die Arbeit, *die Aufgabe zu finden, die zu erledigen ist*. Die erste ist lokal. Die zweite ist zusammengeklebt aus Postfächern, Kalendern, Projekt-Boards und allem, womit das Team sich morgens gegenseitig anstößt.

Lange Zeit bedeutete "Automatisierung" in meinem Kopf die erste Art. Ein Skript schreiben, das eine Datei verarbeitet. Ein Makro bauen, das eine Vorlage füllt. Die zweite Art fühlte sich zu unordentlich an, um sie anzufassen, weil die Inputs an fünf getrennten Orten lebten, die nichts voneinander wussten.

Der MCP-Workstream ist der Teil meiner Woche, in dem ich anfing, die zweite Art ernst zu nehmen. Das Model Context Protocol gibt einem LLM einen typisierten, eingegrenzten Weg, mit einem bestimmten externen System zu sprechen. Konkret habe ich Outlook und ein Projekt-Board über MCP-Server in eine Claude-Code-Session verdrahtet. Postfach-Triage auf der einen Seite, Aufgabenstand auf der anderen, ein einzelner Agent, der beide lesen und auf beiden handeln kann. Keine neue SaaS-Schicht dazwischen.

Was mich überraschte: wie viel von der "die Aufgabe finden"-Reibung einfach Benennung ist. Sobald der Agent fragen kann, *was im Postfach unbeantwortet ist*, und getrennt davon, *was auf dem Board offen ist*, fällt der Unterschied zwischen diesen beiden Abfragen in eine einzige mentale Bewegung zusammen: wo ist das nächste Ding für mich. Der Agent muss nicht clever sein. Er muss nur autoritativ über die Oberfläche sein.

Ein paar Prinzipien, an denen ich festhalte, während ich den Workstream ausbaue.

**Scope ist die Sicherheitsobergrenze.** Jeder MCP-Server stellt nur einen dünnen Ausschnitt eines darunterliegenden Systems bereit. Der Outlook-Server kann Mails lesen und Antworten entwerfen; er kann keinen Ordner leeren. Der Projekt-Board-Server kann Spalten lesen und Karten verschieben; er kann keinen Workspace löschen. Die Allow-Liste ist die Abstraktion. Ohne sie hat das Modell zu viel Oberfläche und die falsche Art von Fehlern wird billig.

**Der interessante Klebstoff ist der Prompt, nicht das Protokoll.** MCP ist Klempnerei. Es bringt einen nur an den Punkt, an dem die Daten in einem Kontext existieren. Was man damit macht, wie man ein Signal gegen ein anderes gewichtet, wie man entscheidet, ob etwas tatsächlich dringend ist, das ist der Prompt und die Routing-Logik darüber. Das Protokoll erspart einem das Denken nicht.

**Man spürt das Latenz-Budget.** Jeder Tool-Aufruf ist ein Roundtrip. Zwei oder drei sind in Ordnung. Zwölf sind eine spürbare Pause. Das erzwingt eine nützliche Disziplin: einmal breit holen, dann mit dem denken, was man hat, statt eine Folgefrage pro Element zu stellen.

Das Stück, das ich noch nicht gelöst habe, ist die Schleife in die andere Richtung zu schließen. Diese Systeme zu lesen ist einfach. In sie zu schreiben, auf eine Art, die Freigaben, Audit-Trails und Human-in-the-Loop respektiert, ist die schwierigere Hälfte. Ich denke, das ist überwiegend eine Workflow-Frage, keine Protokoll-Frage. Vorerst lasse ich den Agenten Entwürfe und Änderungen vorbereiten; ich drücke den Knopf.

Wenn ich in einer Zeile zusammenfassen müsste, was der Workstream mich gelehrt hat: MCP ist kein magischer Adapter, der die Arbeit automatisiert. Es ist ein Weg, die Lookup-Phase der Arbeit so billig zu machen, dass die kognitive Last sich zu den Entscheidungen verschiebt, die man eigentlich treffen wollte.
