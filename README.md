# 🐟 Undertale - Steering Behaviors Showcase

[Jouer au jeu en ligne](https://kinopix621.github.io/SteeringBehavioursM2IA2_2025_2026/) | [Vidéo de démonstration YouTube](https://youtu.be/w9mQSAANRas)

![Déroulement du jeu](assets/images/undertale.gif)

---

## 🎯 1. But du jeu

Vous incarnez **Undyne the Undying** lors de la route génocide du jeu **Undertale**. Votre mission est d'arrêter **Chara** (représenté par le cœur rouge), une menace imminente pour le royaume des monstres.
*(Si vous n'avez jamais joué à Undertale, je vous recommande vivement, sinon vous ne comprendrez pas les références ;) !)*

### 📜 Règles du jeu :
- **Attaque** : Utilisez votre curseur pour viser et cliquez pour invoquer des lances.
- **Restriction** : Vous ne pouvez pas tirer de lances à l'intérieur du carré de combat (zone sacrée de Chara).
- **Projectiles de Chara** : Le cœur invoque des lasers toutes les deux secondes. Ces lasers vous suivent et peuvent vous infliger des dégâts.
- **Défense** : Vous pouvez détruire les lasers ennemis en les touchant avec vos propres lances.
- **Conditions de victoire** : Touchez le cœur **5 fois** pour gagner.
- **Conditions de défaite** : Vous perdez si vous êtes touché **3 fois** par les lasers.
- **Gestion des ressources** : Vous disposez de **10 lances**. Une fois épuisées, une recharge de 2 secondes est nécessaire.

---

## 🧱 2. Explication des classes

Le système repose sur un modèle de comportement autonome (Steering Behaviors) inspiré par Craig Reynolds.

- **`Vehicle`** : La classe parente universelle. Elle gère la physique de base (intégration d'Euler), la gestion de l'accélération, de la vitesse et de la force maximale. Elle contient les comportements de pilotage atomiques comme `seek`, `flee`, `pursue`, `cohesion` et `separation`.
- **`Heart` (Chara)** : Sous-classe de `Vehicle` utilisant un comportement complexe d'évitement à 360° (`avoid`). Elle calcule la force de fuite par rapport à toutes les lances détectées dans son rayon de perception. Elle reste également confinée dans son arène via le comportement `boundaries`.
- **`Laser`** : Projectiles de Chara. Ce sont des véhicules qui utilisent des comportements multiples : ils se dirigent vers le joueur (`seek`) tout en maintenant une structure de groupe fluide grâce à la `cohesion` (rester groupés) et la `separation` (éviter de s'écraser les uns sur les autres).
- **`Spear`** : L'arme d'Undyne. Contrairement à un projectile classique, la lance utilise le comportement **`pursue`** pour calculer une trajectoire d'interception prédictive en fonction de la position *future* et de la vitesse du cœur au moment du tir.
- **`Fragment`** : Entités générées lors de la phase finale (destruction du cœur). Elles héritent de `Vehicle` pour leur mouvement mais sont principalement soumises à une force de gravité externe.

---

## 🛠️ 3. Debug et Sliders

Le mode Debug (activable avec la touche **`d`**) permet de visualiser les coulisses de l'IA :
- **Vecteurs rouges** : Direction et magnitude de la vitesse actuelle.
- **Cercles verts/rouges** : Rayons de perception et zones de danger du cœur.
- **Cercle rouge éphémère** : Point d'impact prédit par les lances.

### Contrôle de la simulation via les Sliders :
- **Rayon de détection** : Ajuste la distance à laquelle le cœur commence à fuir.
- **Force/Vitesse du cœur** : Modifie l'agilité de Chara.
- **Force des lasers** : Règle la capacité des lasers à changer de direction brusquement.
- **Cohésion/Séparation** : Définit si les lasers se déplacent comme un essaim compact ou de manière plus dispersée.
- **Vitesse des lances** : Modifie la difficulté en rendant vos attaques plus rapides.

---

## 💭 4. Mon expérience personnelle
J'ai eu l'idée de ce jeu en m'inspirant d'Undertale, un jeu que j'affectionne beaucoup. C'était une bonne facon pour moi d'implémenter des steerings behavior sur les projectiles et le coeur.

Le coeur a un comportement de evade, inspiré de la classe Boid, il detecte les projectiles dans un rayon défini et s'en éloigne. De plus, si le projectile est proche de lui (cercle rouge en debug), il va se déplacer plus vite.

Pour les lances, j'ai préféré qu'il aille simplement vers la prochaine destination du coeur en regardant 20 frames devant, car ca aurait été trop facile si les lances 
le poursuivait intelligement. Ca permet en plus de créer des strategies pour réussir à le toucher, comme se positionner pile devant lui ou attendre que le coeur soit au bord du cadre par exemple. 

Enfin pour les lasers, ils poursuivent indefiniement le joueur avec seek, et en plus on un comportement de cohésion et de séparation pour qu'ils ne se rentrent pas dedans et qu'ils forment une sorte de barrière contre le joueur.

Difficultés rencontrés:
- Trouver les bons comportements qui conviennent pour chaque sous-classe
- Le coeur ne pouvait pas détecter les projectiles qui étaient ailleurs que devant lui avec la fonction standard de flee de Vehicle, je l'ai donc modifier en m'inspirant de ce qui se faisait dans Boids pour qu'il detecte les projectiles dans un rayon défini.
---

## 🚀 5. Outils utilisés
- **Antigravity IDE** : Environnement de développement agentique.
- **Modèles AI utilisés** : Gemini 3.1 Pro & Claude 4.6 Sonnet pour l'aide à la conception des algorithmes de steering et les différentes phases du jeu.
- **Fichier de règles** : [AGENTS.md](../AGENTS.md) pour les règles de conception et les principes fondamentaux suivis lors du développement de ce projet.
---
