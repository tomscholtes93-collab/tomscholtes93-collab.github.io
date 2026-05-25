---
title: "Le workstream MCP"
summary: "Brancher Outlook et Monday.com sur Claude Code via MCP, et ce que cela m'a appris sur le champ d'action de l'automatisation dans des flux régulés."
publishDate: 2026-05-16
tags: ["mcp", "automatisation", "outils"]
related: ["self-hosted-rag-claude-max", "token-economy-principle"]
sources:
  - label: "Notes personnelles sur le câblage MCP"
    kind: notion
  - label: "Spécification MCP d'Anthropic"
    kind: external
status: published
---

Je reviens toujours à une petite distinction qui, une fois intériorisée, recompose la façon dont on pense à l'automatisation de bureau. Il y a le travail consistant à *faire la tâche*, et il y a le travail consistant à *trouver la tâche à faire*. Le premier est local. Le second est assemblé depuis les boîtes de réception, les calendriers, les tableaux de projet et tout ce que l'équipe utilise pour se relancer le matin.

Pendant longtemps, « automatisation » dans ma tête voulait dire la première forme. Écrire un script qui traite un fichier. Construire une macro qui remplit un modèle. La seconde forme paraissait trop désordonnée à toucher, parce que les entrées vivaient dans cinq endroits séparés qui ne se connaissaient pas l'un l'autre.

Le workstream MCP est la partie de ma semaine où je me suis mis à prendre la seconde forme au sérieux. Le Model Context Protocol donne à un LLM une manière typée et délimitée de parler à un système externe précis. Concrètement, j'ai branché Outlook et un tableau de projet sur une même session Claude Code via des serveurs MCP. Triage de boîte mail d'un côté, état des tâches de l'autre, un seul agent capable de lire les deux et d'agir sur l'un comme sur l'autre. Pas de nouvelle couche SaaS au milieu.

Ce qui m'a surpris : à quel point la friction du « trouver la tâche » est juste une question de nommage. Une fois que l'agent peut demander, *qu'est-ce qui est sans réponse dans la boîte mail*, et séparément, *qu'est-ce qui est ouvert sur le tableau*, la différence entre ces deux requêtes s'effondre en un seul mouvement mental : où est la prochaine chose pour moi. L'agent n'a pas besoin d'être malin. Il doit seulement faire autorité sur la surface.

Quelques principes auxquels je tiens à mesure que j'élargis le workstream.

**Le périmètre est la propriété de sûreté.** Chaque serveur MCP n'expose qu'une tranche fine d'un système sous-jacent. Le serveur Outlook peut lire le courrier et rédiger des réponses ; il ne peut pas vider un dossier. Le serveur de tableau de projet peut lire les colonnes et déplacer les cartes ; il ne peut pas supprimer un espace de travail. La liste blanche est l'abstraction. Sans elle, le modèle a trop de surface et les mauvaises sortes d'erreurs deviennent bon marché à commettre.

**La colle intéressante, c'est le prompt, pas le protocole.** MCP, c'est de la plomberie. Cela ne fait que vous amener au point où les données existent dans un seul contexte. Ce que vous en faites, comment vous pondérez un signal contre un autre, comment vous décidez si quelque chose est vraiment urgent, voilà le prompt et la logique de routage par-dessus. Le protocole ne vous épargne pas la réflexion.

**Vous sentez le budget de latence.** Chaque appel d'outil est un aller-retour. Deux ou trois passent bien. Douze, c'est une pause perceptible. Cela impose une discipline utile : aller chercher largement une fois, puis penser avec ce qu'on a, plutôt que poser une question de suivi par item.

La pièce que je n'ai pas résolue, c'est de fermer la boucle dans l'autre sens. Lire ces systèmes est facile. Y écrire d'une manière qui respecte les approbations, les pistes d'audit et l'humain dans la boucle est la moitié plus difficile. Je pense que c'est surtout une question de workflow, pas de protocole. Pour l'instant, je fais préparer brouillons et changements par l'agent ; c'est moi qui appuie sur le bouton.

S'il fallait résumer en une ligne ce que le workstream m'a appris : MCP n'est pas un adaptateur magique qui automatise votre travail. C'est un moyen de rendre la phase de recherche de votre travail assez bon marché pour que la charge cognitive bascule sur les décisions que vous vouliez vraiment prendre.
