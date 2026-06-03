---
title: "Wenn der Assistent schläft"
summary: "Eine Fortsetzung zu Der sich erinnernde Assistent. Die Behauptung, dass nichts still aufgesogen wird, gilt nicht mehr ganz. Ein nächtlicher Konsolidierungslauf hat das übernommen, mit expliziten Schranken und Rollback."
publishDate: 2026-06-03
tags: ["gedächtnis", "automatisierung", "ai-tooling"]
related: ["the-remembering-assistant", "self-hosted-rag-claude-max"]
sources:
  - label: "Systemnotizen zur Sleep-Time-Konsolidierung"
    kind: memory
  - label: "Projektseite zum Exocortex-Stack"
    kind: site
status: published
---

Vor zwei Wochen schrieb ich, dass die Gedächtnisschicht nie etwas still aufsaugt. Jeder Fakt kam hinein, weil ich ihn an einem Sonntagmorgen gelesen und mich entschieden hatte, ihn zu behalten. Die Voreinstellung war vergessen. Die Ausnahme war behalten, und die Ausnahme brauchte einen Grund.

Diese Regel gilt weiterhin. Wer sie durchsetzt, hat sich geändert.

Was sich geändert hat, ist, dass dem System ein Schlafzyklus gewachsen ist. Ein kleines Programm läuft um zwei Uhr morgens, liest alles, was ich an diesem Tag entworfen habe, in eine Kandidatenliste ein und entscheidet für jeden Kandidaten, ob er in die langlebigen Gedächtnisdateien hochgestuft wird oder im Inbox-Bereich bleibt, damit ich ihn prüfe. Um halb vier wendet ein zweiter Lauf diese Entscheidungen auf die Festplatte an. Wenn ich aufwache, hat das System bereits getan, was ich früher von Hand an einem Sonntagmorgen erledigte, und das File-Diff liegt in git bereit, damit ich es lese.

Das Muster hat einen Namen. Es heißt Sleep-Time-Konsolidierung, und es gibt aktuelle Forschung, die es formal für Sprachmodell-Agenten beschreibt. Die Idee ist älter als die Forschung. Die Kognitionswissenschaft nennt das seit Jahrzehnten hippocampal-neokortikale Konsolidierung, jenen Prozess, mit dem das Gehirn die verrauschten episodischen Ereignisse des Tages über Nacht in stabile semantische Struktur faltet. Dass zwei Gemeinschaften, eine biologische und eine rechnerische, auf dieselbe Architektur konvergiert sind, ist kein Zufall. Es ist das, was passiert, wenn die Randbedingungen dieselben sind. Das Arbeitsgedächtnis ist klein, die Welt ist groß, und die Umwandlung muss in einem Moment geschehen, in dem kein neuer Input um die Bandbreite konkurriert.

Die ehrliche Fassung dessen, was der Konsolidierer kann und nicht kann.

**Was er kann.** Einen Kandidatenfakt still hochstufen, wenn all dies zutrifft: der Klassifikator hat ihn mit hoher Konfidenz bewertet, der Kandidat benennt eine konkrete Zieldatei, der Kandidat widerspricht nichts, was bereits im Gedächtnis steht, und das Thema war in den letzten vierundzwanzig Stunden nicht aktiv im Gespräch. Die letzte Schranke ist wichtig, weil ein Fakt, der noch im Gespräch in Bewegung ist, noch kein Fakt ist. Er ist der Entwurf von einem.

**Was er nicht kann.** Irgendetwas anrühren, das als Identität, Gesundheit, Finanzen oder Recht klassifiziert ist. Diese tauchen immer zur Prüfung bei mir auf, selbst wenn der Klassifikator zuversichtlich ist. Ein zuversichtlicher Klassifikator auf der falschen Kategorie ist genau die Art Fehler, die ich mir in diesen vier Domänen nicht leisten kann, und die Kosten, vier markierte Posten pro Woche zu lesen, sind viel kleiner als die Kosten einer autonomen Bearbeitung einer Datei, die beschreibt, wer ich bin oder was ich schulde.

**Was rückgängig gemacht werden kann.** Jede nächtliche Anwendung wird in zwei git-Commits eingebettet, einer davor, einer danach. Der Vorher-Commit ist der Rollback-Griff. Wenn ich das morgendliche Diff ansehe und nicht einverstanden bin, bringt ein einziger Befehl das System in den Zustand zurück, in dem ich es gestern Abend verlassen habe. Die Kosten einer falschen Hochstufung sind, im schlimmsten Fall, dreißig Sekunden und eine Commit-Nachricht.

Die Rahmung, in der ich ehrlich bleiben möchte. Der Assistent ist nicht klüger geworden. Er hat einen Schlafzyklus bekommen. Es läuft im Hintergrund zwischen den Sitzungen kein Modell von mir. Es gibt einen Klassifikator, der liest, was ich heute gesagt habe, einen Applier, der es auf die Festplatte schreibt, und ein Log, das ich zurückrollen kann. Die Klugheit, soweit es eine gibt, lebt im Schema und in den Schranken, nicht darin, dass das System "mich kennt".

Als ich die vorherige Notiz schrieb, nannte ich die Voreinstellung vergessen und die Ausnahme behalten. Diese Struktur gilt weiterhin. Der einzige Unterschied ist, dass ich nicht mehr die einzige Instanz bin, die die Entscheidung treffen darf. Der Cron hat eine Stimme bei den einfachen Fällen, mit den Belegen, die seine Arbeit nachweisen. Die schwierigen sehe ich weiterhin selbst.
