L'interface calendrier de crunchyroll devenant de plus en plus illisible, j'ai regardé du coté de Tampermonkey.

J'ai trouvé un filtre permettant de ne conserver que les versions EN, réalisé par https://greasyfork.org/users/1060113

Avec quelques modifications, le script réalise les choses suivantes:
  - Un tableau en début de code permet de paramétrer les termes à rechercher au niveau du titre (par exemple "(Français)" pour conserver les versions audio FR) et au niveau du lien pour conserver les versions en VO sous titrées (JAJP pour japonais).
  - Si un épisode reste à visualiser, un logo de lecture apparaît au niveau de l'épisode (ce bouton correspond au bouton "Reprendre" contenu dans les popup hover, pas à l'épisode affiché).
  - Les boutons radio permettant de choisir tous les épisodes ou uniquement les épisodes gratuits sont remplacés par deux cases à cocher permettant de choisir si on souhaite filtrer les versions (sur la base du tableau de paramètres) ainsi que de se limiter aux séries indiquées avec le flag de suivi.

Résultat, l'interface est épurée, avec uniquement les séries et versions que l'on souhaite suivre.
Dommage que Crunchyroll ne se soit pas donné la peine de rajouter deux trois paramètres pour s'éviter tout ça...
