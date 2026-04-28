// src/data/decisionTreesDefault.ts
// Arbres de décision livrés par défaut avec le kit.
// Chargés au premier démarrage par editorStore (fusion sans écrasement comme les autres briques).

import type { DecisionTree } from '../types'

// Arbre 1 : « Quelle appli ouvrir pour résoudre mon anomalie ? »
// L'agent indique le type d'anomalie (catégorie du catalogue), le kit propose
// l'appli métier appropriée + un lien vers le guide associé.
const TREE_QUELLE_APPLI: DecisionTree = {
  id: 'tree-quelle-appli',
  title: 'Quelle appli ouvrir ?',
  description: "Selon le type d'anomalie, le kit te dirige vers la bonne appli métier et le guide associé.",
  rootNodeId: 'q-type-anomalie',
  nodes: {
    'q-type-anomalie': {
      id: 'q-type-anomalie',
      type: 'question',
      title: "Quel type d'anomalie veux-tu déclarer ?",
      help: 'Choisis la catégorie qui correspond à ce que tu observes sur le terrain.',
      answers: [
        { label: 'Voie courante', nextId: 'leaf-voie-courante' },
        { label: 'Appareils de voie', nextId: 'leaf-appareils-de-voie' },
        { label: 'Ouvrages & Gabarit', nextId: 'leaf-ouvrages' },
        { label: 'Abords', nextId: 'leaf-abords' },
        { label: 'Installations signalisation', nextId: 'leaf-signalisation' },
        { label: 'Platelage', nextId: 'leaf-platelage' },
      ],
    },
    'leaf-voie-courante': {
      id: 'leaf-voie-courante',
      type: 'leaf',
      title: 'EF3C0',
      result: {
        description: "Ouvre EF3C0 pour saisir ton anomalie de voie courante.",
        link: {
          kind: 'guide',
          id: 'guide-creer-anomalie-ef3c0',
          label: 'Voir le guide « Créer une anomalie dans EF3C0 »',
        },
      },
    },
    'leaf-appareils-de-voie': {
      id: 'leaf-appareils-de-voie',
      type: 'leaf',
      title: 'ADV Mobile',
      result: {
        description: "Ouvre ADV Mobile pour les appareils de voie (aiguillages, traversées).",
      },
    },
    'leaf-ouvrages': {
      id: 'leaf-ouvrages',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Pour les ouvrages d'art et le gabarit, utilise SPOT Mobile.",
      },
    },
    'leaf-abords': {
      id: 'leaf-abords',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Les abords (végétation, propreté, accès) se déclarent dans SPOT Mobile.",
      },
    },
    'leaf-signalisation': {
      id: 'leaf-signalisation',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Pour les installations de signalisation, utilise SPOT Mobile.",
      },
    },
    'leaf-platelage': {
      id: 'leaf-platelage',
      type: 'leaf',
      title: 'SPOT Mobile',
      result: {
        description: "Le platelage (passages à niveau, planches) se déclare dans SPOT Mobile.",
      },
    },
  },
  specialitesCibles: ['voie'],
}

// Arbre 2 : « Comment décrire mon anomalie ? »
const TREE_COMMENT_DECRIRE: DecisionTree = {
  id: 'tree-comment-decrire',
  title: 'Comment décrire mon anomalie ?',
  description: "Un template de description prêt à recopier, adapté au type d'anomalie.",
  rootNodeId: 'q-type-decrire',
  nodes: {
    'q-type-decrire': {
      id: 'q-type-decrire',
      type: 'question',
      title: "Quel type d'anomalie ?",
      answers: [
        { label: 'Voie courante', nextId: 'leaf-decrire-voie' },
        { label: 'Appareils de voie', nextId: 'leaf-decrire-adv' },
        { label: 'Ouvrages & Gabarit', nextId: 'leaf-decrire-ouvrages' },
        { label: 'Abords', nextId: 'leaf-decrire-abords' },
        { label: 'Installations signalisation', nextId: 'leaf-decrire-signalisation' },
        { label: 'Platelage', nextId: 'leaf-decrire-platelage' },
      ],
    },
    'leaf-decrire-voie': {
      id: 'leaf-decrire-voie',
      type: 'leaf',
      title: 'Template — Voie courante',
      result: {
        description:
          "Localisation : PK [xxx+yyy] — Voie [n°]\n" +
          "Type de défaut : [NL / dévers / écartement / autre]\n" +
          "Mesure relevée : [valeur + unité]\n" +
          "Conditions : [météo, température si pertinent]\n" +
          "Photo jointe : [oui/non]",
        checklist: [
          "Localisation précise (PK + voie)",
          "Type de défaut clair",
          "Mesure ou observation chiffrée",
          "Photo si possible",
        ],
      },
    },
    'leaf-decrire-adv': {
      id: 'leaf-decrire-adv',
      type: 'leaf',
      title: 'Template — Appareils de voie',
      result: {
        description:
          "Localisation : PK [xxx+yyy] — Appareil [n°]\n" +
          "Élément concerné : [aiguille / cœur / contre-rail / coussinet / autre]\n" +
          "Nature du défaut : [usure / jeu / déformation / casse / autre]\n" +
          "Mesure : [valeur + unité]\n" +
          "Photo jointe : [oui/non]",
        checklist: [
          "Numéro de l'appareil",
          "Élément précis",
          "Nature du défaut",
          "Mesure si applicable",
          "Photo",
        ],
      },
    },
    'leaf-decrire-ouvrages': {
      id: 'leaf-decrire-ouvrages',
      type: 'leaf',
      title: 'Template — Ouvrages & Gabarit',
      result: {
        description:
          "Ouvrage : [identifiant + type]\n" +
          "Localisation : [PK ou repère]\n" +
          "Défaut observé : [fissure / déformation / corrosion / végétation / autre]\n" +
          "Étendue : [longueur ou surface si mesurable]\n" +
          "Photo jointe : [oui/non]",
      },
    },
    'leaf-decrire-abords': {
      id: 'leaf-decrire-abords',
      type: 'leaf',
      title: 'Template — Abords',
      result: {
        description:
          "Localisation : PK [xxx+yyy]\n" +
          "Type d'abord : [végétation / accès / propreté / clôture / autre]\n" +
          "Description : [ce qui ne va pas en 1 phrase]\n" +
          "Risque associé : [oui/non + lequel]\n" +
          "Photo jointe : [oui/non]",
      },
    },
    'leaf-decrire-signalisation': {
      id: 'leaf-decrire-signalisation',
      type: 'leaf',
      title: 'Template — Signalisation',
      result: {
        description:
          "Localisation : PK [xxx+yyy]\n" +
          "Type d'installation : [feu / panneau / balise / autre]\n" +
          "Identifiant : [n° si visible]\n" +
          "Défaut : [fonctionnel / visuel / mécanique]\n" +
          "Photo jointe : [oui/non]",
      },
    },
    'leaf-decrire-platelage': {
      id: 'leaf-decrire-platelage',
      type: 'leaf',
      title: 'Template — Platelage',
      result: {
        description:
          "Localisation : PN ou repère [xxx]\n" +
          "Type de défaut : [planche cassée / écart / fixation / usure]\n" +
          "Étendue : [combien de planches concernées]\n" +
          "Risque pour la circulation routière : [oui/non]\n" +
          "Photo jointe : [oui/non]",
      },
    },
  },
}

export const DEFAULT_DECISION_TREES: DecisionTree[] = [
  TREE_QUELLE_APPLI,
  TREE_COMMENT_DECRIRE,
]
