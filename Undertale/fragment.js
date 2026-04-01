class Fragment {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(2, 6));
    this.acc = createVector(0, 0.2); // Gravity
    this.r = random(4, 10);
    this.life = 255;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.life -= 4;
  }

  show() {
    push();
    fill(255, 0, 0, this.life);
    noStroke();
    // Triangular fragment look
    beginShape();
    vertex(this.pos.x, this.pos.y - this.r);
    vertex(this.pos.x + this.r, this.pos.y + this.r);
    vertex(this.pos.x - this.r, this.pos.y + this.r);
    endShape(CLOSE);
    pop();
  }
}