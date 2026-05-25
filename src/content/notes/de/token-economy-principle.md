---
title: "Das Prinzip der Token-Ökonomie"
summary: "Warum das Hauptbuch niemals in das Kontextfenster gehört, und was diese Einschränkung erzwingt, stattdessen zu entwerfen."
publishDate: 2026-05-16
tags: ["prinzipien", "design", "llms"]
related: ["self-hosted-rag-claude-max", "mcp-workstream"]
sources:
  - label: "Persönliche Design-Notizen"
    kind: notion
  - label: "Praktische Erfahrung beim Routing von Daten durch Claude Code"
    kind: memory
status: published
---

Die einzige nützlichste Einschränkung, die ich beim Bauen von Automatisierung um LLMs herum übernommen habe, ist diese: das Hauptbuch landet niemals im Kontextfenster.

Mit "Hauptbuch" meine ich jeden großen, strukturierten, transaktionalen Datenbestand, den man normalerweise einer SQL-Engine, einer Pivot-Tabelle oder einem Abstimmungsskript übergeben würde. Hunderttausende von Zeilen. Lange Historien. Dinge, die bereits eine natürliche Abfrageschicht haben.

Die Versuchung am Anfang ist, einen Ausschnitt davon in den Prompt einzufügen und das Modell rechnen zu lassen. Zwei Spalten mit Zahlen, ein Datumsbereich, "finde die Unstimmigkeiten". Das Modell wird es versuchen. Manchmal wird es sogar gelingen. Aber man zahlt einen realen Preis, der zunächst unsichtbar ist: jedes Token, das man für das Rendern roher Daten ausgibt, ist ein Token, das nicht für das Denken ausgegeben wird. Die Rechnung ist nicht finanziell, sie ist kognitiv. Das Modell hat weniger Raum zum Denken, weil es mit Lesen beschäftigt ist.

Das Prinzip, dem ich jetzt folge: die Daten leben da, wo sie leben. Das Kontextfenster trägt die *Frage*, das *Schema* und das *Ergebnis einer gezielten Abfrage*. Das ist alles. Das Modell ist der Analyst, nicht die Datenbank.

In der Praxis sieht das so aus:

- Eine Probebilanz wird nicht in den Prompt eingefügt. Der Prompt sagt: "hier ist das Schema und der Dateiname; frag nach dem Ausschnitt, den du brauchst."
- Eine Abstimmung wird nicht direkt vom Modell verlangt. Das Modell schreibt das Skript, das Skript läuft gegen die Datei, das Ergebnis kommt als kleine Tabelle zurück.
- Ein langes PDF wird nicht in einem Durchgang zusammengefasst. Dem Modell wird die Kapitelstruktur genannt, es wird gefragt, welche Abschnitte wichtig sind, und nur diese bekommt es vorgelegt.

Das erzwingt eine bestimmte Disziplin am System um das Modell. Man braucht eine Tool-Schicht, die das Modell aufrufen kann, ein kleines Set typisierter Aktionen, einen Weg, Ergebnisse zurück in den Kontext zu bringen, ohne ihn aufzublähen. MCP spielt hier eine Rolle. Genauso gut auch nur gut benannte Dateien auf der Platte, die das Modell bei Bedarf lesen kann.

Ein paar Folgerungen, die ich gelernt habe zu respektieren.

**Retrieval ist nicht dasselbe wie Ingestion.** Ein Korpus zu ingestieren heißt, ihn in den Kontext zu kippen. Retrieval heißt zu fragen: "welcher Teil dieses Korpus ist relevant für die Frage, die ich gerade habe", und nur diesen zurückzubringen. Das erste skaliert schlecht. Das zweite ist das, was Menschen tatsächlich tun, wenn sie lesen.

**Schemata sind billig, Daten sind teuer.** Die *Form* eines Datenbestands in fünfzig Tokens zu beschreiben kostet fast nichts und lässt das Modell über Abfragen darauf nachdenken. Jede Zeile im Datenbestand zu beschreiben kostet alles und lässt das Modell über fast nichts nachdenken.

**Das Fenster ist ein Arbeitsgedächtnis, keine Festplatte.** Behandeln Sie es so, wie ein Mensch einen Schreibtisch behandelt: eine kleine Oberfläche für die Artefakte der aktuellen Entscheidung, ordentlich gehalten, weil Unordnung das ist, was vergessen macht.

Der Grund, warum das wichtig ist, jenseits von Kosten und Geschwindigkeit, ist, dass das Modell sich anders verhält, wenn es nicht unter Daten begraben ist. Es stellt bessere Fragen. Es gibt zu, wenn es nicht weiß. Es hört auf, Zahlen aus Spalten zu halluzinieren, die es nur halb gelesen hat. Das sind keine Eigenschaften des Modells, das sind Eigenschaften des Gesprächs. Sie gestalten das Gespräch, indem Sie entscheiden, was ins Fenster kommt und was nicht.

Wenn ein Workflow zu verlangen scheint, das gesamte Hauptbuch im Kontext zu haben, ist das ein Zeichen, dass der Workflow eine Analyse macht, die das LLM nicht machen sollte. Verlagern Sie die Analyse ins System. Halten Sie das Modell für die Teile bereit, die nur das Modell tun kann: Rahmung, Urteil, Sprache.
