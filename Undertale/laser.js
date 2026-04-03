class Laser extends Vehicle {
    constructor(x, y, targetX, targetY) {
        super(x, y);
        this.r = 10;
        this.maxSpeed = 8;

        // Direction vers la cible (véhicule)
        let target = createVector(targetX, targetY);
        let dir = p5.Vector.sub(target, this.pos);
        dir.setMag(this.maxSpeed);
        this.vel = dir;

        // Changed maxForce to > 0 so lasers can steer
        this.maxForce = 0.2;

        this.perceptionRadius = 50; // Increased a bit to make cohesion visible
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
        // Apply acceleration to velocity, update position, and reset acc
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.set(0, 0);
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

    cohesion(lasers) {
        let perceptionRadius = 2 * this.perceptionRadius;
        let steering = createVector();
        let total = 0;

        for (let other of lasers) {
            let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            if (other != this && d < perceptionRadius) {
                steering.add(other.pos);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);

            steering.sub(this.pos);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(lasers) {
        let perceptionRadius = this.perceptionRadius;

        let steering = createVector();
        let total = 0;

        for (let other of lasers) {
            let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            if (other != this && d < perceptionRadius) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.div(d * d); // Weight by inverse distance squared
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    applyBehaviors(target, lasers) {
        let seekForce = this.seek(target);
        
        let cohesionForce = createVector(0, 0);
        let separationForce = createVector(0, 0);
        if (lasers) {
            cohesionForce = this.cohesion(lasers);
            cohesionForce.mult(this.cohesionWeight);
            
            separationForce = this.separation(lasers);
            separationForce.mult(this.separationWeight);
        }

        this.applyForce(seekForce);
        this.applyForce(cohesionForce);
        this.applyForce(separationForce);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Dessin du laser (lignes jaunes en pixel art)
        stroke(255, 255, 0); // Yellow
        strokeWeight(4);
        strokeCap(SQUARE); // Pixel art style
        line(-15, 0, 15, 0); // Corps du laser


        // Debug circle
        if (Heart.debug) {
            noFill();
            stroke(255, 100);
            circle(0, 0, this.r * 2);

        }
        pop();
    // dessin sous la forme d'une flèche du vecteur vitesse
    this.drawVelocityVector();
  }

  drawVelocityVector() {
    push();

    // Dessin du vecteur vitesse
    // Il part du centre du véhicule et va dans la direction du vecteur vitesse
    strokeWeight(3);
    stroke("red");
    line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    rotate(this.vel.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);

    pop();
  }

}