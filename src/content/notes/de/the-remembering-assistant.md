---
title: "Der sich erinnernde Assistent"
summary: "Kein Jarvis. Eine Reflexion darüber, was es bedeuten würde, wenn der Assistent in meiner Brille die richtigen Dinge erinnert, und welche Dinge er absichtlich vergessen sollte."
publishDate: 2026-05-16
tags: ["gedächtnis", "wearables", "design"]
related: ["self-hosted-rag-claude-max", "token-economy-principle"]
sources:
  - label: "Persönliche Notizen zum G2-Stack"
    kind: notion
  - label: "Projektseite zum Exocortex-Stack"
    kind: site
status: published
---

Wenn Menschen ein Heads-up-Display sehen, das mit einem großen Sprachmodell spricht, ist die Referenz, nach der sie greifen, Jarvis. Dieser Vergleich leistet viel Arbeit, und das meiste davon ist die falsche Arbeit. Jarvis ist eine Figur. Was ich baue, und noch mehr, worüber ich nachdenke, während ich es baue, ist das viel kleinere, viel nützlichere Ding im Schatten dieser Figur: ein Assistent, dessen einzige Superkraft ist, dass er sich an das erinnert, worum ich ihn gebeten habe, sich zu erinnern.

Das ist eine Reflexion aus erster Person, kein Produktversprechen. Ich versuche nicht, einen Jarvis auszuliefern. Ich versuche, klar darüber nachzudenken, was Gedächtnis in einem persönlichen KI-Stack sein sollte und nicht sein sollte, und die ehrliche Version dieses Denkens ist interessanter als die Marketing-Version.

Die Ausgangsbeobachtung ist, dass "Gedächtnis" in aktuellen LLM-Produkten überwiegend zwei Dinge ist. Das Modell hat Wissen aus der Trainingszeit, das breit, aber gefroren ist und nichts mit mir zu tun hat. Und es hat ein Kontextfenster, das vom Jetzt handelt, aber in dem Moment verblasst, in dem das Gespräch endet. Keines von beiden ist das, was ich meine, wenn ich sage, ich möchte, dass der Assistent sich erinnert.

Was ich will, ist näher an einem Logbuch. Drei Eigenschaften.

**Explizit.** Dinge kommen ins Gedächtnis, weil ich es gesagt habe, oder weil eine Regel, die ich geschrieben habe, es gesagt hat. Nichts wird still aufgesogen. Wenn der Assistent sich an ein Datum, eine Präferenz oder eine Entscheidung erinnert, kann ich auf die Zeile zeigen, wo es aufgeschrieben wurde.

**Inspizierbar.** Der Speicher ist ein Verzeichnis kleiner Textdateien, keine Embedding-Cloud, die ich nicht sehen kann. Ich kann alles lesen, was "im Gedächtnis" ist, jederzeit. Es gibt keine Überraschung.

**Begrenzt.** Das Gedächtnis hat ein Kontingent. Neue Fakten verdrängen alte, wenn ich sie nicht hochstufe. Die Voreinstellung ist vergessen. Die Ausnahme ist behalten, und diese Ausnahme braucht einen Grund.

Der Grund, warum diese Form wichtig ist, ist nicht Nostalgie für Plaintext. Es ist, dass alle drei Eigenschaften das sind, was den Assistenten als Werkzeug wirken lässt statt als Präsenz. Eine Präsenz erinnert sich an alles, und man kann nicht sagen, woran. Ein Werkzeug erinnert sich an das, worum man es gebeten hat, und man kann genau sagen, woran.

Das ist auch der Teil, an dem ich ehrlich sein muss, was gebaut ist und was nur in meinem Kopf sitzt.

Was gebaut ist: eine kleine dateibasierte Gedächtnisschicht, die der lokale Agent zu Sitzungsbeginn liest. Sie kennt Dinge, die ich ihm explizit gesagt habe: meine Sprachen, das Projekt, an dem ich arbeite, die Bücher, die ich verfolge. Sie darf am Ende einer Sitzung neue Erinnerungen vorschlagen; ich lese die Vorschläge am Wochenende und behalte sie entweder oder streiche sie durch.

Was nicht gebaut ist: nichts, was den Namen Jarvis verdienen würde. Es gibt kein autonomes Verhalten. Keine proaktiven Anstöße. Kein "ambientes" Bewusstsein dafür, was ich tue. Der Assistent schläft jederzeit, bis ich mit ihm spreche. Das ist Absicht und nicht Faulheit. Das erste Mal, dass ich einen Agenten selbst entscheiden lasse, wann er mich unterbricht, wird sein, nachdem ich verstanden habe, warum ich unterbrochen werden möchte, und das habe ich noch nicht verstanden.

Ein paar ehrliche Einschränkungen, die auftauchen, wenn man Gedächtnis sorgfältig zu entwerfen versucht.

**Vergessen ist schwerer als Erinnern.** Fakten hinzufügen ist eine Zeile. Sie zu beschneiden braucht eine Richtlinie. Ich nutze derzeit eine wöchentliche Durchsicht, die ich von Hand mache, was nicht skaliert, aber mir beibringt, wie die Richtlinie aussehen sollte.

**Die meisten "Erinnerungen" sind Rauschen.** Die interessanten Fakten einer Woche sind fünf oder sechs. Alles andere ist Tagebuch. Der Sinn einer Gedächtnisschicht ist, die fünf hervorzuholen, nicht den Rest zu protokollieren.

**Die Stimme des Assistenten ist überwiegend die Stimme seines Gedächtnisses.** Wenn das Gedächtnis kuratiert ist, klingt der Assistent kuratiert. Wenn das Gedächtnis abgeladen ist, klingt der Assistent wie ein Chatbot, der versucht, sich an Ihren Geburtstag zu erinnern.

Der Rahmen, zu dem ich immer wieder zurückkomme: ich will keinen Assistenten, der vorgibt, mich zu kennen. Ich will einen, der die kleine Menge an Dingen hält, um die ich ihn gebeten habe sie zu halten, und der ehrlich ist über die Grenzen dieser Menge. Das ist viel weniger als Jarvis, und viel nützlicher.
