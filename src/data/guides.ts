import type { Guide } from '../types'

export const GUIDES: Guide[] = [
  {
    id: 'guide-creer-anomalie-ef3c0',
    titre: 'Créer une anomalie dans EF3C0',
    appliMetier: 'ef3c0',
    roles: ['agent_req'],
    specialites: ['voie'],
    gesteMetier: 'Créer une anomalie',
    referentiel: 'MT00342',
    etapes: [
      {
        numero: 1,
        titre: 'Ouvrir la tournée en cours',
        action: 'Depuis l\'écran d\'accueil EF3C0, sélectionnez votre tournée du jour dans la liste des tournées assignées.',
        erreursFrequentes: [
          'Vérifiez que la tournée est bien synchronisée (icône verte)',
          'Si la tournée n\'apparaît pas, faites un "pull to refresh"',
        ],
      },
      {
        numero: 2,
        titre: 'Sélectionner l\'actif concerné',
        action: 'Dans la liste des actifs de la tournée, appuyez sur l\'actif où vous avez constaté le défaut. Vous pouvez aussi rechercher par PK ou numéro d\'actif.',
        champsARemplir: ['Actif (obligatoire)', 'PK ou localisation'],
        erreursFrequentes: [
          'Ne pas confondre l\'actif linéaire (voie) et ponctuel (appareil de voie)',
          'Vérifier que le PK correspond bien à l\'actif sélectionné',
        ],
      },
      {
        numero: 3,
        titre: 'Créer l\'anomalie',
        action: 'Appuyez sur le bouton "+" ou "Nouvelle anomalie" sur la fiche actif.',
        erreursFrequentes: [
          'Vérifiez d\'abord les anomalies existantes sur cet actif pour éviter les doublons',
        ],
      },
      {
        numero: 4,
        titre: 'Renseigner la description',
        action: 'Remplissez le libellé court (obligatoire) et la description détaillée. Décrivez : quoi (type de défaut), où (composant précis), depuis quand (ancienneté estimée).',
        champsARemplir: ['Libellé court (obligatoire)', 'Description détaillée', 'Photo (recommandé)'],
        erreursFrequentes: [
          '"Anomalie constatée" n\'est pas une description exploitable',
          'Sans photo, un retour terrain sera probablement nécessaire',
        ],
      },
      {
        numero: 5,
        titre: 'Choisir le classement',
        action: 'Sélectionnez le classement réglementaire dans la liste déroulante. En cas de doute entre deux classements, privilégiez le plus contraignant et ajoutez une note.',
        champsARemplir: ['Classement (obligatoire)'],
        erreursFrequentes: [
          'Ne pas laisser en NC (Non Classé) — l\'anomalie devient invisible pour la planification',
          'S/I = intervention sous 24h, à réserver aux cas réels d\'urgence',
        ],
        referentiel: 'MT00342',
      },
      {
        numero: 6,
        titre: 'Valider et synchroniser',
        action: 'Vérifiez le récapitulatif, puis appuyez sur "Enregistrer". L\'anomalie sera synchronisée au retour de connexion réseau.',
        erreursFrequentes: [
          'Ne pas oublier de synchroniser en fin de tournée',
          'En mode hors ligne, l\'anomalie est sauvegardée localement',
        ],
      },
    ],
  },
]
