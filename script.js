/* ============================================================
   MiroFish Lite V3 — Cockpit de pilotage agentique
   Moteur de simulation organisationnelle multi-agents
   ============================================================ */

// ── États organisationnels ──────────────────────────────────
const stateMeta = {
  disponible:      { label: "Disponible",      color: "#49d9a2", glow: "rgba(73,217,162,0.30)" },
  en_analyse:      { label: "En analyse",      color: "#74d8ff", glow: "rgba(116,216,255,0.28)" },
  en_coordination: { label: "En coordination", color: "#a78bfa", glow: "rgba(167,139,250,0.28)" },
  en_execution:    { label: "En execution",    color: "#f4bb70", glow: "rgba(244,187,112,0.28)" },
  en_attente:      { label: "En attente",      color: "#c5a6ff", glow: "rgba(197,166,255,0.26)" },
  en_validation:   { label: "En validation",   color: "#67c6e3", glow: "rgba(103,198,227,0.28)" },
  surcharge:       { label: "Surcharge",        color: "#ff9966", glow: "rgba(255,153,102,0.30)" },
  bloque:          { label: "Bloque",           color: "#ff6d6d", glow: "rgba(255,109,109,0.32)" },
  en_arbitrage:    { label: "En arbitrage",    color: "#ffd166", glow: "rgba(255,209,102,0.28)" },
  en_synthese:     { label: "En synthese",     color: "#6dd5ed", glow: "rgba(109,213,237,0.28)" },
  sature:          { label: "Sature",           color: "#ff4747", glow: "rgba(255,71,71,0.34)" },
  critique:        { label: "Critique",         color: "#e74c3c", glow: "rgba(231,76,60,0.36)" },
  offline:         { label: "Offline",          color: "#5a6478", glow: "rgba(90,100,120,0.22)" }
};

const stateOrder = [
  "disponible","en_analyse","en_coordination","en_execution","en_attente",
  "en_validation","surcharge","bloque","en_arbitrage","en_synthese",
  "sature","critique","offline"
];

// Pression organisationnelle par état (0 = fluide, 1 = critique)
const statePressureMap = {
  disponible: 0.05, en_analyse: 0.18, en_coordination: 0.22, en_execution: 0.30,
  en_attente: 0.35, en_validation: 0.25, surcharge: 0.65, bloque: 0.78,
  en_arbitrage: 0.40, en_synthese: 0.20, sature: 0.88, critique: 0.95, offline: 0.50
};

// ── Types de liens ──────────────────────────────────────────
const linkTypeMeta = {
  hierarchique:  { label: "Hierarchique",  color: "#74d8ff", dash: null },
  collaboration: { label: "Collaboration", color: "#49d9a2", dash: null },
  validation:    { label: "Validation",    color: "#ffd166", dash: [6, 4] },
  consultation:  { label: "Consultation",  color: "#c5a6ff", dash: [4, 4] },
  support:       { label: "Support",       color: "#a78bfa", dash: [3, 3] },
  transfert:     { label: "Transfert",     color: "#f4bb70", dash: null },
  escalade:      { label: "Escalade",      color: "#ff6d6d", dash: [8, 3] },
  synthese:      { label: "Synthese",      color: "#6dd5ed", dash: null }
};

// ── Définitions des 22 agents ───────────────────────────────
const agentDefinitions = [
  {
    id: "CHEF", nom: "Chef Agent", role: "Directeur general", specialite: "Arbitrage, supervision, delegation, validation finale",
    niveau: 1, type: "chef",
    capaciteMax: 1.0, vitesseTraitement: 0.70, autonomie: 0.95, fiabilite: 0.92,
    qualiteSortie: 0.90, memoire: 0.88, collaboration: 0.75, besoinValidation: 0.10,
    priorite: 1.0, disponibilite: 0.95, influenceReseau: 0.98, latenceReponse: 0.30,
    sensibiliteSurcharge: 0.55, aptDeleguer: 0.95, aptArbitrer: 0.98, aptSynthetiser: 0.82,
    radius: 18, ring: 0
  },
  {
    id: "CHIARA", nom: "Chiara", role: "Coordinatrice transverse", specialite: "Coordination, reformulation, synthese, lien transverse",
    niveau: 2, type: "coordinatrice",
    capaciteMax: 0.92, vitesseTraitement: 0.82, autonomie: 0.85, fiabilite: 0.90,
    qualiteSortie: 0.88, memoire: 0.90, collaboration: 0.95, besoinValidation: 0.15,
    priorite: 0.95, disponibilite: 0.92, influenceReseau: 0.90, latenceReponse: 0.22,
    sensibiliteSurcharge: 0.48, aptDeleguer: 0.80, aptArbitrer: 0.78, aptSynthetiser: 0.95,
    radius: 15, ring: 1
  },
  {
    id: "EXP_BTP", nom: "Expert BTP", role: "Specialiste construction", specialite: "BTP, genie civil, chantiers",
    niveau: 3, type: "expert", domaines: ["btp","immobilier"],
    capaciteMax: 0.80, vitesseTraitement: 0.65, autonomie: 0.72, fiabilite: 0.85,
    qualiteSortie: 0.82, memoire: 0.70, collaboration: 0.68, besoinValidation: 0.35,
    priorite: 0.70, disponibilite: 0.88, influenceReseau: 0.52, latenceReponse: 0.40,
    sensibiliteSurcharge: 0.60, aptDeleguer: 0.45, aptArbitrer: 0.40, aptSynthetiser: 0.55,
    radius: 10, ring: 2
  },
  {
    id: "EXP_IMMO", nom: "Expert Immobilier", role: "Specialiste immobilier", specialite: "Marche immobilier, investissement, patrimoine",
    niveau: 3, type: "expert", domaines: ["immobilier","finance","btp"],
    capaciteMax: 0.82, vitesseTraitement: 0.68, autonomie: 0.74, fiabilite: 0.86,
    qualiteSortie: 0.84, memoire: 0.72, collaboration: 0.70, besoinValidation: 0.32,
    priorite: 0.72, disponibilite: 0.86, influenceReseau: 0.56, latenceReponse: 0.38,
    sensibiliteSurcharge: 0.58, aptDeleguer: 0.42, aptArbitrer: 0.44, aptSynthetiser: 0.60,
    radius: 10, ring: 2
  },
  {
    id: "EXP_JURI", nom: "Expert Juridique", role: "Specialiste droit", specialite: "Droit, contrats, conformite, patrimoine",
    niveau: 3, type: "expert", domaines: ["juridique","finance","immobilier"],
    capaciteMax: 0.78, vitesseTraitement: 0.58, autonomie: 0.80, fiabilite: 0.92,
    qualiteSortie: 0.90, memoire: 0.85, collaboration: 0.60, besoinValidation: 0.40,
    priorite: 0.75, disponibilite: 0.82, influenceReseau: 0.60, latenceReponse: 0.45,
    sensibiliteSurcharge: 0.52, aptDeleguer: 0.35, aptArbitrer: 0.72, aptSynthetiser: 0.65,
    radius: 10, ring: 2
  },
  {
    id: "EXP_FIN", nom: "Expert Finance", role: "Specialiste finance", specialite: "Analyse financiere, allocation, rendement",
    niveau: 3, type: "expert", domaines: ["finance","crypto","macro"],
    capaciteMax: 0.85, vitesseTraitement: 0.78, autonomie: 0.82, fiabilite: 0.88,
    qualiteSortie: 0.86, memoire: 0.80, collaboration: 0.72, besoinValidation: 0.28,
    priorite: 0.80, disponibilite: 0.88, influenceReseau: 0.68, latenceReponse: 0.32,
    sensibiliteSurcharge: 0.50, aptDeleguer: 0.55, aptArbitrer: 0.60, aptSynthetiser: 0.70,
    radius: 11, ring: 2
  },
  {
    id: "EXP_CRYPTO", nom: "Expert Crypto", role: "Specialiste crypto-actifs", specialite: "Blockchain, wallets, DeFi, tokenomics",
    niveau: 3, type: "expert", domaines: ["crypto","finance","data"],
    capaciteMax: 0.80, vitesseTraitement: 0.82, autonomie: 0.85, fiabilite: 0.78,
    qualiteSortie: 0.80, memoire: 0.74, collaboration: 0.65, besoinValidation: 0.30,
    priorite: 0.68, disponibilite: 0.84, influenceReseau: 0.55, latenceReponse: 0.28,
    sensibiliteSurcharge: 0.56, aptDeleguer: 0.40, aptArbitrer: 0.38, aptSynthetiser: 0.58,
    radius: 10, ring: 2
  },
  {
    id: "EXP_MACRO", nom: "Expert Macro", role: "Specialiste macro-economie", specialite: "Conjoncture, geopolitique, tendances mondiales",
    niveau: 3, type: "expert", domaines: ["macro","finance","veille"],
    capaciteMax: 0.82, vitesseTraitement: 0.70, autonomie: 0.88, fiabilite: 0.86,
    qualiteSortie: 0.88, memoire: 0.84, collaboration: 0.62, besoinValidation: 0.25,
    priorite: 0.74, disponibilite: 0.86, influenceReseau: 0.62, latenceReponse: 0.35,
    sensibiliteSurcharge: 0.45, aptDeleguer: 0.38, aptArbitrer: 0.55, aptSynthetiser: 0.75,
    radius: 10, ring: 2
  },
  {
    id: "EXP_RED", nom: "Expert Redaction", role: "Specialiste redaction", specialite: "Ecriture, storytelling, contenus premium",
    niveau: 3, type: "expert", domaines: ["redaction","communication","presentation"],
    capaciteMax: 0.85, vitesseTraitement: 0.80, autonomie: 0.78, fiabilite: 0.88,
    qualiteSortie: 0.92, memoire: 0.76, collaboration: 0.74, besoinValidation: 0.30,
    priorite: 0.72, disponibilite: 0.90, influenceReseau: 0.58, latenceReponse: 0.25,
    sensibiliteSurcharge: 0.52, aptDeleguer: 0.35, aptArbitrer: 0.30, aptSynthetiser: 0.80,
    radius: 10, ring: 2
  },
  {
    id: "EXP_LINK", nom: "Expert LinkedIn", role: "Specialiste LinkedIn", specialite: "Personal branding, strategie editoriale, engagement",
    niveau: 3, type: "expert", domaines: ["communication","redaction","strategie"],
    capaciteMax: 0.78, vitesseTraitement: 0.85, autonomie: 0.80, fiabilite: 0.82,
    qualiteSortie: 0.84, memoire: 0.68, collaboration: 0.78, besoinValidation: 0.35,
    priorite: 0.68, disponibilite: 0.92, influenceReseau: 0.72, latenceReponse: 0.20,
    sensibiliteSurcharge: 0.48, aptDeleguer: 0.32, aptArbitrer: 0.28, aptSynthetiser: 0.62,
    radius: 10, ring: 2
  },
  {
    id: "EXP_VEILLE", nom: "Expert Veille", role: "Specialiste veille", specialite: "Intelligence economique, signaux faibles, tendances",
    niveau: 3, type: "expert", domaines: ["veille","recherche","data"],
    capaciteMax: 0.82, vitesseTraitement: 0.72, autonomie: 0.85, fiabilite: 0.84,
    qualiteSortie: 0.82, memoire: 0.90, collaboration: 0.65, besoinValidation: 0.22,
    priorite: 0.70, disponibilite: 0.88, influenceReseau: 0.60, latenceReponse: 0.30,
    sensibiliteSurcharge: 0.46, aptDeleguer: 0.38, aptArbitrer: 0.35, aptSynthetiser: 0.72,
    radius: 10, ring: 2
  },
  {
    id: "EXP_DATA", nom: "Expert Data", role: "Specialiste donnees", specialite: "Analyse de donnees, tableaux de bord, metriques",
    niveau: 3, type: "expert", domaines: ["data","automatisation","recherche"],
    capaciteMax: 0.84, vitesseTraitement: 0.80, autonomie: 0.82, fiabilite: 0.86,
    qualiteSortie: 0.84, memoire: 0.78, collaboration: 0.68, besoinValidation: 0.25,
    priorite: 0.74, disponibilite: 0.86, influenceReseau: 0.58, latenceReponse: 0.28,
    sensibiliteSurcharge: 0.54, aptDeleguer: 0.40, aptArbitrer: 0.35, aptSynthetiser: 0.68,
    radius: 10, ring: 2
  },
  {
    id: "EXP_AUTO", nom: "Expert Automatisation", role: "Specialiste automatisation", specialite: "Automatisation, scripts, pipelines, integrations",
    niveau: 3, type: "expert", domaines: ["automatisation","workflow","outils_ia"],
    capaciteMax: 0.86, vitesseTraitement: 0.88, autonomie: 0.90, fiabilite: 0.82,
    qualiteSortie: 0.80, memoire: 0.72, collaboration: 0.62, besoinValidation: 0.20,
    priorite: 0.72, disponibilite: 0.84, influenceReseau: 0.54, latenceReponse: 0.22,
    sensibiliteSurcharge: 0.58, aptDeleguer: 0.48, aptArbitrer: 0.32, aptSynthetiser: 0.55,
    radius: 10, ring: 2
  },
  {
    id: "EXP_WORK", nom: "Expert Workflow", role: "Specialiste workflow", specialite: "Processus, orchestration, enchainements",
    niveau: 3, type: "expert", domaines: ["workflow","automatisation","strategie"],
    capaciteMax: 0.82, vitesseTraitement: 0.75, autonomie: 0.78, fiabilite: 0.86,
    qualiteSortie: 0.84, memoire: 0.80, collaboration: 0.82, besoinValidation: 0.28,
    priorite: 0.74, disponibilite: 0.86, influenceReseau: 0.64, latenceReponse: 0.30,
    sensibiliteSurcharge: 0.50, aptDeleguer: 0.58, aptArbitrer: 0.48, aptSynthetiser: 0.72,
    radius: 10, ring: 2
  },
  {
    id: "EXP_PRES", nom: "Expert Presentation", role: "Specialiste presentation", specialite: "Slides, visuels, mise en forme premium",
    niveau: 3, type: "expert", domaines: ["presentation","communication","ux_ui"],
    capaciteMax: 0.80, vitesseTraitement: 0.78, autonomie: 0.74, fiabilite: 0.84,
    qualiteSortie: 0.90, memoire: 0.68, collaboration: 0.76, besoinValidation: 0.35,
    priorite: 0.66, disponibilite: 0.90, influenceReseau: 0.50, latenceReponse: 0.25,
    sensibiliteSurcharge: 0.52, aptDeleguer: 0.30, aptArbitrer: 0.28, aptSynthetiser: 0.65,
    radius: 10, ring: 2
  },
  {
    id: "EXP_WEB", nom: "Expert Web", role: "Specialiste web", specialite: "Developpement web, sites, landing pages",
    niveau: 3, type: "expert", domaines: ["web","ux_ui","automatisation"],
    capaciteMax: 0.84, vitesseTraitement: 0.85, autonomie: 0.88, fiabilite: 0.84,
    qualiteSortie: 0.86, memoire: 0.72, collaboration: 0.66, besoinValidation: 0.25,
    priorite: 0.72, disponibilite: 0.86, influenceReseau: 0.54, latenceReponse: 0.24,
    sensibiliteSurcharge: 0.56, aptDeleguer: 0.42, aptArbitrer: 0.30, aptSynthetiser: 0.58,
    radius: 10, ring: 2
  },
  {
    id: "EXP_UX", nom: "Expert UX/UI", role: "Specialiste experience utilisateur", specialite: "Design, ergonomie, parcours utilisateur",
    niveau: 3, type: "expert", domaines: ["ux_ui","web","presentation"],
    capaciteMax: 0.80, vitesseTraitement: 0.74, autonomie: 0.76, fiabilite: 0.86,
    qualiteSortie: 0.92, memoire: 0.70, collaboration: 0.80, besoinValidation: 0.32,
    priorite: 0.68, disponibilite: 0.88, influenceReseau: 0.52, latenceReponse: 0.28,
    sensibiliteSurcharge: 0.50, aptDeleguer: 0.35, aptArbitrer: 0.32, aptSynthetiser: 0.62,
    radius: 10, ring: 2
  },
  {
    id: "EXP_RECH", nom: "Expert Recherche", role: "Specialiste recherche", specialite: "Investigation approfondie, sources, validation",
    niveau: 3, type: "expert", domaines: ["recherche","veille","data"],
    capaciteMax: 0.80, vitesseTraitement: 0.62, autonomie: 0.88, fiabilite: 0.90,
    qualiteSortie: 0.88, memoire: 0.92, collaboration: 0.58, besoinValidation: 0.22,
    priorite: 0.72, disponibilite: 0.84, influenceReseau: 0.56, latenceReponse: 0.42,
    sensibiliteSurcharge: 0.44, aptDeleguer: 0.32, aptArbitrer: 0.40, aptSynthetiser: 0.78,
    radius: 10, ring: 2
  },
  {
    id: "EXP_SYNTH", nom: "Expert Synthese", role: "Specialiste synthese", specialite: "Synthese executive, resume, extraction de valeur",
    niveau: 3, type: "expert", domaines: ["synthese","redaction","documentation"],
    capaciteMax: 0.82, vitesseTraitement: 0.76, autonomie: 0.80, fiabilite: 0.88,
    qualiteSortie: 0.90, memoire: 0.86, collaboration: 0.72, besoinValidation: 0.28,
    priorite: 0.76, disponibilite: 0.88, influenceReseau: 0.62, latenceReponse: 0.30,
    sensibiliteSurcharge: 0.48, aptDeleguer: 0.38, aptArbitrer: 0.45, aptSynthetiser: 0.95,
    radius: 10, ring: 2
  },
  {
    id: "EXP_DOC", nom: "Expert Documentation", role: "Specialiste documentation", specialite: "Documentation, bases de connaissance, archivage",
    niveau: 3, type: "expert", domaines: ["documentation","synthese","recherche"],
    capaciteMax: 0.82, vitesseTraitement: 0.72, autonomie: 0.82, fiabilite: 0.90,
    qualiteSortie: 0.86, memoire: 0.94, collaboration: 0.66, besoinValidation: 0.22,
    priorite: 0.64, disponibilite: 0.90, influenceReseau: 0.48, latenceReponse: 0.32,
    sensibiliteSurcharge: 0.42, aptDeleguer: 0.30, aptArbitrer: 0.28, aptSynthetiser: 0.72,
    radius: 10, ring: 2
  },
  {
    id: "EXP_IA", nom: "Expert Outils IA", role: "Specialiste outils IA", specialite: "Prompts, agents, LLM, integration IA",
    niveau: 3, type: "expert", domaines: ["outils_ia","automatisation","workflow"],
    capaciteMax: 0.86, vitesseTraitement: 0.88, autonomie: 0.90, fiabilite: 0.80,
    qualiteSortie: 0.82, memoire: 0.76, collaboration: 0.70, besoinValidation: 0.25,
    priorite: 0.78, disponibilite: 0.86, influenceReseau: 0.66, latenceReponse: 0.20,
    sensibiliteSurcharge: 0.54, aptDeleguer: 0.52, aptArbitrer: 0.38, aptSynthetiser: 0.65,
    radius: 10, ring: 2
  },
  {
    id: "EXP_STRAT", nom: "Expert Strategie", role: "Specialiste strategie", specialite: "Vision, positionnement, planification strategique",
    niveau: 3, type: "expert", domaines: ["strategie","macro","finance"],
    capaciteMax: 0.82, vitesseTraitement: 0.65, autonomie: 0.85, fiabilite: 0.88,
    qualiteSortie: 0.90, memoire: 0.86, collaboration: 0.72, besoinValidation: 0.30,
    priorite: 0.82, disponibilite: 0.84, influenceReseau: 0.72, latenceReponse: 0.38,
    sensibiliteSurcharge: 0.46, aptDeleguer: 0.55, aptArbitrer: 0.68, aptSynthetiser: 0.85,
    radius: 11, ring: 2
  }
];

// ── Missions prédéfinies ────────────────────────────────────
const missionDefinitions = [
  {
    id: "M01", nom: "Rediger un post LinkedIn strategique sur l'IA",
    domaine: "communication", difficulte: 0.40, urgence: 0.60, ambiguite: 0.35,
    besoinValidation: 0.50, sousTaches: 4, profondeurRecherche: 0.45, coordinationRequise: 0.55,
    expertsClefs: ["EXP_LINK","EXP_RED","EXP_STRAT","EXP_IA"],
    expertsSupport: ["EXP_VEILLE"]
  },
  {
    id: "M02", nom: "Produire une analyse BTP / immobilier",
    domaine: "analyse_sectorielle", difficulte: 0.65, urgence: 0.50, ambiguite: 0.40,
    besoinValidation: 0.65, sousTaches: 6, profondeurRecherche: 0.75, coordinationRequise: 0.60,
    expertsClefs: ["EXP_BTP","EXP_IMMO","EXP_FIN","EXP_JURI"],
    expertsSupport: ["EXP_DATA","EXP_MACRO"]
  },
  {
    id: "M03", nom: "Preparer un rapport de veille hebdomadaire",
    domaine: "veille", difficulte: 0.45, urgence: 0.70, ambiguite: 0.25,
    besoinValidation: 0.40, sousTaches: 5, profondeurRecherche: 0.80, coordinationRequise: 0.50,
    expertsClefs: ["EXP_VEILLE","EXP_RECH","EXP_SYNTH","EXP_DOC"],
    expertsSupport: ["EXP_MACRO"]
  },
  {
    id: "M04", nom: "Construire un mini site web dark premium",
    domaine: "technique", difficulte: 0.60, urgence: 0.45, ambiguite: 0.50,
    besoinValidation: 0.55, sousTaches: 7, profondeurRecherche: 0.35, coordinationRequise: 0.65,
    expertsClefs: ["EXP_WEB","EXP_UX","EXP_PRES","EXP_RED"],
    expertsSupport: ["EXP_AUTO"]
  },
  {
    id: "M05", nom: "Analyser un projet crypto / wallet / allocation",
    domaine: "finance_crypto", difficulte: 0.70, urgence: 0.55, ambiguite: 0.60,
    besoinValidation: 0.70, sousTaches: 6, profondeurRecherche: 0.80, coordinationRequise: 0.55,
    expertsClefs: ["EXP_CRYPTO","EXP_FIN","EXP_MACRO","EXP_DATA"],
    expertsSupport: ["EXP_RECH","EXP_STRAT"]
  },
  {
    id: "M06", nom: "Preparer une synthese executive a partir de notes",
    domaine: "synthese", difficulte: 0.45, urgence: 0.65, ambiguite: 0.35,
    besoinValidation: 0.55, sousTaches: 4, profondeurRecherche: 0.40, coordinationRequise: 0.50,
    expertsClefs: ["EXP_SYNTH","EXP_RED","EXP_DOC","EXP_STRAT"],
    expertsSupport: ["EXP_PRES"]
  },
  {
    id: "M07", nom: "Concevoir un workflow d'automatisation multi-outils",
    domaine: "technique", difficulte: 0.72, urgence: 0.50, ambiguite: 0.55,
    besoinValidation: 0.50, sousTaches: 8, profondeurRecherche: 0.50, coordinationRequise: 0.70,
    expertsClefs: ["EXP_AUTO","EXP_WORK","EXP_IA","EXP_WEB"],
    expertsSupport: ["EXP_DATA"]
  },
  {
    id: "M08", nom: "Generer une presentation premium structuree",
    domaine: "communication", difficulte: 0.50, urgence: 0.60, ambiguite: 0.40,
    besoinValidation: 0.60, sousTaches: 5, profondeurRecherche: 0.35, coordinationRequise: 0.60,
    expertsClefs: ["EXP_PRES","EXP_UX","EXP_RED","EXP_SYNTH"],
    expertsSupport: ["EXP_STRAT"]
  },
  {
    id: "M09", nom: "Repondre a une problematique juridique / patrimoniale",
    domaine: "juridique", difficulte: 0.75, urgence: 0.55, ambiguite: 0.65,
    besoinValidation: 0.80, sousTaches: 5, profondeurRecherche: 0.85, coordinationRequise: 0.55,
    expertsClefs: ["EXP_JURI","EXP_FIN","EXP_IMMO","EXP_STRAT"],
    expertsSupport: ["EXP_RECH","EXP_DOC"]
  },
  {
    id: "M10", nom: "Lancer une mission complexe transversale",
    domaine: "transversal", difficulte: 0.90, urgence: 0.70, ambiguite: 0.75,
    besoinValidation: 0.85, sousTaches: 12, profondeurRecherche: 0.75, coordinationRequise: 0.95,
    expertsClefs: ["EXP_STRAT","EXP_WORK","EXP_IA","EXP_SYNTH","EXP_FIN","EXP_RED"],
    expertsSupport: ["EXP_DATA","EXP_RECH","EXP_AUTO","EXP_DOC","EXP_MACRO","EXP_VEILLE"]
  }
];

// ── Scénarios organisationnels prédéfinis ────────────────────
const orgScenarios = {
  equilibre: {
    nom: "Organisation equilibree",
    description: "Configuration nominale avec repartition fluide des responsabilites.",
    params: { expertsActifs: 20, chargeInitiale: 0.30, autonomieMoy: 0.78, collaborationMoy: 0.70, confianceMutuelle: 0.75, besoinValidationChef: 0.40, roleChiara: 0.70, probaEscalade: 0.25, sensibiliteSurcharge: 0.50, toleranceLatence: 0.60 }
  },
  chefCentral: {
    nom: "Chef tres centralisateur",
    description: "Le Chef controle tout : validation systematique, faible delegation, forte dependance hierarchique. Chiara marginalisee.",
    params: { expertsActifs: 20, chargeInitiale: 0.40, autonomieMoy: 0.38, collaborationMoy: 0.42, confianceMutuelle: 0.48, besoinValidationChef: 0.95, roleChiara: 0.25, probaEscalade: 0.65, sensibiliteSurcharge: 0.70, toleranceLatence: 0.35 }
  },
  chiaraCoord: {
    nom: "Chiara tres coordinatrice",
    description: "Chiara joue un role central : reformulation, lien transverse, forte coordination entre experts.",
    params: { expertsActifs: 20, chargeInitiale: 0.30, autonomieMoy: 0.72, collaborationMoy: 0.82, confianceMutuelle: 0.78, besoinValidationChef: 0.30, roleChiara: 0.95, probaEscalade: 0.20, sensibiliteSurcharge: 0.48, toleranceLatence: 0.65 }
  },
  expertsAutonomes: {
    nom: "Experts tres autonomes",
    description: "Les experts decident seuls : peu de validation, forte initiative, coordination minimale.",
    params: { expertsActifs: 20, chargeInitiale: 0.25, autonomieMoy: 0.92, collaborationMoy: 0.45, confianceMutuelle: 0.80, besoinValidationChef: 0.15, roleChiara: 0.35, probaEscalade: 0.12, sensibiliteSurcharge: 0.55, toleranceLatence: 0.72 }
  },
  validationForte: {
    nom: "Validation forte",
    description: "Chaque livrable passe par un cycle de validation strict. Fluidite reduite mais qualite renforcee.",
    params: { expertsActifs: 20, chargeInitiale: 0.35, autonomieMoy: 0.58, collaborationMoy: 0.65, confianceMutuelle: 0.60, besoinValidationChef: 0.85, roleChiara: 0.60, probaEscalade: 0.45, sensibiliteSurcharge: 0.55, toleranceLatence: 0.45 }
  },
  transversalite: {
    nom: "Forte transversalite",
    description: "Tous les experts interagissent : collaboration croisee maximale, echanges denses.",
    params: { expertsActifs: 20, chargeInitiale: 0.35, autonomieMoy: 0.70, collaborationMoy: 0.92, confianceMutuelle: 0.82, besoinValidationChef: 0.35, roleChiara: 0.85, probaEscalade: 0.20, sensibiliteSurcharge: 0.52, toleranceLatence: 0.58 }
  },
  sousSurcharge: {
    nom: "Organisation sous surcharge",
    description: "Trop de taches, pas assez de capacite : goulets massifs, cascades d'escalades, saturation critique rapide.",
    params: { expertsActifs: 12, chargeInitiale: 0.82, autonomieMoy: 0.55, collaborationMoy: 0.45, confianceMutuelle: 0.42, besoinValidationChef: 0.65, roleChiara: 0.55, probaEscalade: 0.70, sensibiliteSurcharge: 0.92, toleranceLatence: 0.25 }
  },
  delegationOpt: {
    nom: "Delegation optimisee",
    description: "Chef et Chiara delegent efficacement : flux rapides, faible latence, montee en charge maitrisee.",
    params: { expertsActifs: 20, chargeInitiale: 0.28, autonomieMoy: 0.80, collaborationMoy: 0.75, confianceMutuelle: 0.85, besoinValidationChef: 0.25, roleChiara: 0.78, probaEscalade: 0.15, sensibiliteSurcharge: 0.45, toleranceLatence: 0.72 }
  },
  desequilibre: {
    nom: "Reseau desequilibre",
    description: "Certains experts ecrasent la charge tandis que d'autres restent vides. Coordination defaillante, goulets chroniques.",
    params: { expertsActifs: 15, chargeInitiale: 0.65, autonomieMoy: 0.52, collaborationMoy: 0.32, confianceMutuelle: 0.40, besoinValidationChef: 0.55, roleChiara: 0.35, probaEscalade: 0.52, sensibiliteSurcharge: 0.80, toleranceLatence: 0.32 }
  }
};

// ── Modes spéciaux ──────────────────────────────────────────
const specialModes = {
  missionUnique:  { label: "Mission unique",   iterations: 8 },
  stressTest:     { label: "Stress test",       iterations: 14 },
  surcharge:      { label: "Surcharge",         iterations: 10 },
  comparaison:    { label: "Comparaison",       iterations: 8 }
};

// ── Références DOM ──────────────────────────────────────────
const dom = {
  stateLegend: document.getElementById("stateLegend"),
  graphCard: document.getElementById("graphCard"),
  graphStage: document.getElementById("graphStage"),
  networkCanvas: document.getElementById("networkCanvas"),
  graphBadge: document.getElementById("graphBadge"),
  engineStatus: document.getElementById("engineStatus"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  missionSelect: document.getElementById("missionSelect"),
  scenarioSelect: document.getElementById("scenarioSelect"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  speedSelect: document.getElementById("speedSelect"),
  // Paramètres organisationnels
  pExpertsActifs: document.getElementById("pExpertsActifs"),
  pExpertsActifsVal: document.getElementById("pExpertsActifsVal"),
  pChargeInitiale: document.getElementById("pChargeInitiale"),
  pChargeInitialeVal: document.getElementById("pChargeInitialeVal"),
  pAutonomie: document.getElementById("pAutonomie"),
  pAutonomieVal: document.getElementById("pAutonomieVal"),
  pCollaboration: document.getElementById("pCollaboration"),
  pCollaborationVal: document.getElementById("pCollaborationVal"),
  pConfiance: document.getElementById("pConfiance"),
  pConfianceVal: document.getElementById("pConfianceVal"),
  pValidation: document.getElementById("pValidation"),
  pValidationVal: document.getElementById("pValidationVal"),
  pRoleChiara: document.getElementById("pRoleChiara"),
  pRoleChiaraVal: document.getElementById("pRoleChiaraVal"),
  pDifficulte: document.getElementById("pDifficulte"),
  pDifficulteVal: document.getElementById("pDifficulteVal"),
  pUrgence: document.getElementById("pUrgence"),
  pUrgenceVal: document.getElementById("pUrgenceVal"),
  pComplexite: document.getElementById("pComplexite"),
  pComplexiteVal: document.getElementById("pComplexiteVal"),
  pEscalade: document.getElementById("pEscalade"),
  pEscaladeVal: document.getElementById("pEscaladeVal"),
  pSurcharge: document.getElementById("pSurcharge"),
  pSurchargeVal: document.getElementById("pSurchargeVal"),
  pLatence: document.getElementById("pLatence"),
  pLatenceVal: document.getElementById("pLatenceVal"),
  // Boutons
  runButton: document.getElementById("runButton"),
  pauseButton: document.getElementById("pauseButton"),
  stepButton: document.getElementById("stepButton"),
  resetButton: document.getElementById("resetButton"),
  regenerateButton: document.getElementById("regenerateButton"),
  // Panneaux
  scenarioBrief: document.getElementById("scenarioBrief"),
  networkFacts: document.getElementById("networkFacts"),
  agentDetail: document.getElementById("agentDetail"),
  comparisonSummary: document.getElementById("comparisonSummary"),
  comparisonHighlights: document.getElementById("comparisonHighlights"),
  distributionComparison: document.getElementById("distributionComparison"),
  timelineList: document.getElementById("timelineList"),
  insightPanel: document.getElementById("insightPanel"),
  metricCards: Array.from(document.querySelectorAll(".metric-card"))
};

const ctx = dom.networkCanvas.getContext("2d");

// ── État global de l'application ────────────────────────────
const app = {
  activeMissionKey: "M01",
  activeScenarioKey: "equilibre",
  engineMode: "live",
  animationDelay: 420,
  agents: [],
  links: [],
  baseline: new Map(),
  agentMap: new Map(),
  iteration: 0,
  missionInjected: false,
  running: false,
  paused: false,
  pendingIterations: 0,
  runTimer: null,
  selectedAgentId: "CHEF",
  hoveredAgentId: null,
  canvasSize: { width: 0, height: 0 },
  view: { scale: 1, x: 0, y: 0 },
  drag: { mode: null, pointerId: null, nodeId: null, startX: 0, startY: 0, viewX: 0, viewY: 0, moved: false },
  logs: [],
  metricSnapshot: {},
  systemSnapshot: null,
  recentTransitions: [],
  fullscreen: false,
  particles: [],
  time: 0,
  stepImpulse: 0,
  missionProgress: 0,
  missionPhase: "veille",
  exchangeCount: 0,
  escalationCount: 0,
  delegationCount: 0,
  validationCount: 0,
  // Paramètres pilotables
  params: {
    expertsActifs: 20,
    chargeInitiale: 0.30,
    autonomieMoy: 0.78,
    collaborationMoy: 0.70,
    confianceMutuelle: 0.75,
    besoinValidationChef: 0.40,
    roleChiara: 0.70,
    difficulte: 0.50,
    urgence: 0.50,
    complexite: 0.50,
    probaEscalade: 0.25,
    sensibiliteSurcharge: 0.50,
    toleranceLatence: 0.60
  }
};

// ── Initialisation ──────────────────────────────────────────
init();

function init() {
  populateSelects();
  renderStateLegend();
  bindControls();
  buildOrganization();
  updateParamLabels();
  updateScenarioBrief();
  updateEngineUI();
  requestAnimationFrame(animationLoop);
}

function populateSelects() {
  dom.missionSelect.innerHTML = missionDefinitions
    .map(m => `<option value="${m.id}">${m.nom}</option>`).join("");
  dom.missionSelect.value = app.activeMissionKey;
  dom.scenarioSelect.innerHTML = Object.entries(orgScenarios)
    .map(([key, s]) => `<option value="${key}">${s.nom}</option>`).join("");
  dom.scenarioSelect.value = app.activeScenarioKey;
}

function renderStateLegend() {
  dom.stateLegend.innerHTML = stateOrder
    .map(key => {
      const m = stateMeta[key];
      return `<span class="legend-chip"><span class="legend-dot" style="--ring-color:${m.color};--dot-color:${m.color};"></span>${m.label}</span>`;
    }).join("");
}

// ── Construction de l'organisation ──────────────────────────
function buildOrganization() {
  stopSimulation();
  const agents = [];
  const links = [];
  const numActive = app.params.expertsActifs;

  for (let i = 0; i < agentDefinitions.length; i++) {
    const def = agentDefinitions[i];
    const isExpert = def.niveau === 3;
    const expertIndex = isExpert ? i - 2 : -1;
    const isActive = !isExpert || expertIndex < numActive;

    // Position en anneaux concentriques
    let homeX = 0, homeY = 0;
    if (def.ring === 0) {
      homeX = 0; homeY = 0;
    } else if (def.ring === 1) {
      homeX = 65; homeY = -30;
    } else {
      const angle = (expertIndex / numActive) * Math.PI * 2 - Math.PI / 2;
      const ringRadius = 220 + (expertIndex % 2) * 40;
      homeX = Math.cos(angle) * ringRadius;
      homeY = Math.sin(angle) * ringRadius;
    }

    const paramMod = {
      autonomie: isExpert ? clamp(def.autonomie * (app.params.autonomieMoy / 0.78), 0.1, 1) : def.autonomie,
      collaboration: isExpert ? clamp(def.collaboration * (app.params.collaborationMoy / 0.70), 0.1, 1) : def.collaboration,
      sensibiliteSurcharge: isExpert ? clamp(def.sensibiliteSurcharge * (app.params.sensibiliteSurcharge / 0.50), 0.1, 1) : def.sensibiliteSurcharge
    };

    agents.push({
      id: def.id,
      nom: def.nom,
      role: def.role,
      specialite: def.specialite,
      niveau: def.niveau,
      type: def.type,
      domaines: def.domaines || [],
      capaciteMax: def.capaciteMax,
      charge: isActive ? clamp(app.params.chargeInitiale * (0.7 + Math.sin(i * 2.7) * 0.3), 0, 0.95) : 0,
      vitesseTraitement: def.vitesseTraitement,
      autonomie: paramMod.autonomie,
      fiabilite: def.fiabilite,
      qualiteSortie: def.qualiteSortie,
      memoire: def.memoire,
      collaboration: paramMod.collaboration,
      besoinValidation: def.besoinValidation,
      priorite: def.priorite,
      disponibilite: isActive ? def.disponibilite : 0,
      influenceReseau: def.influenceReseau,
      latenceReponse: def.latenceReponse,
      sensibiliteSurcharge: paramMod.sensibiliteSurcharge,
      aptDeleguer: def.aptDeleguer,
      aptArbitrer: def.aptArbitrer,
      aptSynthetiser: def.aptSynthetiser,
      radius: def.radius,
      ring: def.ring,
      connections: [],
      state: isActive ? "disponible" : "offline",
      previousState: "disponible",
      pulse: 0,
      recentImpact: 0,
      lastDeltaCharge: 0,
      changeCount: 0,
      lastStateChangeIteration: -1,
      missionsRecentes: [],
      history: [{ iteration: 0, label: "Initialisation", detail: `${def.role} · Disponible` }],
      x: homeX + (Math.sin(i * 3.1) * 12),
      y: homeY + (Math.cos(i * 2.3) * 12),
      vx: 0, vy: 0,
      homeX, homeY,
      fixed: def.ring <= 1,
      active: isActive
    });
  }

  // Liens hiérarchiques : Chef → tous les experts actifs
  const activeExperts = agents.filter(a => a.type === "expert" && a.active);
  const chiara = agents.find(a => a.id === "CHIARA");

  // Chef ↔ Chiara : lien fort stratégique
  links.push({ source: "CHEF", target: "CHIARA", type: "hierarchique", intensite: 0.95, frequence: 0.90, confiance: 0.92, dependance: 0.80, sensDominant: "bidirectionnel", latence: 0.15, validationNecessaire: false, stabilite: 0.95, activity: 0, activityType: "neutral" });

  for (const expert of activeExperts) {
    // Chef → expert : délégation, validation
    links.push({ source: "CHEF", target: expert.id, type: "hierarchique", intensite: 0.60, frequence: 0.45, confiance: app.params.confianceMutuelle * 0.9, dependance: 0.50, sensDominant: "descendant", latence: 0.30, validationNecessaire: app.params.besoinValidationChef > 0.5, stabilite: 0.80, activity: 0, activityType: "neutral" });

    // Chiara → expert : coordination
    const chiaraWeight = app.params.roleChiara;
    links.push({ source: "CHIARA", target: expert.id, type: "collaboration", intensite: 0.55 * chiaraWeight, frequence: 0.50 * chiaraWeight, confiance: app.params.confianceMutuelle * 0.85, dependance: 0.35, sensDominant: "bidirectionnel", latence: 0.22, validationNecessaire: false, stabilite: 0.82, activity: 0, activityType: "neutral" });
  }

  // Liens entre experts de domaines proches
  for (let i = 0; i < activeExperts.length; i++) {
    for (let j = i + 1; j < activeExperts.length; j++) {
      const a = activeExperts[i];
      const b = activeExperts[j];
      const sharedDomains = (a.domaines || []).filter(d => (b.domaines || []).includes(d)).length;
      if (sharedDomains > 0) {
        const collab = app.params.collaborationMoy;
        links.push({
          source: a.id, target: b.id,
          type: sharedDomains >= 2 ? "collaboration" : "consultation",
          intensite: clamp(0.30 + sharedDomains * 0.20 + collab * 0.15, 0.2, 0.9),
          frequence: clamp(0.25 + sharedDomains * 0.15 + collab * 0.10, 0.15, 0.8),
          confiance: app.params.confianceMutuelle * 0.8,
          dependance: clamp(0.15 + sharedDomains * 0.10, 0.1, 0.5),
          sensDominant: "bidirectionnel",
          latence: 0.28,
          validationNecessaire: false,
          stabilite: 0.75,
          activity: 0,
          activityType: "neutral"
        });
      }
    }
  }

  // Attacher les connexions
  for (const agent of agents) { agent.connections = []; }
  for (const link of links) {
    const sa = agents.find(a => a.id === link.source);
    const ta = agents.find(a => a.id === link.target);
    if (sa && ta) {
      if (!sa.connections.includes(link.target)) sa.connections.push(link.target);
      if (!ta.connections.includes(link.source)) ta.connections.push(link.source);
    }
  }

  app.agents = agents;
  app.links = links;
  buildRuntimeIndexes();

  app.iteration = 0;
  app.missionInjected = false;
  app.missionProgress = 0;
  app.missionPhase = "veille";
  app.exchangeCount = 0;
  app.escalationCount = 0;
  app.delegationCount = 0;
  app.validationCount = 0;
  app.logs = [];
  app.recentTransitions = [];
  app.baseline = new Map(app.agents.map(a => [a.id, snapshotAgent(a)]));
  app.metricSnapshot = {};

  pushLog("Organisation prete", `${agents.filter(a => a.active).length} agents actifs, ${links.length} liaisons. Pret a recevoir une mission.`);
  resetView();
  updateAll();
}

function buildRuntimeIndexes() {
  app.agentMap = new Map(app.agents.map(a => [a.id, a]));
}

function snapshotAgent(agent) {
  return { state: agent.state, charge: agent.charge, disponibilite: agent.disponibilite };
}

// ── Contrôles et bindings ───────────────────────────────────
function bindControls() {
  dom.missionSelect.addEventListener("change", () => {
    app.activeMissionKey = dom.missionSelect.value;
    updateScenarioBrief();
    resetOrganization("Mission selectionnee : " + getMission().nom);
  });

  dom.scenarioSelect.addEventListener("change", () => {
    const key = dom.scenarioSelect.value;
    app.activeScenarioKey = key;
    applyScenarioParams(orgScenarios[key].params);
    updateScenarioBrief();
    buildOrganization();
  });

  dom.speedSelect.addEventListener("change", () => {
    app.animationDelay = Number(dom.speedSelect.value);
    updateEngineUI();
  });

  dom.modeButtons.forEach(btn => {
    btn.addEventListener("click", () => setEngineMode(btn.dataset.mode));
  });

  // Sliders paramètres
  const paramBindings = [
    ["pExpertsActifs",  "expertsActifs",  v => Math.round(v), true],
    ["pChargeInitiale", "chargeInitiale", v => v / 100, true],
    ["pAutonomie",      "autonomieMoy",   v => v / 100, true],
    ["pCollaboration",  "collaborationMoy", v => v / 100, true],
    ["pConfiance",      "confianceMutuelle", v => v / 100, true],
    ["pValidation",     "besoinValidationChef", v => v / 100, false],
    ["pRoleChiara",     "roleChiara",     v => v / 100, false],
    ["pDifficulte",     "difficulte",     v => v / 100, false],
    ["pUrgence",        "urgence",        v => v / 100, false],
    ["pComplexite",     "complexite",     v => v / 100, false],
    ["pEscalade",       "probaEscalade",  v => v / 100, false],
    ["pSurcharge",      "sensibiliteSurcharge", v => v / 100, true],
    ["pLatence",        "toleranceLatence", v => v / 100, false]
  ];

  paramBindings.forEach(([domId, paramKey, transform, rebuild]) => {
    const el = dom[domId];
    if (!el) return;
    el.addEventListener("input", () => {
      app.params[paramKey] = transform(Number(el.value));
      updateParamLabels();
      if (rebuild && !app.missionInjected) buildOrganization();
    });
  });

  dom.runButton.addEventListener("click", runSimulation);
  dom.pauseButton.addEventListener("click", togglePause);
  dom.stepButton.addEventListener("click", stepForward);
  dom.resetButton.addEventListener("click", () => resetOrganization("Etat reinitialise."));
  dom.regenerateButton.addEventListener("click", () => buildOrganization());
  dom.fullscreenButton.addEventListener("click", toggleFullscreen);

  dom.networkCanvas.addEventListener("pointerdown", onPointerDown);
  dom.networkCanvas.addEventListener("pointermove", onPointerMove);
  dom.networkCanvas.addEventListener("pointerup", onPointerUp);
  dom.networkCanvas.addEventListener("pointerleave", onPointerLeave);
  dom.networkCanvas.addEventListener("wheel", onWheel, { passive: false });
  dom.networkCanvas.addEventListener("dblclick", resetView);
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
}

function applyScenarioParams(p) {
  app.params.expertsActifs = p.expertsActifs;
  app.params.chargeInitiale = p.chargeInitiale;
  app.params.autonomieMoy = p.autonomieMoy;
  app.params.collaborationMoy = p.collaborationMoy;
  app.params.confianceMutuelle = p.confianceMutuelle;
  app.params.besoinValidationChef = p.besoinValidationChef;
  app.params.roleChiara = p.roleChiara;
  app.params.probaEscalade = p.probaEscalade;
  app.params.sensibiliteSurcharge = p.sensibiliteSurcharge;
  app.params.toleranceLatence = p.toleranceLatence;
  syncSlidersFromParams();
}

function syncSlidersFromParams() {
  const p = app.params;
  if (dom.pExpertsActifs)  dom.pExpertsActifs.value = p.expertsActifs;
  if (dom.pChargeInitiale) dom.pChargeInitiale.value = Math.round(p.chargeInitiale * 100);
  if (dom.pAutonomie)      dom.pAutonomie.value = Math.round(p.autonomieMoy * 100);
  if (dom.pCollaboration)  dom.pCollaboration.value = Math.round(p.collaborationMoy * 100);
  if (dom.pConfiance)      dom.pConfiance.value = Math.round(p.confianceMutuelle * 100);
  if (dom.pValidation)     dom.pValidation.value = Math.round(p.besoinValidationChef * 100);
  if (dom.pRoleChiara)     dom.pRoleChiara.value = Math.round(p.roleChiara * 100);
  if (dom.pDifficulte)     dom.pDifficulte.value = Math.round(p.difficulte * 100);
  if (dom.pUrgence)        dom.pUrgence.value = Math.round(p.urgence * 100);
  if (dom.pComplexite)     dom.pComplexite.value = Math.round(p.complexite * 100);
  if (dom.pEscalade)       dom.pEscalade.value = Math.round(p.probaEscalade * 100);
  if (dom.pSurcharge)      dom.pSurcharge.value = Math.round(p.sensibiliteSurcharge * 100);
  if (dom.pLatence)        dom.pLatence.value = Math.round(p.toleranceLatence * 100);
  updateParamLabels();
}

function updateParamLabels() {
  const p = app.params;
  if (dom.pExpertsActifsVal)  dom.pExpertsActifsVal.textContent = p.expertsActifs;
  if (dom.pChargeInitialeVal) dom.pChargeInitialeVal.textContent = formatPercent(p.chargeInitiale);
  if (dom.pAutonomieVal)      dom.pAutonomieVal.textContent = formatPercent(p.autonomieMoy);
  if (dom.pCollaborationVal)  dom.pCollaborationVal.textContent = formatPercent(p.collaborationMoy);
  if (dom.pConfianceVal)      dom.pConfianceVal.textContent = formatPercent(p.confianceMutuelle);
  if (dom.pValidationVal)     dom.pValidationVal.textContent = formatPercent(p.besoinValidationChef);
  if (dom.pRoleChiaraVal)     dom.pRoleChiaraVal.textContent = formatPercent(p.roleChiara);
  if (dom.pDifficulteVal)     dom.pDifficulteVal.textContent = formatPercent(p.difficulte);
  if (dom.pUrgenceVal)        dom.pUrgenceVal.textContent = formatPercent(p.urgence);
  if (dom.pComplexiteVal)     dom.pComplexiteVal.textContent = formatPercent(p.complexite);
  if (dom.pEscaladeVal)       dom.pEscaladeVal.textContent = formatPercent(p.probaEscalade);
  if (dom.pSurchargeVal)      dom.pSurchargeVal.textContent = formatPercent(p.sensibiliteSurcharge);
  if (dom.pLatenceVal)        dom.pLatenceVal.textContent = formatPercent(p.toleranceLatence);
}

function getMission() {
  return missionDefinitions.find(m => m.id === app.activeMissionKey) || missionDefinitions[0];
}

function setEngineMode(mode) {
  if (mode === app.engineMode) return;
  stopSimulation();
  app.engineMode = mode;
  updateScenarioBrief();
  updateEngineUI();
}

function updateEngineUI() {
  dom.modeButtons.forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.mode === app.engineMode);
  });
  dom.runButton.textContent = app.missionInjected ? (app.running ? "En cours..." : "Relancer") : "▶ LANCER LA TACHE";
  dom.pauseButton.textContent = app.paused ? "Reprendre" : "Pause";
  dom.pauseButton.disabled = app.engineMode !== "live" || (!app.running && !app.paused);
  dom.fullscreenButton.classList.toggle("is-active", app.fullscreen);
  dom.fullscreenButton.textContent = app.fullscreen ? "Quitter plein ecran" : "Plein ecran";

  const phase = app.missionPhase;
  const modeLabel = app.engineMode === "live" ? "live auto" : "pas a pas";
  const statusLabel = app.running ? (app.paused ? "pause" : "execution") : (app.missionInjected ? "active" : "pret");

  dom.engineStatus.innerHTML = `
    <span class="status-pill">Moteur<strong>${statusLabel}</strong></span>
    <span class="status-pill">Mode<strong>${modeLabel}</strong></span>
    <span class="status-pill">Phase<strong>${phase}</strong></span>
  `;
}

// ── Plein écran ─────────────────────────────────────────────
async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (dom.graphCard.requestFullscreen) await dom.graphCard.requestFullscreen();
      return;
    }
    if (document.exitFullscreen) await document.exitFullscreen();
  } catch (_) {
    pushLog("Plein ecran indisponible", "Le navigateur a refuse la demande.");
    updateAll();
  }
}

function handleFullscreenChange() {
  app.fullscreen = document.fullscreenElement === dom.graphCard;
  updateEngineUI();
  setTimeout(() => { resizeCanvas(); resetView(); }, 30);
}

// ── Simulation : contrôle ───────────────────────────────────
function resetOrganization(reason) {
  stopSimulation();
  // Réinitialiser les agents sans reconstruire la topologie
  for (const agent of app.agents) {
    const def = agentDefinitions.find(d => d.id === agent.id);
    const expertIndex = agentDefinitions.indexOf(def) - 2;
    const isActive = agent.type !== "expert" || expertIndex < app.params.expertsActifs;
    agent.state = isActive ? "disponible" : "offline";
    agent.previousState = "disponible";
    agent.charge = isActive ? clamp(app.params.chargeInitiale * (0.7 + Math.sin(agentDefinitions.indexOf(def) * 2.7) * 0.3), 0, 0.95) : 0;
    agent.pulse = 0;
    agent.recentImpact = 0;
    agent.lastDeltaCharge = 0;
    agent.changeCount = 0;
    agent.lastStateChangeIteration = -1;
    agent.missionsRecentes = [];
    agent.history = [{ iteration: 0, label: "Reinitialisation", detail: `${agent.role} · Disponible` }];
    agent.active = isActive;
  }
  app.iteration = 0;
  app.missionInjected = false;
  app.missionProgress = 0;
  app.missionPhase = "veille";
  app.exchangeCount = 0;
  app.escalationCount = 0;
  app.delegationCount = 0;
  app.validationCount = 0;
  app.logs = [];
  app.recentTransitions = [];
  app.baseline = new Map(app.agents.map(a => [a.id, snapshotAgent(a)]));
  app.metricSnapshot = {};

  pushLog("Organisation reinitialisee", reason);
  updateAll();
}

function runSimulation() {
  // Si la mission a déjà convergé, reset avant de relancer
  if (app.missionInjected && app.missionProgress >= 0.95 && !app.running) {
    resetOrganization("Relancement de la mission.");
  }
  if (app.engineMode === "step") {
    ensureMissionInjected();
    pushLog("Mode pas a pas", "Mission injectee. Cliquez 'Etape suivante' pour avancer iteration par iteration.");
    updateAll();
    return;
  }
  startLiveSimulation();
}

function stepForward() {
  if (app.running) return;
  ensureMissionInjected();
  propagateStep();
}

function ensureMissionInjected() {
  if (!app.missionInjected) injectMission();
}

function startLiveSimulation() {
  ensureMissionInjected();
  if (app.running) return;
  app.paused = false;
  app.running = true;
  app.pendingIterations = 12;
  updateEngineUI();
  syncButtons();
  scheduleNextLiveStep();
}

function scheduleNextLiveStep() {
  if (!app.running || app.paused) return;
  if (app.pendingIterations <= 0) { stopSimulation(); return; }
  app.runTimer = window.setTimeout(() => {
    if (!app.running || app.paused) return;
    propagateStep();
    app.pendingIterations -= 1;
    if (app.pendingIterations <= 0) { stopSimulation(); return; }
    scheduleNextLiveStep();
  }, app.animationDelay);
}

function togglePause() {
  if (app.engineMode !== "live") return;
  if (app.running) {
    app.paused = true;
    app.running = false;
    if (app.runTimer) { clearTimeout(app.runTimer); app.runTimer = null; }
    updateEngineUI(); syncButtons();
    return;
  }
  if (app.paused && app.pendingIterations > 0) {
    app.paused = false;
    app.running = true;
    updateEngineUI(); syncButtons();
    scheduleNextLiveStep();
  }
}

function stopSimulation() {
  app.running = false;
  app.paused = false;
  app.pendingIterations = 0;
  if (app.runTimer) { window.clearTimeout(app.runTimer); app.runTimer = null; }
  updateEngineUI();
  syncButtons();
}

// ── Injection de mission ────────────────────────────────────
function injectMission() {
  const mission = getMission();
  const p = app.params;
  const transitionBatch = [];

  // Ajuster la mission avec les paramètres utilisateur
  const effectiveDifficulty = clamp(mission.difficulte * (0.5 + p.difficulte), 0.1, 1);
  const effectiveUrgency = clamp(mission.urgence * (0.5 + p.urgence), 0.1, 1);
  const effectiveComplexity = clamp(mission.coordinationRequise * (0.5 + p.complexite), 0.1, 1);

  // Chef Agent reçoit et analyse
  const chef = app.agentMap.get("CHEF");
  if (chef && chef.active) {
    const addedCharge = effectiveDifficulty * 0.40 + effectiveUrgency * 0.20 + 0.10;
    chef.charge = clamp(chef.charge + addedCharge, 0, 1);
    chef.state = chef.charge > 0.55 ? "en_arbitrage" : "en_analyse";
    chef.pulse = 1.0;
    chef.recentImpact = 0.8;
    chef.missionsRecentes.push(mission.nom);
    noteAgentHistory(chef, 0, "Mission recue", `${mission.nom} · Analyse en cours`);
    transitionBatch.push({ id: "CHEF", label: "Disponible → En analyse", detail: "Reception et analyse de la mission" });
    app.delegationCount++;
  }

  // Chiara reçoit si coordination requise
  const chiara = app.agentMap.get("CHIARA");
  if (chiara && chiara.active && effectiveComplexity > 0.25) {
    const addedCharge = effectiveComplexity * 0.35 * p.roleChiara + 0.08;
    chiara.charge = clamp(chiara.charge + addedCharge, 0, 1);
    chiara.state = "en_coordination";
    chiara.pulse = 0.8;
    chiara.recentImpact = 0.6;
    chiara.missionsRecentes.push(mission.nom);
    noteAgentHistory(chiara, 0, "Coordination activee", `${mission.nom} · Coordination transverse`);
    transitionBatch.push({ id: "CHIARA", label: "Disponible → En coordination", detail: "Prise en charge coordination" });
  }

  // Distribuer aux experts clefs
  for (const expertId of mission.expertsClefs) {
    const expert = app.agentMap.get(expertId);
    if (!expert || !expert.active) continue;
    const chargeImpact = effectiveDifficulty * 0.50 + effectiveUrgency * 0.25 + 0.10;
    expert.charge = clamp(expert.charge + chargeImpact, 0, 1);
    expert.state = expert.charge > 0.70 ? "surcharge" : "en_execution";
    expert.pulse = 0.7;
    expert.recentImpact = 0.5;
    expert.missionsRecentes.push(mission.nom);
    noteAgentHistory(expert, 0, "Tache assignee", `${mission.nom} · Expert clef`);
    transitionBatch.push({ id: expertId, label: `Disponible → ${stateMeta[expert.state].label}`, detail: `Expert clef · charge ${formatPercent(expert.charge)}` });
    app.delegationCount++;
  }

  // Experts support
  for (const expertId of (mission.expertsSupport || [])) {
    const expert = app.agentMap.get(expertId);
    if (!expert || !expert.active) continue;
    const chargeImpact = effectiveDifficulty * 0.30 + effectiveUrgency * 0.15 + 0.05;
    expert.charge = clamp(expert.charge + chargeImpact, 0, 1);
    expert.state = expert.charge > 0.5 ? "en_execution" : "en_analyse";
    expert.pulse = 0.4;
    expert.recentImpact = 0.3;
    expert.missionsRecentes.push(mission.nom);
    noteAgentHistory(expert, 0, "Support active", `${mission.nom} · Expert support`);
    transitionBatch.push({ id: expertId, label: `Disponible → En analyse`, detail: `Expert support` });
  }

  // Activer les liens correspondants
  for (const link of app.links) {
    const allInvolved = [chef?.id, chiara?.id, ...mission.expertsClefs, ...(mission.expertsSupport || [])].filter(Boolean);
    if (allInvolved.includes(link.source) && allInvolved.includes(link.target)) {
      link.activity = clamp(0.4 + effectiveUrgency * 0.4, 0.3, 1);
      link.activityType = link.type;
    }
  }

  app.missionInjected = true;
  app.missionProgress = 0.08;
  app.missionPhase = "reception";
  app.recentTransitions = transitionBatch.slice(0, 10);
  app.stepImpulse = 1.0;

  // Burst de particules Chef → experts clefs
  for (const expertId of mission.expertsClefs) {
    spawnParticle("CHEF", expertId, "#ffd166", 4);
    if (effectiveComplexity > 0.4) spawnParticle("CHIARA", expertId, "#a78bfa", 3);
  }
  // Particules Chef ↔ Chiara
  spawnParticle("CHEF", "CHIARA", "#ffd166", 5);
  spawnParticle("CHIARA", "CHEF", "#a78bfa", 3);

  pushLog("Mission injectee", `${mission.nom} | difficulte ${formatPercent(effectiveDifficulty)} | urgence ${formatPercent(effectiveUrgency)} | coordination ${formatPercent(effectiveComplexity)} | ${mission.expertsClefs.length} experts clefs.`);
  updateAll();
}

// ── Moteur de simulation : une étape ────────────────────────
function propagateStep() {
  const mission = getMission();
  const p = app.params;
  const currentIteration = app.iteration + 1;
  const transitionBatch = [];
  let transitions = 0;

  const effectiveDifficulty = clamp(mission.difficulte * (0.5 + p.difficulte), 0.1, 1);
  const effectiveUrgency = clamp(mission.urgence * (0.5 + p.urgence), 0.1, 1);
  const effectiveComplexity = clamp(mission.coordinationRequise * (0.5 + p.complexite), 0.1, 1);

  // Phase progression
  const progressIncrement = (1 / (8 + effectiveDifficulty * 6)) * (0.6 + effectiveUrgency * 0.4);
  app.missionProgress = clamp(app.missionProgress + progressIncrement, 0, 1);

  // Déterminer la phase système
  if (app.missionProgress < 0.15) app.missionPhase = "reception";
  else if (app.missionProgress < 0.35) app.missionPhase = "coordination active";
  else if (app.missionProgress < 0.65) app.missionPhase = "execution distribuee";
  else if (app.missionProgress < 0.80) app.missionPhase = "validation";
  else if (app.missionProgress < 0.95) app.missionPhase = "synthese finale";
  else app.missionPhase = "convergence";

  for (const agent of app.agents) {
    if (!agent.active) continue;
    const prevState = agent.state;
    const neighbors = agent.connections.map(id => app.agentMap.get(id)).filter(a => a && a.active);

    // Charge en provenance des voisins
    let incomingPressure = 0;
    let collaborationBonus = 0;
    let escalationPressure = 0;
    let exchangeThisTick = 0;

    for (const neighbor of neighbors) {
      const link = findLink(agent.id, neighbor.id);
      if (!link) continue;
      const neighborPressure = statePressureMap[neighbor.state] || 0;
      const linkStrength = link.intensite * link.confiance;

      if (neighbor.charge > 0.3 && linkStrength > 0.2) {
        incomingPressure += (neighbor.charge - 0.2) * linkStrength * 0.18;
        exchangeThisTick++;
      }
      if (neighbor.state === "en_coordination" || neighbor.state === "en_execution" || neighbor.state === "en_analyse") {
        collaborationBonus += agent.collaboration * linkStrength * 0.06;
        exchangeThisTick++;
      }
      if (neighbor.state === "surcharge" || neighbor.state === "bloque" || neighbor.state === "sature" || neighbor.state === "critique") {
        escalationPressure += neighborPressure * linkStrength * p.probaEscalade * 0.25;
      }

      // Activité du lien — plus réactive
      if (neighborPressure > 0.15 || agent.charge > 0.25) {
        link.activity = clamp(link.activity * 0.4 + (neighborPressure + agent.charge) * 0.45, 0, 1);
        link.activityType = link.type;
      }
    }

    app.exchangeCount += exchangeThisTick;

    // Évolution de la charge
    const processingRate = agent.vitesseTraitement * (0.5 + agent.autonomie * 0.3) * (1 - effectiveDifficulty * 0.4);
    const chargeReduction = processingRate * 0.035 * (app.missionProgress > 0.75 ? 1.5 : 1.0);
    const chargeIncrease = incomingPressure + escalationPressure - collaborationBonus;
    const surchargeEffect = agent.charge > 0.8 ? (agent.charge - 0.8) * agent.sensibiliteSurcharge * 0.15 : 0;

    const prevCharge = agent.charge;
    agent.charge = clamp(agent.charge + chargeIncrease - chargeReduction + surchargeEffect, 0, 1);
    agent.lastDeltaCharge = agent.charge - prevCharge;

    // Validation : les experts remontent vers Chef
    if (agent.type === "expert" && agent.charge < 0.35 && prevCharge >= 0.35 && p.besoinValidationChef > 0.25) {
      const chef = app.agentMap.get("CHEF");
      if (chef && chef.active) {
        chef.charge = clamp(chef.charge + 0.08 * p.besoinValidationChef, 0, 1);
        app.validationCount++;
        const chefLink = findLink("CHEF", agent.id);
        if (chefLink) { chefLink.activity = 0.7; chefLink.activityType = "validation"; }
      }
    }

    // Escalade
    if (agent.charge > 0.65 && agent.type === "expert") {
      const roll = pseudoRandom(currentIteration * 17 + agent.id.charCodeAt(agent.id.length - 1) * 31);
      if (roll < p.probaEscalade) {
        const chef = app.agentMap.get("CHEF");
        if (chef && chef.active) {
          chef.charge = clamp(chef.charge + 0.10, 0, 1);
          app.escalationCount++;
          const chefLink = findLink("CHEF", agent.id);
          if (chefLink) { chefLink.activity = 0.9; chefLink.activityType = "escalade"; }
        }
        // Chiara absorbe si son rôle est fort
        if (p.roleChiara > 0.6) {
          const chiara = app.agentMap.get("CHIARA");
          if (chiara && chiara.active) {
            chiara.charge = clamp(chiara.charge + 0.06, 0, 1);
            const cLink = findLink("CHIARA", agent.id);
            if (cLink) { cLink.activity = 0.7; cLink.activityType = "support"; }
          }
        }
      }
    }

    // Dériver le nouvel état
    agent.previousState = prevState;
    agent.state = deriveAgentState(agent, currentIteration);

    if (agent.state !== prevState) {
      transitions++;
      agent.changeCount++;
      agent.lastStateChangeIteration = currentIteration;
      agent.pulse = Math.max(agent.pulse, 0.9);
      agent.recentImpact = Math.max(agent.recentImpact, 0.7);
      // Impulsion physique : l'agent "réagit" visuellement
      const dist = Math.hypot(agent.x, agent.y) || 1;
      agent.vx += (agent.x / dist) * 4.5;
      agent.vy += (agent.y / dist) * 4.5;
      noteAgentHistory(agent, currentIteration, `${stateMeta[prevState].label} → ${stateMeta[agent.state].label}`, `Charge ${formatPercent(agent.charge)} · ${determineRole(agent)}`);
      transitionBatch.push({ id: agent.id, label: `${stateMeta[prevState].label} → ${stateMeta[agent.state].label}`, detail: `${agent.nom} · charge ${formatPercent(agent.charge)}` });
      // Spawn particles from this agent toward its neighbors
      for (const nId of agent.connections.slice(0, 3)) {
        spawnParticle(agent.id, nId, stateMeta[agent.state].color, 2);
      }
    } else if (Math.abs(agent.lastDeltaCharge) > 0.08) {
      agent.pulse = Math.max(agent.pulse * 0.5, Math.abs(agent.lastDeltaCharge) * 3);
      noteAgentHistory(agent, currentIteration, "Evolution de charge", `${formatSignedPercent(agent.lastDeltaCharge)} · ${stateMeta[agent.state].label}`);
    }
  }

  // Décroissance naturelle des liens inactifs
  for (const link of app.links) {
    if (link.activity > 0.02) {
      link.activity *= 0.75;
    } else {
      link.activity = 0;
      link.activityType = "neutral";
    }
  }

  app.iteration = currentIteration;
  app.recentTransitions = transitionBatch.slice(0, 10);
  app.stepImpulse = 0.6 + transitions * 0.05;
  pushLog(`Iteration ${String(currentIteration).padStart(2, "0")}`, buildIterationNarrative(transitions));
  updateAll();
}

function deriveAgentState(agent, iteration) {
  if (!agent.active) return "offline";
  const c = agent.charge;
  const p = app.params;
  const phase = app.missionPhase;

  if (c > 0.92) return "critique";
  if (c > 0.85) return "sature";
  if (c > 0.75 && agent.sensibiliteSurcharge > 0.6) return "surcharge";
  if (c > 0.70 && agent.latenceReponse > 0.4) return "bloque";

  // États liés au rôle
  if (agent.id === "CHEF") {
    if (c > 0.60) return "en_arbitrage";
    if (phase === "validation" || app.validationCount > app.iteration * 0.8) return "en_validation";
    if (c > 0.30) return "en_analyse";
    return "disponible";
  }
  if (agent.id === "CHIARA") {
    if (c > 0.65) return "surcharge";
    if (phase === "synthese finale" || phase === "convergence") return "en_synthese";
    if (c > 0.25) return "en_coordination";
    return "disponible";
  }

  // Experts — seuils abaissés pour variété d'états
  if (c > 0.60) return "surcharge";
  if (phase === "validation" && c < 0.30 && p.besoinValidationChef > 0.35) return "en_attente";
  if ((phase === "synthese finale" || phase === "convergence") && agent.aptSynthetiser > 0.6) return "en_synthese";
  if (phase === "validation" && c > 0.20) return "en_validation";
  if (c > 0.30) return "en_execution";
  if (c > 0.15 && agent.collaboration > 0.5) return "en_coordination";
  if (c > 0.08) return "en_analyse";
  return "disponible";
}

function buildIterationNarrative(transitions) {
  const metrics = computeMetrics();
  const phase = app.missionPhase;
  const activeCount = app.agents.filter(a => a.active && a.state !== "disponible").length;
  return `${transitions} transitions | phase ${phase} | progression ${formatPercent(app.missionProgress)} | charge globale ${formatPercent(metrics.chargeGlobale)} | ${activeCount} agents mobilises | ${app.exchangeCount} echanges cumules.`;
}

function noteAgentHistory(agent, iteration, label, detail) {
  agent.history = agent.history || [];
  agent.history.unshift({ iteration, label, detail });
  agent.history = agent.history.slice(0, 6);
}

function findLink(idA, idB) {
  return app.links.find(l => (l.source === idA && l.target === idB) || (l.source === idB && l.target === idA));
}

function determineRole(agent) {
  if (agent.id === "CHEF") return "Superviseur";
  if (agent.id === "CHIARA") return "Coordinatrice";
  if (agent.charge > 0.85) return "Goulet";
  if (agent.connections.length >= 8) return "Hub";
  if (agent.aptSynthetiser > 0.8) return "Synthetiseur";
  if (agent.aptDeleguer > 0.7) return "Delegateur";
  if (agent.autonomie > 0.85) return "Autonome";
  if (agent.collaboration > 0.8) return "Collaborateur";
  return "Executant";
}

// ── Métriques ───────────────────────────────────────────────
function computeMetrics() {
  const activeAgents = app.agents.filter(a => a.active);
  const total = activeAgents.length || 1;
  const stateCounts = Object.fromEntries(stateOrder.map(s => [s, 0]));
  let totalCharge = 0;

  for (const agent of activeAgents) {
    totalCharge += agent.charge;
    stateCounts[agent.state] = (stateCounts[agent.state] || 0) + 1;
  }

  const chargeGlobale = totalCharge / total;
  const fluidite = clamp(1 - chargeGlobale * 0.5 - (stateCounts.bloque + stateCounts.sature + stateCounts.critique) / total * 0.8, 0, 1);
  const tauxDelegation = app.delegationCount / Math.max(1, app.iteration + 1);
  const tauxEscalade = app.escalationCount / Math.max(1, app.iteration + 1);
  const saturation = (stateCounts.surcharge + stateCounts.sature + stateCounts.critique + stateCounts.bloque) / total;

  const chef = app.agentMap.get("CHEF");
  const chiara = app.agentMap.get("CHIARA");
  const chargeChef = chef ? chef.charge : 0;
  const chargeChiara = chiara ? chiara.charge : 0;

  const topSollicites = [...activeAgents].filter(a => a.type === "expert").sort((a, b) => b.charge - a.charge).slice(0, 3);
  const sousUtilises = [...activeAgents].filter(a => a.type === "expert" && a.charge < 0.15).slice(0, 3);
  const goulets = activeAgents.filter(a => a.charge > 0.80);
  const qualiteMoyenne = activeAgents.reduce((s, a) => s + a.qualiteSortie * (1 - a.charge * 0.3), 0) / total;

  const phase = app.missionPhase;

  const result = {
    chargeGlobale, fluidite, tauxDelegation, tauxEscalade, saturation,
    chargeChef, chargeChiara, phase,
    stateCounts, topSollicites, sousUtilises, goulets, qualiteMoyenne,
    activeCount: total,
    missionProgress: app.missionProgress,
    exchangeCount: app.exchangeCount,
    escalationCount: app.escalationCount,
    delegationCount: app.delegationCount,
    validationCount: app.validationCount
  };

  app.systemSnapshot = result;
  return result;
}

// ── Rendu UI ────────────────────────────────────────────────
function updateAll() {
  updateMetrics();
  renderGraphBadge();
  renderNetworkFacts();
  renderAgentDetails();
  renderComparison();
  renderTimeline();
  renderInsights();
  updateEngineUI();
  syncButtons();
}

function updateMetrics() {
  const m = computeMetrics();
  const totalActive = m.activeCount || 1;

  const fillByMetric = {
    charge: m.chargeGlobale,
    fluidite: m.fluidite,
    delegation: clamp(m.tauxDelegation / 3, 0, 1),
    escalade: clamp(m.tauxEscalade / 2, 0, 1),
    saturation: m.saturation,
    chargeChef: m.chargeChef,
    chargeChiara: m.chargeChiara,
    phase: app.missionProgress
  };
  const valueByMetric = {
    charge: formatPercent(m.chargeGlobale),
    fluidite: formatPercent(m.fluidite),
    delegation: String(m.delegationCount),
    escalade: String(m.escalationCount),
    saturation: formatPercent(m.saturation),
    chargeChef: formatPercent(m.chargeChef),
    chargeChiara: formatPercent(m.chargeChiara),
    phase: app.missionPhase
  };

  for (const card of dom.metricCards) {
    const key = card.dataset.metric;
    if (!key) continue;
    const valueEl = card.querySelector(".metric-value");
    const fillEl = card.querySelector(".metric-fill");
    if (!valueEl || !fillEl) continue;
    const prev = app.metricSnapshot[key];
    valueEl.textContent = valueByMetric[key] || "";
    fillEl.style.width = `${Math.round((fillByMetric[key] || 0) * 100)}%`;

    if (prev !== undefined && prev !== valueByMetric[key]) {
      card.classList.remove("is-updated", "is-positive", "is-negative");
      void card.offsetWidth;
      card.classList.add("is-updated");
      if (["charge", "escalade", "saturation", "chargeChef", "chargeChiara"].includes(key)) card.classList.add("is-negative");
      if (["fluidite", "delegation"].includes(key)) card.classList.add("is-positive");
      window.setTimeout(() => card.classList.remove("is-updated", "is-positive", "is-negative"), 760);
    }
  }
  app.metricSnapshot = valueByMetric;
}

function renderGraphBadge() {
  const m = computeMetrics();
  const pills = [
    `${m.activeCount} agents actifs`,
    `${app.links.length} liaisons`,
    `Charge ${formatPercent(m.chargeGlobale)}`,
    `Fluidite ${formatPercent(m.fluidite)}`,
    `Phase ${m.phase}`,
    `Mission ${formatPercent(app.missionProgress)}`
  ];
  dom.graphBadge.innerHTML = pills.map(l => `<span>${l}</span>`).join("");
}

function renderNetworkFacts() {
  const m = computeMetrics();
  const mission = getMission();
  const facts = [
    `${m.activeCount} agents actifs`,
    `${app.links.length} liaisons`,
    `Mission ${mission.id}`,
    `Mode ${app.engineMode === "live" ? "Live auto" : "Pas a pas"}`,
    `Vitesse ${getSpeedLabel()}`,
    `Delegations ${m.delegationCount}`,
    `Escalades ${m.escalationCount}`,
    `Validations ${m.validationCount}`
  ];
  dom.networkFacts.innerHTML = `<span class="muted-label">Signal reseau</span><div class="fact-grid">${facts.map(f => `<span class="fact-pill">${f}</span>`).join("")}</div>`;
}

function updateScenarioBrief() {
  const mission = getMission();
  const scenario = orgScenarios[app.activeScenarioKey];
  dom.scenarioBrief.innerHTML = `
    <span class="muted-label">Lecture de la mission</span>
    <p><strong>${mission.nom}</strong></p>
    <div class="chip-row">
      <span class="scenario-chip">Domaine ${mission.domaine}</span>
      <span class="scenario-chip">Difficulte ${formatPercent(mission.difficulte)}</span>
      <span class="scenario-chip">Urgence ${formatPercent(mission.urgence)}</span>
      <span class="scenario-chip">${mission.sousTaches} sous-taches</span>
      <span class="scenario-chip">Coordination ${formatPercent(mission.coordinationRequise)}</span>
    </div>
    <p style="margin-top:8px;color:var(--muted);font-size:0.88rem;">${scenario.description}</p>
  `;
}

function renderAgentDetails() {
  const agent = app.agentMap.get(app.selectedAgentId) || app.agents[0];
  if (!agent) {
    dom.agentDetail.innerHTML = `<div class="agent-placeholder"><span class="muted-label">Aucun agent</span><p>Selectionnez un noeud du graphe.</p></div>`;
    return;
  }
  app.selectedAgentId = agent.id;
  const baseline = app.baseline.get(agent.id);
  const meta = stateMeta[agent.state];
  const role = determineRole(agent);
  const linkedAgents = agent.connections.map(id => app.agentMap.get(id)).filter(Boolean).sort((a, b) => b.charge - a.charge).slice(0, 5);
  const historyItems = (agent.history || []).slice(0, 5);

  // Section spéciale Chef / Chiara
  let specialSection = "";
  if (agent.id === "CHEF") {
    const m = computeMetrics();
    specialSection = `
      <div class="system-box">
        <span class="muted-label">Tableau de bord Chef Agent</span>
        <div class="system-grid">
          <div class="system-cell"><span>Charge arbitrage</span><strong>${formatPercent(agent.charge)}</strong></div>
          <div class="system-cell"><span>Validations</span><strong>${app.validationCount}</strong></div>
          <div class="system-cell"><span>Missions ouvertes</span><strong>${agent.missionsRecentes.length}</strong></div>
          <div class="system-cell"><span>Goulets detectes</span><strong>${m.goulets.length}</strong></div>
        </div>
      </div>`;
  } else if (agent.id === "CHIARA") {
    specialSection = `
      <div class="system-box">
        <span class="muted-label">Tableau de bord Chiara</span>
        <div class="system-grid">
          <div class="system-cell"><span>Coordination</span><strong>${formatPercent(agent.charge)}</strong></div>
          <div class="system-cell"><span>Syntheses</span><strong>${agent.state === "en_synthese" ? "En cours" : "Attente"}</strong></div>
          <div class="system-cell"><span>Liens actifs</span><strong>${agent.connections.length}</strong></div>
          <div class="system-cell"><span>Role</span><strong>${agent.charge > 0.5 ? "Accelerateur" : "Amortisseur"}</strong></div>
        </div>
      </div>`;
  }

  dom.agentDetail.innerHTML = `
    <div class="agent-head">
      <div>
        <span class="section-kicker">${agent.id} · Niveau ${agent.niveau}</span>
        <h3>${agent.nom}</h3>
        <p>${agent.role} · ${agent.specialite}</p>
      </div>
      <span class="state-pill" style="--state-color:${meta.color};">${meta.label}</span>
    </div>
    <div class="agent-tag-row">
      <span class="agent-tag">Role ${role}</span>
      <span class="agent-tag">${agent.connections.length} connexions</span>
      <span class="agent-tag">Priorite ${formatPercent(agent.priorite)}</span>
      ${agent.recentImpact > 0.3 ? `<span class="agent-tag">Activite recente</span>` : ""}
    </div>
    <div class="agent-metrics">
      ${renderMiniMetric("Charge", agent.charge)}
      ${renderMiniMetric("Capacite", agent.capaciteMax)}
      ${renderMiniMetric("Autonomie", agent.autonomie)}
      ${renderMiniMetric("Fiabilite", agent.fiabilite)}
      ${renderMiniMetric("Vitesse", agent.vitesseTraitement)}
      ${renderMiniMetric("Collaboration", agent.collaboration)}
      ${renderMiniMetric("Memoire", agent.memoire)}
      ${renderMiniMetric("Qualite sortie", agent.qualiteSortie)}
      ${renderMiniMetric("Influence", agent.influenceReseau)}
      ${renderMiniMetric("Latence", agent.latenceReponse)}
      ${renderMiniMetric("Apt. deleguer", agent.aptDeleguer)}
      ${renderMiniMetric("Apt. synthetiser", agent.aptSynthetiser)}
    </div>
    <div class="agent-delta">
      <div class="delta-box">
        <span>Etat initial</span>
        <strong>${baseline ? stateMeta[baseline.state].label : "n/a"}</strong>
      </div>
      <div class="delta-box">
        <span>Delta charge</span>
        <strong class="${agent.charge >= (baseline?.charge || 0) ? "delta-negative" : "delta-positive"}">${formatSignedPercent(agent.charge - (baseline?.charge || 0))}</strong>
      </div>
      <div class="delta-box">
        <span>Transitions</span>
        <strong>${agent.changeCount}</strong>
      </div>
    </div>
    ${specialSection}
    <div class="system-box">
      <span class="muted-label">Historique court</span>
      <ul class="history-list">
        ${historyItems.map(h => `<li class="history-item"><strong>I${String(h.iteration).padStart(2,"0")} · ${h.label}</strong><span>${h.detail}</span></li>`).join("")}
      </ul>
    </div>
    <div class="scenario-brief">
      <span class="muted-label">Correspondants principaux</span>
      <ul class="connection-list">
        ${linkedAgents.length ? linkedAgents.map(la => {
          const link = findLink(agent.id, la.id);
          const linkLabel = link ? linkTypeMeta[link.type]?.label || link.type : "";
          return `<li class="connection-item"><div><strong>${la.nom}</strong><div>${la.role} · ${determineRole(la)}</div></div><span>${stateMeta[la.state].label} · ${linkLabel}</span></li>`;
        }).join("") : `<li class="connection-item"><strong>Aucun correspondant actif</strong><span>—</span></li>`}
      </ul>
    </div>
  `;
}

function renderMiniMetric(label, value) {
  return `<div class="mini-metric"><div class="mini-head"><span>${label}</span><strong>${formatPercent(value)}</strong></div><div class="mini-track"><div class="mini-fill" style="width:${Math.round(value * 100)}%"></div></div></div>`;
}

function renderComparison() {
  const m = computeMetrics();
  const activeAgents = app.agents.filter(a => a.active);
  const total = activeAgents.length || 1;
  const baselineCounts = Object.fromEntries(stateOrder.map(s => [s, 0]));
  let baselineChargeTotal = 0;

  for (const [id, snap] of app.baseline) {
    const agent = app.agentMap.get(id);
    if (agent && agent.active) {
      baselineCounts[snap.state] = (baselineCounts[snap.state] || 0) + 1;
      baselineChargeTotal += snap.charge;
    }
  }

  const baselineCharge = baselineChargeTotal / total;
  const baselineFluidite = clamp(1 - baselineCharge * 0.5, 0, 1);

  const biggestMoves = activeAgents
    .map(a => ({ agent: a, deltaCharge: a.charge - (app.baseline.get(a.id)?.charge || 0) }))
    .sort((a, b) => Math.abs(b.deltaCharge) - Math.abs(a.deltaCharge))
    .slice(0, 4);

  const chefBefore = app.baseline.get("CHEF")?.charge || 0;
  const chefAfter = app.agentMap.get("CHEF")?.charge || 0;
  const chiaraBefore = app.baseline.get("CHIARA")?.charge || 0;
  const chiaraAfter = app.agentMap.get("CHIARA")?.charge || 0;

  dom.comparisonSummary.innerHTML = `
    <span class="muted-label">Resume comparatif</span>
    <div class="fact-grid">
      <span class="fact-pill">Charge ${formatPercent(baselineCharge)} → ${formatPercent(m.chargeGlobale)}</span>
      <span class="fact-pill">Fluidite ${formatPercent(baselineFluidite)} → ${formatPercent(m.fluidite)}</span>
      <span class="fact-pill">Chef ${formatPercent(chefBefore)} → ${formatPercent(chefAfter)}</span>
      <span class="fact-pill">Chiara ${formatPercent(chiaraBefore)} → ${formatPercent(chiaraAfter)}</span>
      <span class="fact-pill">${m.goulets.length} goulets actuels</span>
      <span class="fact-pill">${m.escalationCount} escalades</span>
    </div>
  `;

  dom.comparisonHighlights.innerHTML = `
    <div class="comparison-grid">
      <div class="comparison-box">
        <h3>Plus gros changements de charge</h3>
        <p>${biggestMoves.map(e => `${e.agent.id} ${formatSignedPercent(e.deltaCharge)}`).join(" · ")}</p>
      </div>
      <div class="comparison-box">
        <h3>Basculements organisationnels</h3>
        <p>${app.recentTransitions.slice(0, 4).map(t => `${t.id}: ${t.label}`).join(" · ") || "Aucun"}</p>
      </div>
    </div>
  `;

  const displayedStates = ["disponible","en_analyse","en_coordination","en_execution","en_attente","en_validation","surcharge","bloque","en_synthese","sature","critique","offline"];
  dom.distributionComparison.innerHTML = displayedStates.map(key => {
    const meta = stateMeta[key];
    const before = baselineCounts[key] || 0;
    const after = m.stateCounts[key] || 0;
    return `
      <div class="distribution-row">
        <div class="distribution-head">
          <span class="distribution-title"><span class="legend-dot" style="--ring-color:${meta.color};--dot-color:${meta.color};"></span>${meta.label}</span>
          <span class="distribution-pair">${before} → ${after}</span>
        </div>
        <div class="distribution-track">
          <div class="distribution-before" style="width:${(before / total) * 100}%"></div>
          <div class="distribution-after" style="width:${(after / total) * 100}%;--row-color:${meta.color};"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderTimeline() {
  dom.timelineList.innerHTML = app.logs.map(entry => `
    <li class="timeline-item">
      <span class="timeline-index">${entry.index}</span>
      <div><strong>${entry.title}</strong><p>${entry.detail}</p></div>
    </li>
  `).join("");
}

function renderInsights() {
  const m = computeMetrics();
  const systemNarrative = describeSystemState(m);
  const topExperts = m.topSollicites || [];
  const sousUtilises = m.sousUtilises || [];
  const goulets = m.goulets || [];

  dom.insightPanel.innerHTML = `
    <div class="system-box">
      <span class="muted-label">Lecture instantanee</span>
      <h3>${systemNarrative.title}</h3>
      <p>${systemNarrative.body}</p>
    </div>
    <div class="system-box">
      <span class="muted-label">Lecture systeme</span>
      <div class="system-grid">
        <div class="system-cell"><span>Phase</span><strong>${m.phase}</strong></div>
        <div class="system-cell"><span>Charge globale</span><strong>${formatPercent(m.chargeGlobale)}</strong></div>
        <div class="system-cell"><span>Fluidite</span><strong>${formatPercent(m.fluidite)}</strong></div>
        <div class="system-cell"><span>Saturation</span><strong>${formatPercent(m.saturation)}</strong></div>
        <div class="system-cell"><span>Qualite estimee</span><strong>${formatPercent(m.qualiteMoyenne)}</strong></div>
        <div class="system-cell"><span>Echanges</span><strong>${m.exchangeCount}</strong></div>
        <div class="system-cell"><span>Delegations</span><strong>${m.delegationCount}</strong></div>
        <div class="system-cell"><span>Escalades</span><strong>${m.escalationCount}</strong></div>
      </div>
    </div>
    <div class="system-box">
      <span class="muted-label">Experts les plus sollicites</span>
      <ul class="insight-list">
        ${topExperts.map(a => `
          <li class="insight-item">
            <div><strong>${a.nom}</strong><div>${a.role} · ${stateMeta[a.state].label}</div></div>
            <span>${formatPercent(a.charge)}</span>
          </li>
        `).join("") || "<li class='insight-item'><strong>—</strong><span></span></li>"}
      </ul>
    </div>
    ${goulets.length ? `
    <div class="system-box">
      <span class="muted-label">Goulets d'etranglement</span>
      <ul class="insight-list">
        ${goulets.map(a => `
          <li class="insight-item">
            <div><strong>${a.nom}</strong><div>${determineRole(a)} · ${stateMeta[a.state].label}</div></div>
            <span>${formatPercent(a.charge)}</span>
          </li>
        `).join("")}
      </ul>
    </div>` : ""}
    ${sousUtilises.length ? `
    <div class="system-box">
      <span class="muted-label">Experts sous-utilises</span>
      <ul class="insight-list">
        ${sousUtilises.map(a => `
          <li class="insight-item">
            <div><strong>${a.nom}</strong><div>${a.role}</div></div>
            <span>${formatPercent(a.charge)}</span>
          </li>
        `).join("")}
      </ul>
    </div>` : ""}
  `;
}

function describeSystemState(m) {
  if (!app.missionInjected) {
    return { title: "Organisation en veille", body: "Les agents sont disponibles et prets a recevoir une mission. Le systeme fonctionne en mode nominal." };
  }
  if (m.phase === "convergence") {
    return { title: "Convergence finale", body: "La mission arrive a son terme. Les resultats remontent pour validation finale et synthese. Le systeme se stabilise progressivement." };
  }
  if (m.saturation > 0.35) {
    return { title: "Tension organisationnelle", body: `${m.goulets.length} goulets d'etranglement detectes. La charge depasse la capacite d'absorption sur plusieurs experts. Risque de blocage si les escalades ne sont pas traitees.` };
  }
  if (m.phase === "execution distribuee") {
    return { title: "Execution distribuee active", body: "Les experts traitent leurs sous-taches en parallele. Les liens de collaboration sont actifs. Chiara coordonne les echanges transverses." };
  }
  if (m.phase === "coordination active") {
    return { title: "Coordination en cours", body: "Le Chef Agent a distribue la mission. Chiara assure la liaison entre les experts concernes. Les premiers traitements commencent." };
  }
  if (m.phase === "validation") {
    return { title: "Phase de validation", body: "Les resultats remontent vers le Chef Agent pour validation. Les experts en attente se tiennent prets pour des ajustements." };
  }
  if (m.phase === "synthese finale") {
    return { title: "Synthese finale", body: "Les livrables convergent. Chiara assemble les contributions et le Chef Agent valide le resultat global." };
  }
  return { title: "Traitement en cours", body: "La mission circule dans l'organisation. Les agents ajustent leur charge et collaborent pour produire le livrable attendu." };
}

// ── Helpers ─────────────────────────────────────────────────
function pushLog(title, detail) {
  const index = `I${String(app.iteration).padStart(2, "0")}`;
  app.logs.unshift({ index, title, detail });
  app.logs = app.logs.slice(0, 14);
}

function syncButtons() {
  dom.runButton.disabled = app.running || app.paused;
  dom.stepButton.disabled = app.running;
  dom.pauseButton.disabled = app.engineMode !== "live" || (!app.running && !app.paused);
}

function getSpeedLabel() {
  if (app.animationDelay >= 650) return "Lent";
  if (app.animationDelay <= 240) return "Rapide";
  return "Normal";
}

function pseudoRandom(seed) {
  let v = seed >>> 0;
  v += 0x6d2b79f5;
  let t = v;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ── Système de particules ───────────────────────────────────
function spawnParticle(sourceId, targetId, color, count) {
  const s = app.agentMap.get(sourceId);
  const t = app.agentMap.get(targetId);
  if (!s || !t) return;
  for (let i = 0; i < count; i++) {
    app.particles.push({
      sourceId, targetId,
      progress: Math.random() * 0.2,
      speed: 0.006 + Math.random() * 0.010,
      color, size: 1.5 + Math.random() * 1.8,
      alpha: 0.5 + Math.random() * 0.5,
      wobble: (Math.random() - 0.5) * 8
    });
  }
}

function spawnFlowParticles() {
  if (!app.missionInjected) return;
  const phase = app.missionPhase;
  const reversePhases = ["validation", "synthese finale", "convergence"];
  const isReverse = reversePhases.includes(phase);

  for (const link of app.links) {
    if ((link.activity || 0) < 0.10) continue;
    const prob = link.activity * 0.12;
    if (Math.random() > prob) continue;
    const meta = linkTypeMeta[link.type] || linkTypeMeta.collaboration;
    const shouldReverse = isReverse && (link.type === "hierarchique" || link.type === "validation");
    if (shouldReverse) {
      spawnParticle(link.target, link.source, meta.color, 1);
    } else {
      spawnParticle(link.source, link.target, meta.color, 1);
    }
  }
}

function updateParticles() {
  spawnFlowParticles();
  for (let i = app.particles.length - 1; i >= 0; i--) {
    const p = app.particles[i];
    p.progress += p.speed;
    if (p.progress >= 1) { app.particles.splice(i, 1); }
  }
  if (app.particles.length > 350) app.particles.splice(0, app.particles.length - 350);
}

function drawParticles() {
  for (const p of app.particles) {
    const s = app.agentMap.get(p.sourceId);
    const t = app.agentMap.get(p.targetId);
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const ease = p.progress < 0.15 ? p.progress / 0.15 : p.progress > 0.85 ? (1 - p.progress) / 0.15 : 1;
    const x = s.x + dx * p.progress + nx * p.wobble * Math.sin(p.progress * Math.PI);
    const y = s.y + dy * p.progress + ny * p.wobble * Math.sin(p.progress * Math.PI);
    const alpha = p.alpha * ease;
    const sz = p.size / app.view.scale;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, sz * 3);
    glow.addColorStop(0, rgbaFromHex(p.color, alpha * 0.6));
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(x, y, sz * 3, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fillStyle = rgbaFromHex(p.color, alpha);
    ctx.fill();
  }
}

// ── Activité ambiante (cerveau vivant) ──────────────────────
function getAmbientSpeed() {
  if (app.animationDelay >= 650) return 0.5;
  if (app.animationDelay <= 240) return 2.0;
  return 1.0;
}

function updateAmbientActivity() {
  const t = app.time;
  const speed = getAmbientSpeed();
  const isMission = app.missionInjected;

  // Brain pulse : chaque lien pulse à son propre rythme
  for (let i = 0; i < app.links.length; i++) {
    const link = app.links[i];
    const s = app.agentMap.get(link.source);
    const ta = app.agentMap.get(link.target);
    if (!s || !ta || !s.active || !ta.active) continue;

    // Hash unique par lien pour phase différente
    const h = (i * 2654435761) & 0xFFFF;
    const phase = (h / 65536) * Math.PI * 2;
    const wave1 = Math.sin(t * speed * 0.55 + phase);
    const wave2 = Math.sin(t * speed * 0.32 + phase * 1.618);
    const combined = wave1 * 0.6 + wave2 * 0.4;

    // Pulse ambiant (toujours actif)
    if (combined > 0.55) {
      const pulseStrength = (combined - 0.55) / 0.45;
      const ambient = isMission ? pulseStrength * 0.10 : pulseStrength * 0.22;
      if (link.activity < ambient) {
        link.activity = ambient;
        link.activityType = link.type;
      }
    }
  }

  // Particules ambiantes (synapses)
  const spawnRate = speed * (isMission ? 0.025 : 0.055);
  if (Math.random() < spawnRate && app.links.length > 0) {
    const idx = Math.floor(Math.random() * app.links.length);
    const link = app.links[idx];
    const s = app.agentMap.get(link.source);
    const ta = app.agentMap.get(link.target);
    if (s && ta && s.active && ta.active) {
      const meta = linkTypeMeta[link.type] || linkTypeMeta.collaboration;
      if (Math.random() > 0.5) {
        spawnParticle(link.source, link.target, meta.color, 1);
      } else {
        spawnParticle(link.target, link.source, meta.color, 1);
      }
    }
  }

  // Heartbeat global : onde qui traverse le réseau depuis le Chef
  const heartbeat = Math.sin(t * speed * 0.8) * 0.5 + 0.5;
  if (heartbeat > 0.92) {
    const chef = app.agentMap.get("CHEF");
    if (chef) {
      chef.pulse = Math.max(chef.pulse, 0.25);
      // Propager aux voisins directs
      for (const nId of chef.connections.slice(0, 5)) {
        const link = findLink("CHEF", nId);
        if (link) {
          link.activity = Math.max(link.activity, 0.30);
          link.activityType = "hierarchique";
        }
      }
    }
  }
}

// ── Canvas : rendu ──────────────────────────────────────────
function animationLoop() {
  app.time += 0.016;
  app.stepImpulse = Math.max(0, app.stepImpulse * 0.94 - 0.005);
  resizeCanvas();
  updatePhysics();
  updateAmbientActivity();
  decayTransientEffects();
  updateParticles();
  drawNetwork();
  requestAnimationFrame(animationLoop);
}

function decayTransientEffects() {
  for (const agent of app.agents) {
    agent.pulse = Math.max(0, (agent.pulse || 0) * 0.93 - 0.006);
    agent.recentImpact = Math.max(0, (agent.recentImpact || 0) * 0.95 - 0.005);
  }
  for (const link of app.links) {
    // Decay plus lent pour laisser l'activité ambiante vivre
    link.activity = Math.max(0, (link.activity || 0) * 0.96 - 0.003);
    if (link.activity < 0.01) {
      link.activityType = "neutral";
    }
  }
}

function resizeCanvas() {
  const rect = dom.networkCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if (dom.networkCanvas.width !== w || dom.networkCanvas.height !== h) {
    dom.networkCanvas.width = w;
    dom.networkCanvas.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    app.canvasSize = { width: rect.width, height: rect.height };
  }
}

function updatePhysics() {
  if (!app.agents.length) return;
  // Physics become more energetic during simulation
  const energyBoost = app.missionInjected ? 1.15 + app.stepImpulse * 0.4 : 1.0;
  const repulsion = 4800 * energyBoost;
  const spring = 0.0018;
  const homePull = app.missionInjected ? 0.008 : 0.014;

  for (const a of app.agents) { a.ax = 0; a.ay = 0; }

  for (let i = 0; i < app.agents.length; i++) {
    for (let j = i + 1; j < app.agents.length; j++) {
      const a = app.agents[i];
      const b = app.agents[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dSq = dx * dx + dy * dy;
      if (dSq < 1) { dSq = 1; dx = (Math.random() - 0.5) * 0.1; dy = (Math.random() - 0.5) * 0.1; }
      const d = Math.sqrt(dSq);
      const f = repulsion / dSq;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      a.ax -= fx; a.ay -= fy;
      b.ax += fx; b.ay += fy;
    }
  }

  for (const link of app.links) {
    const s = app.agentMap.get(link.source);
    const t = app.agentMap.get(link.target);
    if (!s || !t) continue;
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const desired = 80 + (1 - link.intensite) * 60;
    const disp = d - desired;
    const f = disp * spring;
    const fx = (dx / d) * f;
    const fy = (dy / d) * f;
    s.ax += fx; s.ay += fy;
    t.ax -= fx; t.ay -= fy;
  }

  for (const a of app.agents) {
    a.ax += (a.homeX - a.x) * homePull;
    a.ay += (a.homeY - a.y) * homePull;
    if (a.fixed) { a.vx = 0; a.vy = 0; continue; }
    a.vx = (a.vx + a.ax) * 0.82;
    a.vy = (a.vy + a.ay) * 0.82;
    a.x += a.vx;
    a.y += a.vy;
  }
}

function drawNetwork() {
  const w = app.canvasSize.width;
  const h = app.canvasSize.height;
  if (!w || !h) return;

  ctx.clearRect(0, 0, w, h);
  drawBackdrop(w, h);
  ctx.save();
  ctx.translate(w / 2 + app.view.x, h / 2 + app.view.y);
  ctx.scale(app.view.scale, app.view.scale);

  // Anneaux de référence hiérarchiques
  // Anneau central Chef
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 209, 102, 0.06)";
  ctx.lineWidth = 1 / app.view.scale;
  ctx.stroke();
  // Anneau Chiara
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(167, 139, 250, 0.05)";
  ctx.stroke();
  // Anneau experts inner
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(116, 216, 255, 0.05)";
  ctx.stroke();
  // Anneau experts outer
  ctx.beginPath();
  ctx.arc(0, 0, 260, 0, Math.PI * 2);
  ctx.stroke();

  // Liens — glow pass (large, behind)
  for (const link of app.links) {
    if ((link.activity || 0) < 0.12) continue;
    const s = app.agentMap.get(link.source);
    const t = app.agentMap.get(link.target);
    if (!s || !t || (!s.active && !t.active)) continue;
    const linkMeta = linkTypeMeta[link.type] || linkTypeMeta.collaboration;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = rgbaFromHex(linkMeta.color, link.activity * 0.12);
    ctx.lineWidth = (5 + link.activity * 8) / app.view.scale;
    ctx.stroke();
  }

  // Liens — main pass
  for (const link of app.links) {
    const s = app.agentMap.get(link.source);
    const t = app.agentMap.get(link.target);
    if (!s || !t || (!s.active && !t.active)) continue;

    const linkMeta = linkTypeMeta[link.type] || linkTypeMeta.collaboration;
    let alpha = 0.10 + link.intensite * 0.08;
    let lineWidth = (0.6 + link.intensite * 0.8) / app.view.scale;

    if ((link.activity || 0) > 0.05) {
      alpha = 0.18 + link.activity * 0.55;
      lineWidth = (0.8 + link.intensite * 1.0 + link.activity * 2.8) / app.view.scale;
      ctx.strokeStyle = rgbaFromHex(linkMeta.color, alpha);
    } else {
      ctx.strokeStyle = `rgba(160, 180, 200, ${alpha})`;
    }

    ctx.beginPath();
    if (linkMeta.dash) {
      ctx.setLineDash(linkMeta.dash.map(v => v / app.view.scale));
    } else {
      ctx.setLineDash([]);
    }
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.setLineDash([]);

    // Flèches pour liens actifs directionnels
    if ((link.activity || 0) > 0.1) {
      const reversePhases = ["validation", "synthese finale", "convergence"];
      const isReverse = reversePhases.includes(app.missionPhase) && (link.type === "hierarchique" || link.type === "validation");
      const ax = isReverse ? t.x : s.x, ay = isReverse ? t.y : s.y;
      const bx = isReverse ? s.x : t.x, by = isReverse ? s.y : t.y;
      const targetAgent = app.agentMap.get(isReverse ? link.source : link.target);
      drawArrow(ax, ay, bx, by, (targetAgent?.radius || 10) + 5, rgbaFromHex(linkMeta.color, alpha * 0.75));
    }
  }

  // Particules
  drawParticles();

  // Agents (dessiner dans l'ordre : experts d'abord, puis Chiara, puis Chef)
  const sortedAgents = [...app.agents].sort((a, b) => b.ring - a.ring);
  for (const agent of sortedAgents) {
    if (!agent.active && agent.state === "offline") {
      drawAgentOffline(agent);
    } else {
      drawAgent(agent);
    }
  }

  ctx.restore();
}

function drawArrow(x1, y1, x2, y2, offset, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tipX = x2 - Math.cos(angle) * offset;
  const tipY = y2 - Math.sin(angle) * offset;
  const size = 6 / app.view.scale;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - Math.cos(angle - 0.4) * size, tipY - Math.sin(angle - 0.4) * size);
  ctx.lineTo(tipX - Math.cos(angle + 0.4) * size, tipY - Math.sin(angle + 0.4) * size);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBackdrop(w, h) {
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.45, 40, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
  vignette.addColorStop(0, "rgba(18, 28, 40, 0.20)");
  vignette.addColorStop(1, "rgba(4, 7, 11, 0.92)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y <= h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();
}

function drawAgent(agent) {
  const meta = stateMeta[agent.state];
  const isChef = agent.id === "CHEF";
  const isChiara = agent.id === "CHIARA";
  const hovered = agent.id === app.hoveredAgentId;
  const selected = agent.id === app.selectedAgentId;
  const pulse = agent.pulse || 0;
  const isWorking = agent.active && agent.state !== "disponible" && agent.state !== "offline";

  // Respiration : tous les agents actifs respirent, plus fort quand en travail
  const breathPhase = Math.sin(app.time * 2.2 + agent.id.charCodeAt(agent.id.length - 1) * 0.7);
  const breathAmount = isWorking ? breathPhase * 2.0 : (agent.active ? breathPhase * 0.6 : 0);
  const radius = agent.radius + agent.charge * 3.5 + breathAmount;

  // ── Halo ambiant ──
  if (pulse > 0.02 || isChef || isChiara || isWorking) {
    const haloR = radius + 12 + pulse * 16 + (isChef ? 14 : isChiara ? 10 : isWorking ? 4 : 0);
    const haloAlpha = Math.min(0.40, 0.08 + pulse * 0.22 + (isChef ? 0.10 : isChiara ? 0.07 : isWorking ? 0.04 : 0));
    const halo = ctx.createRadialGradient(agent.x, agent.y, radius * 0.3, agent.x, agent.y, haloR);
    halo.addColorStop(0, rgbaFromHex(meta.color, haloAlpha));
    halo.addColorStop(0.6, rgbaFromHex(meta.color, haloAlpha * 0.3));
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, haloR, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();
  }

  // ── Chef Agent : double anneau or + arcs rotatifs ──
  if (isChef) {
    // Anneau externe or
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, radius + 7, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,209,102,0.45)";
    ctx.lineWidth = 1.5 / app.view.scale;
    ctx.stroke();
    // Anneau interne or
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, radius + 4.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,209,102,0.65)";
    ctx.lineWidth = 2.5 / app.view.scale;
    ctx.stroke();
    // Arcs rotatifs quand actif
    if (isWorking) {
      const a1 = app.time * 1.3;
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius + 10, a1, a1 + Math.PI * 0.55);
      ctx.strokeStyle = "rgba(255,209,102,0.50)";
      ctx.lineWidth = 2.5 / app.view.scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius + 10, a1 + Math.PI, a1 + Math.PI + Math.PI * 0.55);
      ctx.stroke();
    }
  }

  // ── Chiara : anneau violet + arcs rotatifs inversés ──
  if (isChiara) {
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(167,139,250,0.55)";
    ctx.lineWidth = 2.2 / app.view.scale;
    ctx.stroke();
    if (isWorking) {
      const a2 = -app.time * 1.6;
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius + 8, a2, a2 + Math.PI * 0.45);
      ctx.strokeStyle = "rgba(167,139,250,0.45)";
      ctx.lineWidth = 2 / app.view.scale;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius + 8, a2 + Math.PI * 0.65, a2 + Math.PI * 1.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius + 8, a2 + Math.PI * 1.35, a2 + Math.PI * 1.8);
      ctx.stroke();
    }
  }

  // ── Indicateur de charge circulaire (tous les agents) ──
  if (agent.charge > 0.05 && agent.active) {
    const chargeAngle = agent.charge * Math.PI * 2;
    const chargeColor = agent.charge > 0.80 ? "#ff4747" : agent.charge > 0.60 ? "#ff9966" : meta.color;
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, radius + (isChef ? 12 : isChiara ? 9 : 3), -Math.PI / 2, -Math.PI / 2 + chargeAngle);
    ctx.strokeStyle = rgbaFromHex(chargeColor, 0.55);
    ctx.lineWidth = 2 / app.view.scale;
    ctx.stroke();
  }

  // ── Fond sombre ──
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, radius + 1, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(9, 14, 20, 0.92)";
  ctx.fill();

  // ── Corps du noeud ──
  const gradient = ctx.createRadialGradient(
    agent.x - radius * 0.35, agent.y - radius * 0.35, Math.max(1, radius * 0.15),
    agent.x, agent.y, radius + 1
  );
  gradient.addColorStop(0, blendColor(meta.color, "#ffffff", 0.32));
  gradient.addColorStop(0.7, meta.color);
  gradient.addColorStop(1, blendColor(meta.color, "#000000", 0.42));
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // ── Icône centrale Chef/Chiara ──
  if (isChef) {
    const sz = radius * 0.45;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.moveTo(agent.x, agent.y - sz);
    ctx.lineTo(agent.x + sz * 0.7, agent.y + sz * 0.5);
    ctx.lineTo(agent.x - sz * 0.7, agent.y + sz * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  if (isChiara) {
    const sz = radius * 0.35;
    ctx.fillStyle = "rgba(255,255,255,0.80)";
    ctx.beginPath();
    ctx.moveTo(agent.x - sz, agent.y); ctx.lineTo(agent.x, agent.y - sz);
    ctx.lineTo(agent.x + sz, agent.y); ctx.lineTo(agent.x, agent.y + sz);
    ctx.closePath();
    ctx.fill();
  }

  // ── Impact récent ──
  if ((agent.recentImpact || 0) > 0.08) {
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, radius + 6 + agent.recentImpact * 8, 0, Math.PI * 2);
    ctx.setLineDash([6 / app.view.scale, 5 / app.view.scale]);
    ctx.strokeStyle = `rgba(255,255,255,${0.15 + agent.recentImpact * 0.30})`;
    ctx.lineWidth = 1.2 / app.view.scale;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Sélection/survol ──
  if (hovered || selected) {
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = selected ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2.2 / app.view.scale;
    ctx.stroke();
  }

  // ── Label ──
  if (hovered || selected || isChef || isChiara || agent.charge > 0.72) {
    const label = isChef ? "CHEF AGENT" : isChiara ? "CHIARA" : `${agent.id} · ${agent.nom}`;
    const fontSize = (isChef ? 14 : isChiara ? 13 : 11) / app.view.scale;
    ctx.font = `bold ${fontSize}px "Cascadia Code", monospace`;
    const tw = ctx.measureText(label).width;
    const px = 8 / app.view.scale;
    const py = 6 / app.view.scale;
    const lw = tw + px * 2;
    const lh = fontSize + py * 2;
    const lx = agent.x + radius + (isChef ? 14 : 8);
    const ly = agent.y - radius - 12;
    const bgColor = isChef ? "rgba(40, 30, 10, 0.90)" : isChiara ? "rgba(25, 18, 40, 0.90)" : "rgba(7, 11, 16, 0.88)";
    const borderColor = isChef ? "rgba(255,209,102,0.25)" : isChiara ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.10)";

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1 / app.view.scale;
    roundRect(lx, ly, lw, lh, 8 / app.view.scale);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = isChef ? "#ffd166" : isChiara ? "#c5a6ff" : "#edf4fb";
    ctx.fillText(label, lx + px, ly + fontSize + py * 0.3);
  }
}

function drawAgentOffline(agent) {
  const radius = agent.radius * 0.7;
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(90, 100, 120, 0.25)";
  ctx.fill();
  ctx.strokeStyle = "rgba(90, 100, 120, 0.35)";
  ctx.lineWidth = 1 / app.view.scale;
  ctx.stroke();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Interactions canvas ─────────────────────────────────────
function onPointerDown(event) {
  const pt = getCanvasPoint(event);
  const hit = findAgentAtPoint(pt.x, pt.y);
  dom.networkCanvas.setPointerCapture(event.pointerId);
  app.drag.pointerId = event.pointerId;
  app.drag.moved = false;

  if (hit) {
    app.drag.mode = "node";
    app.drag.nodeId = hit.id;
    hit.fixed = true;
    app.selectedAgentId = hit.id;
    renderAgentDetails();
  } else {
    app.drag.mode = "pan";
    app.drag.startX = pt.x;
    app.drag.startY = pt.y;
    app.drag.viewX = app.view.x;
    app.drag.viewY = app.view.y;
  }
}

function onPointerMove(event) {
  const pt = getCanvasPoint(event);
  if (app.drag.mode === "node" && app.drag.nodeId) {
    app.drag.moved = true;
    const world = screenToWorld(pt.x, pt.y);
    const agent = app.agentMap.get(app.drag.nodeId);
    if (agent) { agent.x = world.x; agent.y = world.y; agent.homeX = world.x; agent.homeY = world.y; }
    return;
  }
  if (app.drag.mode === "pan") {
    const dx = pt.x - app.drag.startX;
    const dy = pt.y - app.drag.startY;
    app.drag.moved = Math.abs(dx) > 2 || Math.abs(dy) > 2;
    app.view.x = app.drag.viewX + dx;
    app.view.y = app.drag.viewY + dy;
    return;
  }
  const hit = findAgentAtPoint(pt.x, pt.y);
  app.hoveredAgentId = hit ? hit.id : null;
}

function onPointerUp() {
  if (app.drag.nodeId) {
    const agent = app.agentMap.get(app.drag.nodeId);
    if (agent && agent.ring > 1) agent.fixed = false;
  }
  app.drag.mode = null;
  app.drag.pointerId = null;
  app.drag.nodeId = null;
}

function onPointerLeave() {
  if (!app.drag.mode) app.hoveredAgentId = null;
}

function onWheel(event) {
  event.preventDefault();
  const pt = getCanvasPoint(event);
  const before = screenToWorld(pt.x, pt.y);
  const factor = event.deltaY > 0 ? 0.92 : 1.08;
  app.view.scale = clamp(app.view.scale * factor, 0.45, 2.8);
  const after = worldToScreen(before.x, before.y);
  app.view.x += pt.x - after.x;
  app.view.y += pt.y - after.y;
}

function resetView() {
  app.view.scale = 1; app.view.x = 0; app.view.y = 0;
}

function findAgentAtPoint(sx, sy) {
  const world = screenToWorld(sx, sy);
  let hit = null, best = Infinity;
  for (const a of app.agents) {
    const r = a.radius + a.charge * 3 + 6 / app.view.scale;
    const d = Math.hypot(world.x - a.x, world.y - a.y);
    if (d <= r && d < best) { hit = a; best = d; }
  }
  return hit;
}

function screenToWorld(sx, sy) {
  const { width, height } = app.canvasSize;
  return { x: (sx - width / 2 - app.view.x) / app.view.scale, y: (sy - height / 2 - app.view.y) / app.view.scale };
}

function worldToScreen(wx, wy) {
  const { width, height } = app.canvasSize;
  return { x: width / 2 + app.view.x + wx * app.view.scale, y: height / 2 + app.view.y + wy * app.view.scale };
}

function getCanvasPoint(event) {
  const rect = dom.networkCanvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

// ── Utilitaires ─────────────────────────────────────────────
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function formatPercent(v) { return `${Math.round(v * 100)}%`; }
function formatSignedPercent(v) { return `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`; }

function blendColor(a, b, ratio) {
  const ha = normalizeHex(a), hb = normalizeHex(b);
  return `rgb(${Math.round(ha.r + (hb.r - ha.r) * ratio)},${Math.round(ha.g + (hb.g - ha.g) * ratio)},${Math.round(ha.b + (hb.b - ha.b) * ratio)})`;
}

function rgbaFromHex(color, alpha) {
  const c = normalizeHex(color);
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

function normalizeHex(color) {
  const hex = color.replace("#", "");
  const n = hex.length === 3 ? hex.split("").map(c => c + c).join("") : hex;
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) };
}
