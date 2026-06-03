---
title: "Quand l'assistant dort"
summary: "Une suite à L'assistant qui se souvient. L'affirmation que rien n'est absorbé en silence ne tient plus tout à fait. Une passe de consolidation nocturne l'a reprise, avec garde-fous explicites et retour arrière."
publishDate: 2026-06-03
tags: ["mémoire", "automatisation", "ai-tooling"]
related: ["the-remembering-assistant", "self-hosted-rag-claude-max"]
sources:
  - label: "Notes système sur la consolidation pendant le sommeil"
    kind: memory
  - label: "Page projet du site sur la pile exocortex"
    kind: site
status: published
---

Il y a deux semaines, j'écrivais que la couche de mémoire n'absorbe jamais rien en silence. Chaque fait y entrait parce que je l'avais lu un dimanche matin et choisi de le garder. Le défaut, c'était d'oublier. L'exception, c'était de garder, et l'exception exigeait une raison.

Cette règle tient toujours. L'acteur qui l'applique a changé.

Ce qui a changé, c'est que le système s'est doté d'un cycle de sommeil. Un petit programme tourne à deux heures du matin, lit dans une liste de candidats tout ce que j'ai rédigé dans la journée, et décide pour chaque candidat s'il est promu dans les fichiers de mémoire de longue durée ou s'il reste dans la boîte d'arrivée pour que je le revoie. À trois heures et demie, une seconde passe applique ces décisions sur disque. Quand je me réveille, le système a déjà fait ce que je faisais auparavant à la main un dimanche matin, et le diff des fichiers m'attend dans git, prêt à être lu.

Le motif a un nom. On l'appelle consolidation pendant le sommeil, et il existe des recherches récentes qui le décrivent formellement pour les agents fondés sur des modèles de langage. L'idée est plus ancienne que la recherche. Les sciences cognitives nomment cela consolidation hippocampo-néocorticale depuis des décennies : le processus par lequel le cerveau prend les événements épisodiques bruités de la journée et les replie en structure sémantique stable pendant la nuit. Que deux communautés, l'une biologique et l'autre computationnelle, aient convergé vers la même architecture n'est pas une coïncidence. C'est ce qui arrive quand les contraintes sont les mêmes. La mémoire de travail est petite, le monde est grand, et la conversion doit se faire à un moment où aucune entrée nouvelle ne se dispute la bande passante.

La version honnête de ce que le consolidateur peut et ne peut pas faire.

**Ce qu'il peut faire.** Promouvoir un fait candidat en silence quand toutes les conditions suivantes tiennent : le classifieur l'a noté en haute confiance, le candidat désigne un fichier de destination précis, le candidat ne contredit rien de ce qui est déjà en mémoire, et le sujet n'a pas été activement en conversation au cours des dernières vingt-quatre heures. Le dernier garde-fou compte parce qu'un fait qui bouge encore en conversation n'est pas encore un fait. C'est le brouillon d'un fait.

**Ce qu'il ne peut pas faire.** Toucher à quoi que ce soit classé en identité, santé, finances ou juridique. Ces catégories remontent toujours à moi pour relecture, même quand le classifieur est confiant. Un classifieur confiant sur la mauvaise catégorie est exactement le genre d'erreur que je ne peux pas me permettre dans ces quatre domaines, et le coût de me faire lire quatre éléments signalés par semaine est bien plus petit que le coût d'une édition autonome sur un fichier qui décrit qui je suis ou ce que je dois.

**Ce qui peut être défait.** Chaque application nocturne est encadrée par deux commits git, un avant, un après. Le commit d'avant est la poignée de retour arrière. Si je regarde le diff du matin et que je ne suis pas d'accord, une seule commande ramène le système à l'état dans lequel je l'ai laissé la veille au soir. Le coût d'une mauvaise promotion, c'est, au pire, trente secondes et un message de commit.

Le cadrage que je veux garder honnête à ce sujet. L'assistant n'est pas devenu plus intelligent. Il a acquis un cycle de sommeil. Il n'y a pas de modèle de moi qui tourne en arrière-plan entre les sessions. Il y a un classifieur qui lit ce que j'ai dit aujourd'hui, un applicateur qui l'écrit sur disque, et un journal que je peux annuler. L'intelligence, dans la mesure où il y en a, vit dans le schéma et dans les garde-fous, pas dans un système qui « me connaîtrait ».

Quand j'écrivais la note précédente, j'appelais le défaut oublier et l'exception garder. Cette structure tient toujours. La seule différence, c'est que je ne suis plus la seule entité autorisée à trancher. Le cron a voix au chapitre sur les cas faciles, avec les reçus pour prouver son travail. Les cas difficiles, je les vois toujours.
