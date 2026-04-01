let target;
let particles = [];
let points = [];
let vehicules = [];
let font;
let text = "PLURIBUS";
let lastWaveTime = 0; // timestamp de la dernière vague (en ms)

// Appelée avant de démarrer l'animation
function preload() {
  font = loadFont('./assets/Freudian.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // La cible, ce sera la position de la souris
  target = createVector(random(width), random(height));

  let step = 30;
  for (let x = 0; x <= width; x += step) {
    for (let y = 0; y <= height; y += step) {
      let point = createVector(x, y);
      particles.push(new Particle(point));
    }
  }
  textDraw("PLURIBUS", width / 3, height / 2, 256);

}

// Appelée 60 fois par seconde
function draw() {
  background(0);

  // dt en secondes (deltaTime est en ms en p5.js)
  let dt = deltaTime / 1000;

  target.x = mouseX;
  target.y = mouseY;

  // Dessin de la cible à la position de la souris
  push();
  fill(255, 0, 0);
  noStroke();
  ellipse(target.x, target.y, 32);
  pop();

  // Vague toutes les 3 secondes
  if (millis() - lastWaveTime > 1000) {
    addWave(particles);
    lastWaveTime = millis();
  }

  // 1. Appliquer toutes les forces d'abord (avant update qui remet acc à 0)
  for (let i = 0; i < particles.length; i++) {
    particles[i].applyNoise();
    // LJ uniquement entre particules non-texte
    if (!particles[i].isText && i < particles.length - 1 && !particles[i + 1].isText) {
      particles[i].ljForce(particles[i + 1]);
    }
  }

  // 2. Intégrer la physique et afficher
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(dt);
    particles[i].show();
  }

}

function textDraw(text, x, y, size) {
  let pts = font.textToPoints(text, x, y, size, { sampleFactor: 0.2 });
  pts.forEach((point, index) => {
    point = createVector(point.x, point.y);
    steeringForce = particles[index].arrive(point, 0);
    particles[index].applyForce(steeringForce);
    particles[index].update();
    particles[index].show();

  })
}

// Crée un anneau de particules au centre avec une vitesse radiale
// (fonction globale, déclenchée toutes les 3s)
function addWave(dots, numDots = 80, speed = 200) {
  let cx = width / 2.8
  let cy = height / 2.4

  for (let i = 0; i < numDots; i++) {
    let angle = TWO_PI * i / numDots;

    // Position de départ : petit cercle autour du centre
    let p = new Particle(createVector(
      cx + cos(angle) * 5,
      cy + sin(angle) * 5
    ));

    // Vitesse initiale orientée vers l'extérieur
    p.vel = createVector(cos(angle) * speed, sin(angle) * speed);

    dots.push(p);
  }
}