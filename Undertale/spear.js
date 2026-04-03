class Spear extends Heart {
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
  }

  update() {
    // Les spears avancent simplement en ligne droite, en adaptant leur norme selon la vitesse paramétrée
    this.vel.setMag(this.maxSpeed);
    this.pos.add(this.vel);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // Dessin de la spear (une ligne avec une pointe)
    image(spearImg, -this.r / 2, -this.r / 2, this.r, this.r);
    noTint();
    
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