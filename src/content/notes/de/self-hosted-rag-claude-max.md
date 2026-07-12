---
title: "Ein selbst gehostetes RAG auf Claude Max"
summary: "OpenKB, Meridian und eine Claude-Max-OAuth-Route. Notizen zum Bau eines persönlichen Retrieval-Augmented-Stacks ohne Pro-Token-API-Rechnung."
publishDate: 2026-05-16
tags: ["rag", "selbst-gehostet", "wissen"]
related: ["token-economy-principle", "the-remembering-assistant"]
sources:
  - label: "Projektseite zum Exocortex-Stack"
    kind: site
  - label: "OpenKB Compile- und Query-Notizen"
    kind: notion
status: published
---

Ich wollte eine persönliche Wissensbasis, die ich aus einem Smart-Glasses-Sprachbefehl abfragen kann, ohne monatliche Token-Rechnung, ohne Drittanbieter-Indexierungsdienst und ohne undurchsichtiges gehostetes RAG-Produkt dazwischen. Der Stack, mit dem ich gelandet bin, hat drei benannte Teile und eine klare wirtschaftliche Form.

**OpenKB** ist der Index. Es nimmt die Dokumente, die mich interessieren (Papiere, Verträge, Referenzmaterial, persönliche Notizen) und kompiliert sie zu einem abfragbaren Wiki mit dokumentübergreifenden Links. Es stellt sich Claude Code als stdio-MCP-Server bereit, was bedeutet, dass eine Claude-Session ihm über eine typisierte Tool-Schnittstelle Fragen stellen kann. Der Compile-Schritt macht seinen eigenen LLM-Aufruf intern; ich habe ihn auf Claude Opus 4.8 gesetzt, weil die Verknüpfung besser ist als bei kleineren Größen und der Geschwindigkeitsunterschied für einen Hintergrund-Job keine Rolle spielt.

**Meridian** ist der Router. Es ist ein kleiner, immer aktiver Dienst, der eine OAuth-Session zu Claude Max hält und lokal einen OpenAI-förmigen Endpunkt anbietet. Alles in meinem Haus, das mit einem Claude-Modell sprechen will, spricht zuerst mit Meridian. Meridian spricht dann über die OAuth-Route mit Claude, das ist der Teil, der die Grenzkosten von pro Token auf null kippt. Der Kompromiss sind Ratenlimits statt Rechnungen, was für einen persönlichen Stack der richtige Tausch ist.

**Claude Code** ist der Agent, der die beiden zusammenhält. Wenn ich eine Frage stelle, die Dokumentkontext braucht, ruft er OpenKB über MCP an, bekommt die relevanten Fragmente zurück und antwortet. Wenn ich eine Frage stelle, die das nicht braucht, antwortet er direkt. Das Routing liegt in der CLAUDE.md, nicht im Draht.

Ein paar Dinge, die das mich gelehrt hat, die ich nicht vorhergesagt hätte.

**Selbst gehostetes RAG dreht sich überwiegend um Latenz und Vertrauen, nicht um Kosten.** Die Kostenersparnis ist real, aber sie ist nicht das, was das Erlebnis besser macht. Was es besser macht, ist, dass der Index im selben Netzwerk wie der Agent lebt, sodass sich eine Abfrage anfühlt wie das Fragen eines Kollegen, statt einen Anbieter anzurufen. Und ich weiß genau, was im Index ist, weil ich es dort abgelegt habe.

**Der schwerste Teil ist nicht das Retrieval; es ist die Kuratierung.** Ein naives RAG über alles, was ich je geschrieben habe, ist schlechter als ein sorgfältiger Index von vierzig Dokumenten. Das Modell ist nützlicher, wenn der Korpus kleiner, kohärenter und semantisch dichter ist. Ich habe mehr Zeit damit verbracht zu entscheiden, was nicht im Index sein sollte, als was sollte.

**OAuth-Routing hat einen unverzeihlichen Fehlermodus.** Wenn der API-Schlüssel in irgendeiner Shell auf dem Host gesetzt ist, wird der Proxy still umgangen und die echte abgerechnete API getroffen. Beim ersten Mal, als ich das nachverfolgte, lernte ich, meine dotfiles nach verirrten Exports zu grep'en. Defensive Gewohnheit jetzt: diese Variable an der Spitze jedes Entry-Points, der über Meridian routen soll, entsetzen.

**Das Modell weiß, wann es ein Namensschild trägt.** Jede Antwort trägt ein kleines Signal in eckigen Klammern, das angibt, welcher Pfad sie bedient hat: ein direkter Aufruf, ein tool-augmentierter Aufruf, eine langsame Opt-in-Eskalation zu einem größeren Modell. Das ist nicht nur diagnostisch; es ändert, wie ich die Antwort lese. Ein direkter Aufruf ist eine selbstbewusste Vermutung. Ein tool-augmentierter Aufruf hat Belege. Die Eskalations-Antwort ist die überlegte.

Was ich noch nicht gelöst habe, ist die Grenze zwischen dem persönlichen Index und der Welt. RAG ist gut, wenn die Antwort im Index lebt. Die Websuche und das eigene Training des Modells sind gut, wenn sie es nicht tut. Das aktuelle Routing sind Regeln in einer Markdown-Datei. Der nächste Schritt ist, diese Regeln für das Modell selbst lesbar zu machen, damit es zur Abfragezeit wählen kann, statt dass ich die Wahl im Voraus beschreibe.

Vorerst läuft der Stack, die Rechnungen sind vorhersehbar, und der Index wächst etwa so schnell wie meine Aufmerksamkeit. Das ist ungefähr das, was ich wollte.
