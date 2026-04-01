class Particle {
    // pos : objet {x, y} retourné par font.textToPoints
    constructor(pos) {
        this.pos = createVector(pos.x, pos.y);
        this.origin = createVector(pos.x, pos.y); // position d'origine (pour le rappel)
        this.vel = createVector(random(-1, 1), random(-1, 1));
        this.acc = createVector(0, 0);
        this.mass = 1;
        this.isText = false;
    }

    // Applique un bruit de Perlin sur l'accélération
    applyNoise() {
        // Amplitude réduite pour les particules texte
        let amp = this.isText ? 0.08 : 0.5;
        let noise_x = map(noise(this.pos.x * 0.005, this.pos.y * 0.005, frameCount * 0.01), 0, 1, -amp, amp);
        let noise_y = map(noise(this.pos.x * 0.005 + 100, this.pos.y * 0.005 + 100, frameCount * 0.01), 0, 1, -amp, amp);
        this.acc.add(noise_x, noise_y);
    }

    // Force de rappel vers la position d'origine (ressort amorti)
    // stiffness : raideur du ressort, damping : amortissement de la vitesse
    applySpring(stiffness = 2, damping = 0.85) {
        let dx = this.origin.x - this.pos.x;
        let dy = this.origin.y - this.pos.y;
        // Force proportionnelle à l'écart (loi de Hooke)
        this.acc.x += dx * stiffness;
        this.acc.y += dy * stiffness;
        // Amortissement : réduit la vitesse progressivement
        this.vel.mult(damping);
    }

    // Met à jour la position/vitesse selon la physique (dt en secondes)
    update(dt) {
        if (this.isText) {
            // Particule texte : rappel vers l'origine + léger bruit
            this.vel.add(this.acc);
            this.vel.limit(this.maxSpeed);
            this.pos.add(this.vel);
            this.acc.set(0, 0);
        }
        // F = ma  →  a = F/m   
        this.vel.add(p5.Vector.mult(this.acc, dt / this.mass));
        // Limite la vitesse max
        let maxSpeed = 100;
        this.vel.limit(maxSpeed);
        this.pos.add(p5.Vector.mult(this.vel, dt));
        // Réinitialise l'accélération à chaque frame
        this.acc.set(0, 0);
        // Rebond sur les bords (seulement pour les particules libres)
        // if (!this.isText) {
        //     this.edges();
        // }
    }


    // Rebond élastique sur les 4 bords de l'écran
    edges() {
        if (this.pos.x < 0) {
            this.pos.x = 0;
            this.vel.x *= -1;
        } else if (this.pos.x > width) {
            this.pos.x = width;
            this.vel.x *= -1;
        }

        if (this.pos.y < 0) {
            this.pos.y = 0;
            this.vel.y *= -1;
        } else if (this.pos.y > height) {
            this.pos.y = height;
            this.vel.y *= -1;
        }
    }

    // Lennard-Jones : attraction/répulsion entre this et other
    // sigma : distance d'équilibre (en px), epsilon : intensité
    ljForce(other, sigma = 80, epsilon = 5000) {
        let dx = this.pos.x - other.pos.x;
        let dy = this.pos.y - other.pos.y;
        let dis = sqrt(dx * dx + dy * dy);

        // Évite la division par zéro
        if (dis < 0.1) return;

        // Ratio normalisé (sigma/distance) — sans unité
        let sr = sigma / dis;
        let sr6 = sr ** 6;
        let sr12 = sr6 * sr6;

        // Force scalaire (dérivée du potentiel LJ)
        // Positive = répulsion, Négative = attraction
        let forceMag = 24 * epsilon / (dis * dis) * (2 * sr12 - sr6);

        // Clamp pour éviter les explosions numériques
        forceMag = constrain(forceMag, -500, 500);

        // Direction unitaire de other vers this
        let fx = forceMag * dx / dis;
        let fy = forceMag * dy / dis;

        // Applique sur les deux particules (3ème loi de Newton)
        this.acc.x += fx;
        this.acc.y += fy;
        other.acc.x -= fx;
        other.acc.y -= fy;
    }

    arrive(target, d = 0) {
        // 2nd argument true enables the arrival behavior
        // 3rd argument d is the distance behind the target
        // for "snake" behavior
        return this.seek(target, true, d);
    }

    seek(target, arrival = false, d = 0) {
        let valueDesiredSpeed = this.maxSpeed;

        if (arrival) {
            // On définit un rayon de freinage de n pixels autour de la cible
            // si la distance entre le véhicule courant et la cible
            // est inférieure à ce rayon, on ralentit le véhicule
            // desiredSpeed devient inversement proportionnelle à la distance
            // si la distance est petite, force = grande
            // Vous pourrez utiliser la fonction P5 
            // v = map(valeur, valeurMin, valeurMax, nouvelleValeurMin, nouvelleValeurMax)
            // qui prend une valeur entre valeurMin et valeurMax et la transforme en une valeur
            // entre nouvelleValeurMin et nouvelleValeurMax

            // 1 - dessiner le cercle de rayon 100 autour de la target
            if (Particle.debug) {
                push();
                stroke(255, 255, 255);
                noFill();
                circle(target.x, target.y, 100);
                pop();
            }

            // 2 - calcul de la distance entre la cible et le véhicule
            let distance = p5.Vector.dist(this.pos, target);

            // 3 - si distance < rayon du cercle, alors on modifie desiredSPeed
            // qui devient inversement proportionnelle à la distance.
            // si d = rayon alors desiredSpeed = maxSpeed
            // si d = 0 alors desiredSpeed = 0
            if (distance < this.rayonZoneDeFreinage) {
                valueDesiredSpeed = map(distance, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
            }
        }

        // Ici on calcule la force à appliquer au véhicule
        // pour aller vers la cible (avec ou sans arrivée)
        // un vecteur qui va vers la cible, c'est pour le moment la vitesse désirée
        let desiredSpeed = p5.Vector.sub(target, this.pos);
        desiredSpeed.setMag(valueDesiredSpeed);

        // Force = desiredSpeed - currentSpeed
        let force = p5.Vector.sub(desiredSpeed, this.vel);
        force.limit(this.maxForce);
        return force;
    }

    applyForce(force) {
        this.acc.add(force);
    }
    show() {
        push();
        fill("white");
        noStroke();
        translate(this.pos.x, this.pos.y);
        circle(0, 0, 4);
        pop();
    }
}