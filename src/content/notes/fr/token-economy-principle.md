---
title: "Le principe d'économie des tokens"
summary: "Pourquoi le grand livre comptable ne devrait jamais entrer dans la fenêtre de contexte, et ce que cette contrainte oblige à concevoir à la place."
publishDate: 2026-05-16
tags: ["principes", "design", "llms"]
related: ["self-hosted-rag-claude-max", "mcp-workstream"]
sources:
  - label: "Notes de conception personnelles"
    kind: notion
  - label: "Expérience pratique de routage de données dans Claude Code"
    kind: memory
status: published
---

La contrainte la plus utile que j'ai adoptée en construisant de l'automatisation autour de LLM est la suivante : le grand livre n'entre jamais dans la fenêtre de contexte.

Par « grand livre » j'entends tout ensemble de données volumineux, structuré et transactionnel que l'on confierait normalement à un moteur SQL, à un tableau croisé dynamique ou à un script de réconciliation. Des centaines de milliers de lignes. De longs historiques. Des choses qui ont déjà une couche de requête naturelle.

La tentation, en démarrant, est de coller une tranche dans le prompt et de demander au modèle de calculer. Deux colonnes de chiffres, un intervalle de dates, « trouve les écarts ». Le modèle essaiera. Parfois il y parviendra. Mais vous payez un coût réel invisible au début : chaque token dépensé à afficher des données brutes est un token non dépensé à raisonner. La facture n'est pas financière, elle est cognitive. Le modèle a moins de place pour réfléchir parce qu'il est occupé à lire.

Le principe que je suis maintenant : les données vivent là où elles vivent. La fenêtre de contexte porte la *question*, le *schéma* et le *résultat d'une requête ciblée*. Voilà tout. Le modèle est l'analyste, pas la base de données.

En pratique cela ressemble à :

- Une balance n'est pas collée dans le prompt. Le prompt dit : « voici le schéma et le nom du fichier ; demande la tranche dont tu as besoin. »
- Une réconciliation n'est pas demandée directement au modèle. Le modèle écrit le script, le script s'exécute sur le fichier, le résultat revient sous forme de petit tableau.
- Un long PDF n'est pas résumé d'un coup. On indique au modèle la structure des chapitres, on lui demande quelles sections importent, on ne lui passe que celles-ci.

Cela impose une discipline particulière au système autour du modèle. Il vous faut une couche d'outils que le modèle peut appeler, un petit jeu d'actions typées, un moyen de ramener les résultats dans le contexte sans le gonfler. MCP joue un rôle ici. De simples fichiers bien nommés sur disque que le modèle peut lire à la demande aussi.

Quelques corollaires que j'ai appris à respecter.

**Récupération n'égale pas ingestion.** Ingérer un corpus signifie le déverser dans le contexte. Récupérer signifie demander : « quelle partie de ce corpus est pertinente pour la question que j'ai là tout de suite », et n'en ramener que cela. Le premier passe mal à l'échelle. Le second est ce que les humains font réellement quand ils lisent.

**Les schémas sont bon marché, les données sont chères.** Décrire la *forme* d'un ensemble de données en cinquante tokens ne coûte presque rien et laisse le modèle raisonner sur les requêtes qu'on lui ferait. Décrire chaque ligne coûte tout et ne laisse au modèle presque rien à raisonner.

**La fenêtre est une mémoire de travail, pas un disque dur.** Traitez-la comme un humain traite un bureau : une petite surface pour les artéfacts de la décision en cours, tenue en ordre parce que le désordre est ce qui fait oublier.

La raison pour laquelle cela compte, au-delà du coût et de la vitesse, est que le modèle se comporte différemment quand il n'est pas enseveli sous des données. Il pose de meilleures questions. Il admet quand il ne sait pas. Il arrête d'halluciner des chiffres à partir de colonnes qu'il n'a lues qu'à moitié. Ce ne sont pas des propriétés du modèle, ce sont des propriétés de la conversation. Vous concevez la conversation en décidant ce qui entre dans la fenêtre et ce qui n'y entre pas.

Si un workflow semble exiger l'ensemble du grand livre en contexte, c'est le signe que le workflow fait une analyse que le LLM ne devrait pas faire. Déplacez l'analyse vers le système. Gardez le modèle pour les parties que seul le modèle peut faire : cadrage, jugement, langue.
