# Axiome — site vitrine d'agence de conseil en IA

Site statique d'une page, sans dépendance ni étape de build : trois fichiers
(`index.html`, `styles.css`, `script.js`) et une police chargée depuis Google Fonts.

## Lancer en local

```bash
npx serve .          # puis ouvrir http://localhost:3000
```

Ou simplement ouvrir `index.html` dans un navigateur.

## Direction artistique

Système « indigo-ink ledger on frosted glass » : canevas blanc cassé, texte
bleu nuit (`#061b31`), un unique accent indigo (`#533afd`) réservé aux actions,
liens et traits d'icônes. Graisse 300 partout, y compris en taille d'affichage ;
l'interlettrage se resserre à mesure que le corps grandit. Aucune ombre — la
profondeur vient des teintes de fond et des filets de 1px. Rayon de 4px sur tous
les boutons, champs et cartes. Tous les jetons sont déclarés en variables CSS
en tête de `styles.css`.

La police de référence (`sohne-var`) est remplacée par **Inter Tight**
(graisses 300/400), substitut humaniste à grande hauteur d'x.

## Effets au survol

- Boutons magnétiques qui suivent légèrement le curseur, avec balayage lumineux
- Halo indigo diffus qui suit le curseur avec inertie
- Cartes d'expertise : filet indigo qui se déploie, fond qui vire au brouillard,
  inclinaison 3D de 4°, lien « Explorer › » qui apparaît avec son chevron
- Indicateur de navigation qui glisse d'un lien à l'autre
- Rail de logos qui se met en pause au survol
- Liens de pied de page à soulignement animé, liens en ligne à soulignement inversé

## Effets au défilement

- Barre de progression de lecture en haut de page
- Révélation en fondu + translation, avec décalage en cascade (`data-delay`)
- Titre du héros dévoilé ligne par ligne derrière un masque
- Compteurs chiffrés animés au premier passage (formatage français)
- Parallaxe sur le panneau « registre », dont les valeurs se rafraîchissent en direct
- Section Méthode : colonne collante, jauge de progression et étape courante suivie
- Tracés SVG dessinés à l'entrée dans le champ (héros et étude de cas)
- Séparateurs qui s'étirent, filets d'intitulé qui se déploient
- Barre de navigation qui se compacte et révèle son filet au défilement

## Accessibilité

Lien d'évitement, structure de titres cohérente, libellés de formulaire associés,
`aria-live` sur le retour du formulaire, cibles focalisables avec contour visible,
menu mobile piloté par `aria-expanded`. L'ensemble des animations est neutralisé
sous `prefers-reduced-motion: reduce`, en CSS comme en JavaScript.

## Note

Contenu de démonstration : la marque, les chiffres, les références clients et les
coordonnées sont fictifs.
