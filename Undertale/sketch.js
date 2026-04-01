let pursuer1;
let target;
let spears = [];
let vehicules = [];
let heartImg;
let score = 0;
let gameState = "PLAY"; // PLAY, WIN, LOSE, BREAKING
let gameTimer = 30;
let startTime;
let fragments = [];
let restartButton;

// Cooldown pour les spears
let spearCooldown = 1000;
let lastSpearTime = 0;

let munition = 10;
let isRecharging = false;

// Définition des limites du carré (Boundary)
let bX, bY, bW, bH;
let boundaryMargin = 1;

let breakStartTime;
let lastResetTime = 0;

function preload() {
  heartImg = loadImage("assets/images/heart.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetGame();

  restartButton = createButton('Recommencer');
  restartButton.position(width / 2 - 50, height / 2 + 50);
  restartButton.mousePressed(resetGame);
  restartButton.hide();
}

function resetGame() {
  score = 0;
  gameTimer = 30;
  startTime = millis();
  gameState = "PLAY";
  spears = [];
  vehicules = [];
  fragments = [];
  munition = 10;
  isRecharging = false;
  
  if (restartButton) restartButton.hide();

  bW = min(windowWidth, windowHeight) * 0.3;
  bH = bW;
  bX = (windowWidth - bW) / 2;
  bY = (windowHeight - bH) / 1.1;

  pursuer1 = new Vehicle(bX + bW / 2, bY + bH / 2);
  vehicules.push(pursuer1);

  lastResetTime = millis();
  // Play music
  
}

function draw() {
  background(0, 0, 0, 100);

  if (gameState === "PLAY") {
    playLoop();
  } else if (gameState === "BREAKING") {
    breakingLoop();
  } else if (gameState === "WIN") {
    winScreen();
  } else if (gameState === "LOSE") {
    loseScreen();
  }
}

function playLoop() {
  let elapsed = (millis() - startTime) / 1000;
  let remaining = max(0, gameTimer - elapsed);

  // Dessin du carré limite
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(bX, bY, bW, bH);

  // UI
  fill(255);
  textSize(32);
  textAlign(LEFT, TOP);
  text("Objectif: 5 hits", 20, 20);
  text("Score: " + score, 20, 60);
  text("Temps: " + ceil(remaining) + "s", 20, 100);

  // Munitions
  text("Munitions: ", 20, 140);
  if (munition > 0) {
    text(munition, 200, 140);
  } else {
    fill(255, 0, 0);
    text("Recharge...", 200, 140);
    if (!isRecharging) {
      isRecharging = true;
      setTimeout(recharge, 2000);
    }
  }

  // Check Game State
  if (score >= 5) {
    gameState = "BREAKING";
    breakStartTime = millis();
    initHeartBreak(vehicules[0].pos.copy());
    vehicules = []; // Hide heart
    return;
  }

  if (remaining <= 0) {
    gameState = "LOSE";
    restartButton.show();
    return;
  }

  // Spears logic
  for (let i = spears.length - 1; i >= 0; i--) {
    let s = spears[i];
    s.update();
    s.show();

    for (let j = vehicules.length - 1; j >= 0; j--) {
      let v = vehicules[j];
      let d = p5.Vector.dist(s.pos, v.pos);
      if (d < s.r + v.r_pourDessin) {
        score++;
        spears.splice(i, 1);
        break;
      }
    }

    if (s && (s.pos.x < 0 || s.pos.x > width || s.pos.y < 0 || s.pos.y > height)) {
      if (spears[i] === s) spears.splice(i, 1);
    }
  }

  // Vehicles logic
  vehicules.forEach(v => {
    v.applyBehaviors(spears, vehicules, bX, bY, bW, bH, boundaryMargin);
    v.update();
    v.show();
  });
}

function initHeartBreak(pos) {
  // Create fragments
  for (let i = 0; i < 15; i++) {
    fragments.push(new Fragment(pos.x, pos.y));
  }
}

function breakingLoop() {
  for (let i = fragments.length - 1; i >= 0; i--) {
    fragments[i].update();
    fragments[i].show();
  }
  
  // Transition to Win Screen after 2 seconds
  if (millis() - breakStartTime > 2000) {
     gameState = "WIN";
     restartButton.show();
  }
}

function winScreen() {
  fill(0, 255, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("VOUS AVEZ GAGNÉ !", width / 2, height / 2);
}

function loseScreen() {
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2);
}

function mousePressed() {
  // On ignore le clic s'il vient de relancer le jeu (évite de tirer une spear en cliquant sur recommencer)
  if (millis() - lastResetTime < 200) return;

  if (gameState === "PLAY" && mouseButton === LEFT && munition > 0) {
    munition--;
    let closestV = null;
    let minD = Infinity;
    vehicules.forEach(v => {
      let d = dist(mouseX, mouseY, v.pos.x, v.pos.y);
      if (d < minD) {
        minD = d;
        closestV = v;
      }
    });

    if (closestV) {
      spears.push(new Spear(mouseX, mouseY, closestV.pos.x, closestV.pos.y));
    }
  }
}

function recharge() {
  munition = 10;
  isRecharging = false;
}

