class Spear extends Vehicle {
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
    // Les spears avancent simplement en ligne droite
    this.pos.add(this.vel);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    
    // Dessin de la spear (une ligne avec une pointe)
    stroke(255, 200, 0);
    strokeWeight(3);
    line(-15, 0, 15, 0); // Corps de la lance
    
    fill(255, 0, 0);
    noStroke();
    triangle(15, 0, 8, -5, 8, 5); // Pointe
    
    // Debug circle
    if (Vehicle.debug) {
      noFill();
      stroke(255, 100);
      circle(0, 0, this.r * 2);
    }
    pop();
  }
}