class Laser extends Heart {
    constructor(x, y, targetX, targetY) {
        super(x, y);
        this.r = 10;
        this.maxSpeed = 8;

        // Direction vers la cible (véhicule)
        let target = createVector(targetX, targetY);
        let dir = p5.Vector.sub(target, this.pos);
        dir.setMag(this.maxSpeed);
        this.vel = dir;

        // Les spears ne freinent pas et ne tournent pas toutes seules
        this.maxForce = 0;

        this.perceptionRadius = 25;
        // pour le comportement align
        this.alignWeight = 1.5;
        // pour le comportement cohesion
        this.cohesionWeight = 1;
        // Pour la séparation
        this.separationWeight = 2;
        // Pour le confinement
        this.boundariesWeight = 10;
        // pour le avoid
        this.avoidWeight = 15;
    }

    update() {
        // Les spears avancent simplement en ligne droite
        this.pos.add(this.vel);
    }

    /*
 seek est une méthode qui permet de faire se rapprocher le véhicule de la cible passée en paramètre
 */
    seek(target) {
        // on calcule la direction vers la cible
        // C'est l'ETAPE 1 (action : se diriger vers une cible)
        let force = p5.Vector.sub(target, this.pos);

        // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
        // on limite ce vecteur à la longueur maxSpeed
        force.setMag(this.maxSpeed);
        // on calcule la force à appliquer pour atteindre la cible
        force.sub(this.vel);
        // on limite cette force à la longueur maxForce
        force.limit(this.maxForce);
        // on applique la force au véhicule
        return force;
    }

    applyBehaviors(target) {
        let force = this.seek(target);
        //let force = this.flee(target);
        this.applyForce(force);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Dessin de la spear (une ligne avec une pointe)
        stroke(255, 200, 0);
        strokeWeight(2);
        line(-15, 0, 15, 0); // Corps de la lance


        // Debug circle
        if (Heart.debug) {
            noFill();
            stroke(255, 100);
            circle(0, 0, this.r * 2);
        }
        pop();
    }
}