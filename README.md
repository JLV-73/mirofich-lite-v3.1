# MiroFish Lite — V3.1

## Positionnement

MiroFish Lite V3.1 est un cockpit de simulation et de pilotage d'une organisation agentique personnelle.
L'application simule visuellement le fonctionnement d'un reseau d'agents IA cooperants, hierarchises et interconnectes, capable de traiter des missions complexes.

Le rendu evoque un centre de commandement, un cockpit d'orchestre agentique, une tour de controle d'intelligence distribuee.

## Architecture agentique

### Chef Agent (Niveau 1)
Noeud central de l'organisation. Il recoit les missions, les analyse, les distribue, arbitre les conflits et valide les livrables finaux. Son role est la supervision, la delegation et la validation.

### Chiara (Niveau 2)
Bras droit du Chef Agent. Coordinatrice transverse, elle assure la liaison entre les experts, reformule les besoins, synthetise les resultats et joue un role d'amortisseur ou d'accelerateur selon la configuration.

### 20 Experts specialises (Niveau 3)
- Expert BTP
- Expert Immobilier
- Expert Juridique
- Expert Finance
- Expert Crypto
- Expert Macro
- Expert Redaction
- Expert LinkedIn
- Expert Veille
- Expert Data
- Expert Automatisation
- Expert Workflow
- Expert Presentation
- Expert Web
- Expert UX/UI
- Expert Recherche
- Expert Synthese
- Expert Documentation
- Expert Outils IA
- Expert Strategie

Chaque expert possede un profil complet : capacite, vitesse, autonomie, fiabilite, qualite de sortie, memoire, collaboration, influence reseau, sensibilite a la surcharge, aptitudes a deleguer, arbitrer et synthetiser.

## Missions

10 missions predefinies couvrant differents domaines :
1. Rediger un post LinkedIn strategique sur l'IA
2. Produire une analyse BTP / immobilier
3. Preparer un rapport de veille hebdomadaire
4. Construire un mini site web dark premium
5. Analyser un projet crypto / wallet / allocation
6. Preparer une synthese executive a partir de notes
7. Concevoir un workflow d'automatisation multi-outils
8. Generer une presentation premium structuree
9. Repondre a une problematique juridique / patrimoniale
10. Lancer une mission complexe transversale

Chaque mission a des parametres : domaine, difficulte, urgence, ambiguite, besoin de validation, nombre de sous-taches, profondeur de recherche, niveau de coordination requis.

## Parametres pilotables

L'utilisateur peut ajuster en temps reel :
- Nombre d'experts actifs (5 a 20)
- Charge initiale du systeme
- Autonomie moyenne des experts
- Niveau moyen de collaboration
- Confiance mutuelle
- Besoin de validation par le Chef
- Role de Chiara (plus ou moins central)
- Difficulte de la mission
- Urgence de la mission
- Complexite / transversalite
- Probabilite d'escalade
- Sensibilite a la surcharge
- Tolerance a la latence

Ces parametres influencent reellement la simulation : routage, delegation, escalade, saturation, convergence.

## Mode live

Le mode Live Auto enchaine les iterations automatiquement avec animation visible :
- Circulation des flux entre agents
- Mise en surbrillance des liens actifs
- Pulse sur les noeuds impliques
- Mise a jour des etats en direct
- Logs et metriques temps reel
- Progression fluide de la mission

Le mode Pas a Pas permet un controle iteration par iteration.

## Plein ecran

Le bouton Plein ecran agrandit la zone de simulation en mode natif.
Redimensionnement propre, recentrage du graphe, maintien des interactions, sortie propre.

## Scenarios organisationnels

8 presets de configuration :
- Organisation equilibree
- Chef tres centralisateur
- Chiara tres coordinatrice
- Experts tres autonomes
- Validation forte
- Forte transversalite
- Organisation sous surcharge
- Delegation optimisee
- Reseau desequilibre

Chaque scenario modifie les parametres et les comportements reels.

## Visualisation du graphe

- Chef Agent au centre, tres identifiable (anneau or)
- Chiara clairement visible (anneau violet)
- Experts distribues en anneau autour du noyau
- Liens differencies par type (hierarchique, collaboration, validation, consultation, support, transfert, escalade, synthese)
- Zoom, drag, hover, clic, tooltip
- Noeuds actifs mis en evidence par pulse et halo
- Densite maitrisee, lisibilite premium

## Lecture systeme

Le panneau d'interpretation affiche :
- Charge globale, fluidite, saturation
- Taux de delegation et d'escalade
- Charge Chef et Chiara
- Experts les plus sollicites
- Experts sous-utilises
- Goulets d'etranglement
- Qualite moyenne estimee
- Phase du systeme (veille, reception, coordination active, execution distribuee, validation, synthese finale, convergence)
- Interpretation textuelle contextuelle

## Comparaison avant / apres

- Charge initiale vs finale
- Fluidite initiale vs finale
- Charge Chef et Chiara avant / apres
- Nombre de goulets
- Distribution des etats
- Top basculements organisationnels

## Structure technique

- `index.html` — structure du cockpit
- `style.css` — design dark mode premium
- `script.js` — moteur de simulation organisationnel complet
- `README.md` — documentation
- `logo_JLV.jpg` — logo

100% local, front-end only, aucun backend, aucun build, aucun serveur.
Ouverture simple via index.html dans un navigateur moderne.

## Mode d'ouverture

1. Laisser tous les fichiers dans le meme dossier.
2. Ouvrir `index.html` dans un navigateur moderne (Chrome, Edge, Firefox).
3. Choisir une mission et un scenario.
4. Ajuster les parametres selon la configuration souhaitee.
5. Lancer en Live Auto ou en Pas a Pas.
6. Observer la circulation de la mission dans l'organisation.

## Nouveautes V3.1

- Reseau vivant en permanence : activite ambiante cerebrale, liens qui pulsent comme des synapses
- Particules de flux ambiantes meme au repos (aller/retour entre agents)
- Heartbeat du Chef Agent visible en continu
- Respiration de tous les agents actifs (subtile en idle, forte en travail)
- Bouton de lancement de tache proéminent et clair
- Seuils de simulation ajustes : les etats changent visiblement des l'injection
- Escalades, delegations et validations plus frequentes et visibles dans les metriques
- Vitesse d'animation controle aussi le rythme de l'activite ambiante
- Arcs rotatifs distinctifs Chef Agent (or) et Chiara (violet)
- Particules directionnelles qui s'inversent selon la phase

## Limites V3.1

- Simulation demonstrative, pas calibree sur des donnees organisationnelles reelles
- Pas de sauvegarde de configuration ni d'export
- Pas de comparaison multi-runs persistante
- Pas d'edition manuelle des agents
- Pas de connexion a de vrais agents IA

## Pistes V4

- Connexion a de vraies API d'agents IA (Claude, GPT, etc.)
- Missions personnalisees par l'utilisateur
- Edition manuelle des profils d'agents
- Export de rapport / image
- Historique de simulations comparables
- Mode multi-missions simultanees
- Dashboard de performance sur la duree
- Import/export de configurations
- Integration avec des outils d'orchestration reels (n8n, Make, etc.)
