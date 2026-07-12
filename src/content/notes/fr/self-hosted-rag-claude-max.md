---
title: "Un RAG auto-hébergé sur Claude Max"
summary: "OpenKB, Meridian et une route OAuth Claude Max. Notes sur la construction d'une pile RAG personnelle sans facture API au token."
publishDate: 2026-05-16
tags: ["rag", "auto-hébergé", "connaissance"]
related: ["token-economy-principle", "the-remembering-assistant"]
sources:
  - label: "Page projet du site sur la pile exocortex"
    kind: site
  - label: "Notes de compilation et d'interrogation OpenKB"
    kind: notion
status: published
---

Je voulais une base de connaissances personnelle interrogeable par commande vocale depuis des lunettes connectées, sans facture mensuelle de tokens, sans service d'indexation tiers, et sans produit RAG hébergé opaque au milieu. La pile à laquelle je suis arrivé a trois parties nommées et une forme économique claire.

**OpenKB** est l'index. Il prend les documents qui m'importent (articles, contrats, matériel de référence, notes personnelles) et les compile en un wiki interrogeable avec des liens inter-documents. Il s'expose à Claude Code comme un serveur MCP en stdio, ce qui signifie qu'une session Claude peut lui poser des questions via une interface d'outils typée. L'étape de compilation fait son propre appel LLM en interne ; je l'ai réglée sur Claude Opus 4.8, parce que le liage est meilleur qu'avec des tailles plus petites et que la différence de vitesse n'a pas d'importance pour un job en tâche de fond.

**Meridian** est le routeur. C'est un petit service toujours actif qui maintient une session OAuth vers Claude Max et présente localement un point de terminaison à la forme d'OpenAI. Tout chez moi qui veut parler à un modèle Claude parle d'abord à Meridian. Meridian parle ensuite à Claude via la route OAuth, et c'est la partie qui bascule le coût marginal de par-token à zéro. Le compromis, ce sont des limites de débit au lieu de factures, ce qui est le bon échange pour une pile personnelle.

**Claude Code** est l'agent qui lie les deux. Quand je pose une question qui demande du contexte documentaire, il appelle OpenKB via MCP, récupère les fragments pertinents et répond. Quand je pose une question qui n'en demande pas, il répond directement. Le routage est dans le CLAUDE.md, pas dans le fil.

Quelques choses que cela m'a apprises et que je n'aurais pas prédites.

**Le RAG auto-hébergé est surtout une question de latence et de confiance, pas de coût.** L'économie de coût est réelle mais ce n'est pas ce qui rend l'expérience meilleure. Ce qui la rend meilleure, c'est que l'index vit sur le même réseau que l'agent, de sorte qu'une requête a la sensation de demander à un collègue plutôt que d'appeler un fournisseur. Et je sais exactement ce qu'il y a dans l'index parce que c'est moi qui l'y ai mis.

**Le plus dur n'est pas la récupération ; c'est la curation.** Un RAG naïf sur tout ce que j'ai jamais écrit est moins bon qu'un index soigné de quarante documents. Le modèle est plus utile quand le corpus est plus petit, plus cohérent et plus dense sémantiquement. J'ai passé plus de temps à décider ce qui ne devait pas être dans l'index que ce qui devait y être.

**Le routage OAuth a un mode d'échec impardonnable.** Si la clé d'API est positionnée dans un shell quelque part sur l'hôte, le proxy est silencieusement contourné et la vraie API facturée est touchée. La première fois que j'ai tracé ce comportement, j'ai appris à grep'er mes dotfiles à la recherche d'exports égarés. Habitude défensive maintenant : annuler cette variable en tête de chaque point d'entrée censé router via Meridian.

**Le modèle sait quand il porte une étiquette.** Chaque réponse porte un petit signal entre crochets indiquant quel chemin l'a servie : appel direct, appel augmenté d'outils, escalade lente et opt-in vers un modèle plus grand. Ce n'est pas seulement diagnostique ; cela change la façon dont je lis la réponse. Un appel direct est une supposition assurée. Un appel augmenté d'outils a des reçus. La réponse d'escalade est la réfléchie.

Ce que je n'ai pas encore résolu, c'est la frontière entre l'index personnel et le monde. RAG est bon quand la réponse vit dans l'index. La recherche web et l'entraînement propre du modèle sont bons quand elle n'y vit pas. Le routage actuel, ce sont des règles dans un fichier markdown. La prochaine étape est de rendre ces règles lisibles pour le modèle lui-même, afin qu'il puisse choisir au moment de la requête plutôt que je décrive le choix à l'avance.

Pour l'instant, la pile tourne, les factures sont prévisibles, et l'index croît à peu près aussi vite que mon attention. C'est à peu près ce que je voulais.
