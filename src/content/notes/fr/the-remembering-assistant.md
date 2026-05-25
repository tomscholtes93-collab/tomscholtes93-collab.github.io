---
title: "L'assistant qui se souvient"
summary: "Pas un Jarvis. Une réflexion sur ce que cela voudrait dire que l'assistant dans mes lunettes se souvienne des bonnes choses, et lesquelles il devrait oublier à dessein."
publishDate: 2026-05-16
tags: ["mémoire", "wearables", "design"]
related: ["self-hosted-rag-claude-max", "token-economy-principle"]
sources:
  - label: "Notes personnelles sur la pile G2"
    kind: notion
  - label: "Page projet du site sur la pile exocortex"
    kind: site
status: published
---

Quand les gens voient un affichage tête haute qui parle à un grand modèle de langage, la référence qu'ils saisissent est Jarvis. Cette comparaison fait beaucoup de travail, et l'essentiel est le mauvais travail. Jarvis est un personnage. Ce que je construis, et plus encore ce à quoi je pense pendant que je le construis, c'est la chose beaucoup plus petite et beaucoup plus utile dans l'ombre de ce personnage : un assistant dont la seule superpuissance est de se souvenir de ce que je lui ai demandé de retenir.

C'est une réflexion à la première personne, pas une promesse produit. Je ne cherche pas à livrer un Jarvis. Je cherche à penser clairement à ce que la mémoire devrait et ne devrait pas être dans une pile d'IA personnelle, et la version honnête de cette pensée est plus intéressante que la version marketing.

L'observation de départ, c'est que la « mémoire » dans les produits LLM actuels est surtout deux choses. Le modèle a une connaissance d'entraînement, qui est large mais gelée et qui ne me concerne pas. Et il a une fenêtre de contexte, qui concerne le maintenant mais se dissipe à la fin de la conversation. Ni l'une ni l'autre n'est ce que je veux dire quand je dis vouloir que l'assistant se souvienne.

Ce que je veux est plus proche d'un journal de bord. Trois propriétés.

**Explicite.** Les choses entrent en mémoire parce que je l'ai dit, ou parce qu'une règle que j'ai écrite l'a dit. Rien n'est silencieusement absorbé. Si l'assistant se souvient d'une date, d'une préférence ou d'une décision, je peux pointer la ligne où c'est écrit.

**Inspectable.** Le stockage est un répertoire de petits fichiers texte, pas un nuage d'embeddings invisible. Je peux lire tout ce qui est « en mémoire » à tout moment. Il n'y a pas de surprise.

**Borné.** La mémoire a un quota. Les nouveaux faits évincent les anciens, sauf si je les promeus. Le défaut, c'est d'oublier. L'exception, c'est de garder, et cette exception requiert une raison.

La raison pour laquelle cette forme compte n'est pas une nostalgie du texte brut. C'est que les trois propriétés font que l'assistant a la sensation d'un outil plutôt que d'une présence. Une présence se souvient de tout et l'on ne peut pas dire de quoi. Un outil se souvient de ce que vous avez demandé, et l'on peut dire exactement de quoi.

C'est aussi la partie où il faut être honnête sur ce qui est construit et ce qui n'est qu'assis dans ma tête.

Ce qui est construit : une petite couche de mémoire fondée sur des fichiers, lue par l'agent local au début de chaque session. Elle connaît des choses que je lui ai dites explicitement : mes langues, le projet sur lequel je travaille, les livres que je suis. Elle peut proposer de nouvelles mémoires à la fin d'une session ; je lis les propositions le week-end et je les garde ou les raye.

Ce qui n'est pas construit : rien qui mériterait le nom de Jarvis. Il n'y a pas de comportement autonome. Pas de relances proactives. Pas de conscience « ambiante » de ce que je fais. L'assistant, à tout moment, dort jusqu'à ce que je lui parle. C'est par conception et non par paresse. La première fois que je laisserai un agent décider seul quand m'interrompre, ce sera après avoir compris pourquoi je veux être interrompu, et je ne l'ai pas encore compris.

Quelques contraintes honnêtes qui apparaissent quand on essaie de concevoir la mémoire avec soin.

**Oublier est plus dur que se souvenir.** Ajouter des faits, c'est une ligne. Les élaguer demande une politique. J'utilise pour l'instant une revue hebdomadaire à la main, ce qui n'est pas scalable, mais m'apprend à quoi la politique devrait ressembler.

**La plupart des « mémoires » sont du bruit.** Les faits intéressants d'une semaine sont cinq ou six. Le reste est du journal. Le but d'une couche de mémoire est de faire émerger les cinq, pas de consigner le reste.

**La voix de l'assistant est surtout la voix de sa mémoire.** Si la mémoire est curée, l'assistant sonne curé. Si la mémoire est déversée, l'assistant sonne comme un chatbot qui essaie de se souvenir de votre anniversaire.

Le cadre auquel je reviens sans cesse : je ne veux pas d'un assistant qui prétend me connaître. Je veux un assistant qui tient le petit ensemble de choses que je lui ai demandé de tenir, et qui est honnête sur les limites de cet ensemble. C'est beaucoup moins que Jarvis, et beaucoup plus utile.
