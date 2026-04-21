import type { CatalogueCategorie } from '../types'

/**
 * Données de démonstration pour la brique Catalogue.
 * Vocabulaire SNCF illustratif, non contractuel.
 * Remplacer par les vraies données avant mise en prod.
 * Éditable via Admin → Catalogue.
 */

export const CATALOGUE_SEED: CatalogueCategorie[] = [
  // ─────────────────────────────────────────────────────────────
  {
    id: 'voie-courante',
    nom: 'Voie courante',
    description: 'Rail, joint, traverse, ballast, attaches, soudure, géométrie',
    couleur: '#00A3E0', // sncf-blue
    couleurFg: '#FFFFFF',
    icon: '🛤️',
    types: [
      {
        id: 'rail',
        nom: 'Rail',
        anomalies: [
          {
            id: 'vc-rail-01',
            code: 'VC-RAIL-01',
            name: 'Usure ondulatoire',
            description: "Corrugation du champignon du rail formant des ondulations régulières.",
            defaut: "Ondulations courtes sur la surface de roulement.",
            ecart: "Amplitude mesurée au gabarit d'usure ou Mauzin.",
            classements: [
              { condition: 'amplitude ≤ 0,3 mm', classement: 'A/DET', action: 'Surveillance en tournée, pas d\'action immédiate.' },
              { condition: '0,3 mm < amplitude ≤ 0,5 mm', classement: 'A/SURV', action: 'Surveillance renforcée, reprofilage à programmer.' },
              { condition: 'amplitude > 0,5 mm', classement: 'A/P', action: 'Reprogrammer un meulage préventif sous 6 mois.' },
            ],
            reference: null,
            illus: { caption: 'Usure ondulatoire — vue en coupe' },
          },
          {
            id: 'vc-rail-02',
            code: 'VC-RAIL-02',
            name: 'Fissure transversale de rail',
            description: "Fissure perpendiculaire à l'axe du rail, potentiellement évolutive.",
            defaut: "Amorce visible ou détectée aux ultrasons.",
            ecart: "Contrôle aux ultrasons, profondeur en mm.",
            classements: [
              { condition: 'fissure superficielle non évolutive', classement: 'A/SURV', action: 'Suivi sous 3 mois.' },
              { condition: 'fissure évolutive ou profondeur > 3 mm', classement: 'S/I', action: 'Pose immédiate de clips + remplacement sous 48 h.' },
            ],
            reference: null,
            illus: { caption: 'Fissure transversale — schéma de principe' },
          },
        ],
      },
      {
        id: 'joint',
        nom: 'Joint',
        anomalies: [
          {
            id: 'vc-joint-01',
            code: 'VC-JOINT-01',
            name: 'Décalage au joint',
            description: "Dénivelé entre les deux abouts de rail au droit d'un joint.",
            defaut: "Ripage vertical ou horizontal.",
            ecart: "Règle + pige au joint.",
            classements: [
              { condition: 'dénivelé ≤ 1 mm', classement: 'A/DET', action: 'Aucune action, surveillance.' },
              { condition: 'dénivelé > 1 mm', classement: 'A/M', action: 'Calage ou reprise de joint en maintenance planifiée.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'traverse',
        nom: 'Traverse',
        anomalies: [
          {
            id: 'vc-trav-01',
            code: 'VC-TRAV-01',
            name: 'Traverse dégradée',
            description: "Traverse bois pourrie ou béton fissurée ne tenant plus les attaches.",
            defaut: "Perte de tenue des attaches, éclats de béton.",
            ecart: "Inspection visuelle + essai à la clef dynamométrique.",
            classements: [
              { classement: 'A/P', action: 'Remplacement programmé sous 1 mois.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'ballast',
        nom: 'Ballast',
        anomalies: [
          {
            id: 'vc-ball-01',
            code: 'VC-BALL-01',
            name: 'Pompage',
            description: "Mouvement vertical de la voie sous charge avec remontée de fines.",
            defaut: "Traces boueuses, affaissement du ballast en pied de traverse.",
            ecart: "Observation au passage de train + nivellement Mauzin.",
            classements: [
              { condition: 'pompage localisé < 5 m', classement: 'A/SURV', action: 'Surveillance et bourrage ciblé.' },
              { condition: 'pompage étendu ou évolutif', classement: 'A/P', action: 'Reprise ballast + bourrage sous 2 mois.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'attaches',
        nom: 'Attaches & fixations',
        anomalies: [
          {
            id: 'vc-att-01',
            code: 'VC-ATT-01',
            name: 'Attache manquante ou desserrée',
            description: "Défaut de fixation du rail sur la traverse.",
            defaut: "Clip, tire-fond ou boulon absent / desserré.",
            ecart: "Inspection visuelle + contrôle au maillet.",
            classements: [
              { condition: '1 attache isolée', classement: 'A/M', action: 'Remise en place sous 15 jours.' },
              { condition: '2 attaches consécutives ou plus', classement: 'S/DP', action: 'Intervention sous 24 h.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'soudure',
        nom: 'Soudure',
        anomalies: [
          {
            id: 'vc-soud-01',
            code: 'VC-SOUD-01',
            name: 'Affaissement de soudure',
            description: "Déformation verticale au droit d'une soudure aluminothermique.",
            defaut: "Cuvette ou bosse au niveau de la soudure.",
            ecart: "Règle de 1 m + cale d'épaisseur.",
            classements: [
              { condition: 'affaissement ≤ 0,5 mm', classement: 'A/DET', action: 'Aucune action.' },
              { condition: '0,5 < affaissement ≤ 1 mm', classement: 'A/SURV', action: 'Surveillance, meulage à planifier.' },
              { condition: 'affaissement > 1 mm', classement: 'A/P', action: 'Meulage correctif sous 1 mois.' },
            ],
            reference: null,
            illus: { caption: 'Affaissement de soudure — règle 1 m' },
          },
        ],
      },
      {
        id: 'geometrie',
        nom: 'Géométrie de voie',
        anomalies: [
          {
            id: 'vc-geo-01',
            code: 'VC-GEO-01',
            name: 'Écart de dressage',
            description: "Déviation latérale de la voie par rapport à son tracé théorique.",
            defaut: "Dressage hors tolérance sur base de 10 m.",
            ecart: "Enregistrement Mauzin, seuils AL / AR / ALT.",
            classements: [
              { condition: 'écart ≤ seuil AL', classement: 'A/DET', action: 'Aucune action.' },
              { condition: 'AL < écart ≤ AR', classement: 'A/SURV', action: 'Surveillance renforcée.' },
              { condition: 'AR < écart ≤ ALT', classement: 'A/P', action: 'Bourrage / dressage sous 1 mois.' },
              { condition: 'écart > ALT', classement: 'S/I', action: 'Limitation de vitesse immédiate + intervention sous 48 h.' },
            ],
            reference: null,
            illus: { caption: 'Écart de dressage — seuils AL / AR / ALT' },
          },
          {
            id: 'vc-geo-02',
            code: 'VC-GEO-02',
            name: 'Gauche',
            description: "Différence de nivellement entre files de rail sur base courte.",
            defaut: "Défaut de nivellement relatif.",
            ecart: "Mesure à la règle gauche 3 m.",
            classements: [
              { condition: 'gauche ≤ seuil AL', classement: 'A/DET', action: 'Aucune action.' },
              { condition: 'gauche > seuil ALT', classement: 'S/DP', action: 'Bourrage sous 72 h.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'appareils-voie',
    nom: 'Appareils de voie',
    description: 'Aiguille, cœur de croisement, contre-rail, timonerie',
    couleur: '#0C1E5B', // sncf-dark
    couleurFg: '#FFFFFF',
    icon: '🔀',
    types: [
      {
        id: 'aiguille',
        nom: 'Aiguille',
        anomalies: [
          {
            id: 'adv-aig-01',
            code: 'ADV-AIG-01',
            name: "Usure à la pointe d'aiguille",
            description: "Usure excessive du fil de la pointe d'aiguille au contact du contre-aiguille.",
            defaut: "Affûtage ou éclat à la pointe.",
            ecart: "Gabarit d'usure pointe d'aiguille.",
            classements: [
              { condition: 'usure ≤ seuil surveillance', classement: 'A/SURV', action: 'Suivi mensuel.' },
              { condition: 'usure > seuil limite', classement: 'S/DP', action: 'Remplacement sous 7 jours.' },
            ],
            reference: null,
            illus: { caption: "Pointe d'aiguille — gabarit d'usure" },
          },
          {
            id: 'adv-aig-02',
            code: 'ADV-AIG-02',
            name: "Non-plaquage de l'aiguille",
            description: "L'aiguille ne vient pas au contact complet du contre-aiguille.",
            defaut: "Jour visible entre aiguille et contre-aiguille.",
            ecart: "Cale d'épaisseur + essai de manœuvre.",
            classements: [
              { classement: 'S/I', action: 'Condamnation immédiate de l\'appareil + dépannage.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'coeur-croisement',
        nom: 'Cœur de croisement',
        anomalies: [
          {
            id: 'adv-cross-01',
            code: 'ADV-CROS-01',
            name: 'Épaufrure au cœur',
            description: "Éclat de métal au cœur de croisement sous l'effet des charges.",
            defaut: "Cratère au cœur, fragments de métal.",
            ecart: "Inspection visuelle + profondeur à la pige.",
            classements: [
              { condition: 'profondeur ≤ 3 mm', classement: 'A/SURV', action: 'Rechargement à programmer.' },
              { condition: 'profondeur > 3 mm', classement: 'S/DP', action: 'Rechargement ou remplacement sous 72 h.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'contre-rail',
        nom: 'Contre-rail',
        anomalies: [
          {
            id: 'adv-cr-01',
            code: 'ADV-CR-01',
            name: 'Écartement contre-rail hors tolérance',
            description: "Écartement entre contre-rail et rail de roulement non conforme.",
            defaut: "Boulons desserrés, contre-rail déplacé.",
            ecart: "Pige d'écartement.",
            classements: [
              { classement: 'A/P', action: 'Resserrage et réglage sous 15 jours.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'timonerie',
        nom: 'Timonerie & commande',
        anomalies: [
          {
            id: 'adv-tim-01',
            code: 'ADV-TIM-01',
            name: "Jeu anormal dans la timonerie",
            description: "Jeu mécanique dans la transmission de la commande de l'aiguille.",
            defaut: "Mouvement parasite, claquements en manœuvre.",
            ecart: "Contrôle manuel + essai de manœuvre.",
            classements: [
              { classement: 'A/M', action: 'Réglage et graissage en maintenance.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'ouvrages',
    nom: 'Ouvrages & Gabarit',
    description: 'Pont-rail, pont-route, tunnel, mur de soutènement, gabarit',
    couleur: '#3AAA35', // sncf-green
    couleurFg: '#FFFFFF',
    icon: '🌉',
    types: [
      {
        id: 'pont',
        nom: 'Pont-rail / Pont-route',
        anomalies: [
          {
            id: 'oa-pont-01',
            code: 'OA-PONT-01',
            name: 'Fissure béton sur ouvrage',
            description: "Fissure sur tablier ou piédroit d'ouvrage en béton armé.",
            defaut: "Fissure visible, possible évolution.",
            ecart: "Mesure ouverture au fissuromètre + suivi photo.",
            classements: [
              { condition: 'fissure fine < 0,3 mm non évolutive', classement: 'A/SURV', action: 'Suivi annuel.' },
              { condition: 'fissure évolutive', classement: 'S/DP', action: 'Expertise structure sous 15 jours.' },
            ],
            reference: null,
            illus: { caption: 'Fissure béton — ouverture au fissuromètre' },
          },
        ],
      },
      {
        id: 'tunnel',
        nom: 'Tunnel',
        anomalies: [
          {
            id: 'oa-tun-01',
            code: 'OA-TUN-01',
            name: 'Infiltration en voûte',
            description: "Suintement ou ruissellement en voûte de tunnel.",
            defaut: "Traces d'humidité, concrétions.",
            ecart: "Inspection visuelle, estimation débit.",
            classements: [
              { classement: 'A/SURV', action: 'Suivi trimestriel, étude si aggravation.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'mur-soutenement',
        nom: 'Mur de soutènement',
        anomalies: [
          {
            id: 'oa-mur-01',
            code: 'OA-MUR-01',
            name: 'Déformation de mur',
            description: "Ventre ou inclinaison anormale du mur de soutènement.",
            defaut: "Déversement vers la voie.",
            ecart: "Fil à plomb + mesures topographiques.",
            classements: [
              { condition: 'inclinaison stable', classement: 'A/SURV', action: 'Suivi topographique annuel.' },
              { condition: 'évolution observée', classement: 'S/DP', action: 'Expertise + limitation éventuelle.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'gabarit',
        nom: 'Gabarit',
        anomalies: [
          {
            id: 'oa-gab-01',
            code: 'OA-GAB-01',
            name: 'Empiètement gabarit',
            description: "Objet fixe empiétant sur le gabarit du matériel roulant.",
            defaut: "Obstacle détecté au gabarit.",
            ecart: "Contrôle au gabarit mobile ou laser.",
            classements: [
              { classement: 'S/I', action: 'Dégagement immédiat + limitation de vitesse si non dégageable.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'abords',
    nom: 'Abords',
    description: 'Talus, remblai, végétation, drainage, clôture',
    couleur: '#A85D3F', // terracotta — distinct du sncf-green (Ouvrages)
    couleurFg: '#FFFFFF',
    icon: '🌲',
    types: [
      {
        id: 'talus',
        nom: 'Talus & remblai',
        anomalies: [
          {
            id: 'ab-tal-01',
            code: 'AB-TAL-01',
            name: 'Glissement de talus',
            description: "Mouvement de terrain sur talus ou remblai.",
            defaut: "Arrachement, crevasses, dépôt en pied.",
            ecart: "Inspection visuelle + jalons topographiques.",
            classements: [
              { condition: 'glissement superficiel stabilisé', classement: 'A/SURV', action: 'Suivi semestriel.' },
              { condition: 'glissement actif', classement: 'S/I', action: 'Limitation immédiate + reprise talus.' },
            ],
            reference: null,
            illus: { caption: 'Glissement talus — repérage des crevasses' },
          },
        ],
      },
      {
        id: 'vegetation',
        nom: 'Végétation',
        anomalies: [
          {
            id: 'ab-veg-01',
            code: 'AB-VEG-01',
            name: 'Intrusion végétation au gabarit',
            description: "Branches ou arbustes empiétant sur le gabarit.",
            defaut: "Feuillage en contact possible avec le matériel.",
            ecart: "Contrôle visuel au gabarit.",
            classements: [
              { classement: 'A/P', action: 'Élagage à programmer sous 2 semaines.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'drainage',
        nom: 'Drainage & fossés',
        anomalies: [
          {
            id: 'ab-drain-01',
            code: 'AB-DRAIN-01',
            name: 'Obstruction de fossé',
            description: "Fossé bouché empêchant l'écoulement des eaux.",
            defaut: "Stagnation d'eau en pied de remblai.",
            ecart: "Inspection visuelle.",
            classements: [
              { classement: 'A/M', action: 'Curage à programmer.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'cloture',
        nom: 'Clôture',
        anomalies: [
          {
            id: 'ab-clo-01',
            code: 'AB-CLO-01',
            name: 'Clôture défoncée',
            description: "Clôture déchirée ou arrachée, accès libre aux voies.",
            defaut: "Brèche ouverte.",
            ecart: "Inspection visuelle + mesure linéaire.",
            classements: [
              { classement: 'A/P', action: 'Réparation sous 7 jours.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'signalisation',
    nom: 'Installations de signalisation',
    description: 'Signaux, pancartes, balises, repères de distance',
    couleur: '#F7A600', // sncf-orange
    couleurFg: '#FFFFFF',
    icon: '🚦',
    types: [
      {
        id: 'signaux',
        nom: 'Signaux (patrimoine)',
        anomalies: [
          {
            id: 'sig-sgn-01',
            code: 'SIG-SGN-01',
            name: 'Signal désorienté',
            description: "Signal de patrimoine ayant pivoté sur son mât.",
            defaut: "Rotation visible du panneau.",
            ecart: "Relevé visuel de l'orientation.",
            classements: [
              { classement: 'A/P', action: 'Réorientation et serrage sous 7 jours.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'pancartes',
        nom: 'Pancartes & panneaux',
        anomalies: [
          {
            id: 'sig-pan-01',
            code: 'SIG-PAN-01',
            name: 'Pancarte TIV illisible',
            description: "Pancarte de limitation de vitesse effacée ou recouverte.",
            defaut: "Lettrage illisible, face dégradée.",
            ecart: "Inspection visuelle.",
            classements: [
              { classement: 'S/DP', action: 'Remplacement sous 48 h.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'balises',
        nom: 'Balises',
        anomalies: [
          {
            id: 'sig-bal-01',
            code: 'SIG-BAL-01',
            name: 'Balise déplacée',
            description: "Balise KVB ou repère déplacée de son positionnement nominal.",
            defaut: "Décalage visible par rapport à la fixation.",
            ecart: "Mesure position + contrôle fixation.",
            classements: [
              { classement: 'A/M', action: 'Repositionnement en maintenance.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'reperes',
        nom: 'Repères de distance',
        anomalies: [
          {
            id: 'sig-rep-01',
            code: 'SIG-REP-01',
            name: 'Repère manquant',
            description: "Borne kilométrique ou hectométrique absente.",
            defaut: "Borne arrachée ou volée.",
            ecart: "Inspection visuelle.",
            classements: [
              { classement: 'A/M', action: 'Repose en maintenance planifiée.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'platelage',
    nom: 'Platelage',
    description: 'Planchéiage PN, revêtement routier PN, quai',
    couleur: '#475569', // slate harmonisé, minéral
    couleurFg: '#FFFFFF',
    icon: '🧱',
    types: [
      {
        id: 'plancheiage-pn',
        nom: 'Planchéiage (PN)',
        anomalies: [
          {
            id: 'pla-pn-01',
            code: 'PLA-PN-01',
            name: 'Dalle PN désaffleurée',
            description: "Dalle de passage à niveau présentant un dénivelé avec le rail.",
            defaut: "Marche entre dalle et champignon du rail.",
            ecart: "Règle + pige au PN.",
            classements: [
              { condition: 'désaffleurement ≤ 5 mm', classement: 'A/SURV', action: 'Suivi trimestriel.' },
              { condition: 'désaffleurement > 5 mm', classement: 'S/DP', action: 'Reprise dalle sous 72 h.' },
            ],
            reference: null,
            illus: { caption: 'Dalle PN — désaffleurement à la règle' },
          },
        ],
      },
      {
        id: 'revetement-pn',
        nom: 'Revêtement routier (PN)',
        anomalies: [
          {
            id: 'pla-rev-01',
            code: 'PLA-REV-01',
            name: 'Nid-de-poule sur PN',
            description: "Dégradation du revêtement routier au droit du PN.",
            defaut: "Cratère dans l'enrobé.",
            ecart: "Mesure profondeur + surface.",
            classements: [
              { classement: 'A/P', action: 'Réparation enrobé sous 15 jours.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
      {
        id: 'quai',
        nom: 'Quai',
        anomalies: [
          {
            id: 'pla-quai-01',
            code: 'PLA-QUAI-01',
            name: 'Fissure dalle de quai',
            description: "Fissure sur dalle de quai voyageurs.",
            defaut: "Fissure longitudinale ou transversale.",
            ecart: "Mesure au fissuromètre + suivi.",
            classements: [
              { condition: 'fissure fine non évolutive', classement: 'A/SURV', action: 'Suivi annuel.' },
              { condition: 'fissure évolutive ou écaillage', classement: 'A/P', action: 'Reprise sous 1 mois.' },
            ],
            reference: null,
            illus: null,
          },
        ],
      },
    ],
  },
]
