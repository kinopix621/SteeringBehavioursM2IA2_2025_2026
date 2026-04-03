let pursuer1;
let target;
let spears = [];
let lasers = [];
let heartImg;
let heartLives = 5;
let playerLives = 3;
let gameState = "START"; // START, PLAY, WIN, LOSE, BREAKING
let startTime;
let fragments = [];
let restartButton;

// Cooldown pour les lasers
let laserCooldown = 2000;
let lastLaserTime = 0;
let perceptionSlider;
let laserForceSlider;
let laserSpeedSlider;
let spearForceSlider;
let spearSpeedSlider;

// Cooldown pour les spears
let spearCooldown = 2000;
let lastSpearTime = 0;

let munition = 10;
let isRecharging = false;

// Définition des limites du carré (Boundary)
let bX, bY, bW, bH;
let boundaryMargin = 1;

let breakStartTime;
let lastResetTime = 0;

function preload() {
  font = loadFont('./assets/fonts/pixel.ttf');
  heartImg = loadImage("assets/images/heart.png");
  spearImg = loadImage("assets/images/spear.png");
  soundFormats('mp3', 'ogg');
  battleMusic = loadSound("assets/music/battle.mp3");
  damageGivenSound = loadSound("assets/music/undertale-damage-taken.mp3");
  spearSound = loadSound("assets/music/spear.mp3")
  winSong = loadSound("assets/music/win.mp3")
  heartBreak = loadSound("assets/music/heartbreak.m4a")
  laserSound = loadSound("assets/music/laser.mp3")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetGame();

  restartButton = createButton('Recommencer');
  restartButton.position(width / 2 - 50, height / 2 + 50);
  restartButton.mousePressed(resetGame);
  restartButton.hide();
  perceptionSlider = createCustomSlider("Rayon de detection", 0, 300, 150, 1, 20, 180);
  // heartForceSlider = createCustomSlider("Force du coeur", 0, 1, 0.2, 0.01, 20, 210);
  // heartSpeedSlider = createCustomSlider("Vitesse du coeur", 1, 20, 8, 0.5, 20, 240);

  laserForceSlider = createCustomSlider("Force des lasers", 0, 1, 0.2, 0.01, 20, 270);
  laserSpeedSlider = createCustomSlider("Vitesse des lasers", 1, 20, 4, 0.5, 20, 300);

  spearForceSlider = createCustomSlider("Force des lances", 0, 1, 0, 0.01, 20, 330);
  spearSpeedSlider = createCustomSlider("Vitesse des lances", 1, 20, 8, 0.5, 20, 360);


}

function resetGame() {
  gameState = "START";
  spears = [];
  fragments = [];
  munition = 10;
  isRecharging = false;

  if (restartButton) restartButton.hide();

  bW = min(windowWidth, windowHeight) * 0.5;
  bH = bW;
  bX = (windowWidth - bW) / 2;
  bY = (windowHeight - bH) / 2;

  heart = new Heart(bX + bW / 2, bY + bH / 2);
  heartLives = 5;
  playerLives = 3;
  lasers = [];
  lastResetTime = millis();

}

function draw() {
  background(0, 0, 0, 100);
  // Regles
  fill(255);
  textSize(20);
  textAlign(RIGHT, TOP);
  text("Règles : ", width - 100, 20);
  text("A l'aide de votre curseur, eliminer le coeur en faisant un clic droit pour invoquer des lances", width - 100, 45);
  text("Attention, le coeur vous lancera des lasers toutes les deux secondes qui vous suivent indefiniment !", width - 100, 70);
  text("Vous pouvez vous en debarasser en les touchant avec vos lances", width - 100, 95);
  text("Vous devez toucher le coeur 5 fois pour gagner et vous avez 3 vies.", width - 100, 120);
  text("Vous avez droit qu'a 10 fleches et 2 secondes de recharge a chaque fois", width - 100, 145);
  fill(255, 0, 0);
  text("Vous ne pouvez pas tirer a l'interieur du cadre !", width -100, 170);
  fill(255);
  text("Vous pouvez ajuster la difficulté du jeu en modifiant le rayon de detection des lances, la vitesse, la force des lances/lasers. Bonne chance!", width-100, 195);
   if (gameState === "START") {
    startScreen();
  } else if (gameState === "PLAY") {
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
  let targetPlayer = createVector(mouseX, mouseY);
  // Dessin du carré limite
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(bX, bY, bW, bH);

  // UI
  fill(255);
  textSize(32);
  textAlign(LEFT, TOP);
  text("Objectif: " + heartLives + " hits", 20, 20);
  
  if (heart) {
    heart.perceptionRadius = perceptionSlider.value();
    // heart.maxForce = heartForceSlider.value();
    // heart.maxSpeed = heartSpeedSlider.value();
  }

  // Votre vie
  text("Votre vie: ", 20, 50);
  for (let i = 0; i < playerLives; i++) {
    image(heartImg, 170 + i * 40, 50, 30, 30);
  }

  // Munitions
  text("Munitions: ", 20, 140);
  if (munition > 0) {
    text(munition, 200, 140);
  } else {
    fill(255, 0, 0);
    text("Recharge...", 200, 140);
    if (!isRecharging) {
      isRecharging = true;
      setTimeout(recharge, spearCooldown);
    }
  }



  // Lancer des lasers (toutes les 5 secondes)
  if (millis() - lastLaserTime > laserCooldown) {
    lastLaserTime = millis();
    launchLaser();
  }

  // Supression du lasers au bout de 10secondes
  if (millis() - lastLaserTime > 2000) {
    console.log("Laser removed");
    lasers.splice(0, lasers.length);
  }
  for (let i = lasers.length - 1; i >= 0; i--) {
    let l = lasers[i];

    if (l.pos.dist(targetPlayer) < l.r + 10) {
      playerLives--;
      damageGivenSound.play();

      lasers.splice(i, 1); // On retire le laser qui a touché
      continue;
    }
    for (let j = spears.length - 1; j >= 0; j--) {
      let s = spears[j];
      if (l.pos.dist(s.pos) < l.r + s.r) {
        lasers.splice(i, 1);
        spears.splice(j, 1);
        i--;
        break;
      }
    }
    
    l.maxForce = laserForceSlider.value();
    l.maxSpeed = laserSpeedSlider.value();
    
    l.applyBehaviors(targetPlayer, lasers);
    l.update();
    l.show();
    l.edges();
  }


  // Check Game State
  if (heartLives === 0) {
    gameState = "BREAKING";
    breakStartTime = millis();
    initHeartBreak(heart.pos.copy());
    heart = null; // Hide heart
    battleMusic.stop();
    heartBreak.play();
    return;
  }

  if (playerLives <= 0) {
    gameState = "LOSE";
    restartButton.show();
    return;
  }

  // Spears logic
  for (let i = spears.length - 1; i >= 0; i--) {
    let s = spears[i];
    
    s.maxForce = spearForceSlider.value();
    s.maxSpeed = spearSpeedSlider.value();
    
    s.update();
    s.show();

    let d = p5.Vector.dist(s.pos, heart.pos);
    if (d < s.r + heart.r_pourDessin) {
      damageGivenSound.play();
      heartLives--;
      heart.hitTime = millis();
      spears.splice(i, 1);
      break;
    }
  }
  // Heart logic
  heart.applyBehaviors(spears, bX, bY, bW, bH, boundaryMargin);
  heart.update();
  heart.show();

}
function initHeartBreak(pos) {
  heartBreak.play();
  // Create fragments
  for (let i = 0; i < 15; i++) {
    fragments.push(new Fragment(pos.x, pos.y));
  }
}

function launchLaser() {
  let targetPlayer = createVector(mouseX, mouseY);
  laserSound.play();
  let laser = new Laser(heart.pos.x, heart.pos.y, targetPlayer.x, targetPlayer.y);
  lasers.push(laser);
}

function breakingLoop() {
  for (let i = fragments.length - 1; i >= 0; i--) {
    fragments[i].update();
    fragments[i].show();
  }

  // Transition to Win Screen after 2 seconds
  if (millis() - breakStartTime > 2000) {
    gameState = "WIN";
    winSong.play();
    restartButton.show();
  }
}

function winScreen() {
  fill(0, 255, 0);
  textSize(64);
  textFont(font);
  textAlign(CENTER, CENTER);
  text("VOUS AVEZ GAGNÉ !", width / 2, height / 2);
}

function loseScreen() {
  fill(255, 0, 0);
  textSize(64);
  textFont(font);
  textAlign(CENTER, CENTER);
  battleMusic.stop();
  text("GAME OVER", width / 2, height / 2);
}

function startScreen() {
  fill(255);
  textSize(48);
  textFont(font);
  textAlign(CENTER, CENTER);
  text("CLIQUEZ POUR COMMENCER", width / 2, height / 2);
}

function mousePressed() {
  // On ignore le clic s'il vient de relancer le jeu (évite de tirer une spear en cliquant sur recommencer)
  if (millis() - lastResetTime < 200) return;

  if (gameState === "START") {
    gameState = "PLAY";
    startTime = millis();
    lastLaserTime = millis();
    battleMusic.loop();
    return; // Ne pas attaquer sur ce clic
  }

  let isOutside = mouseX < bX || mouseX > bX + bW || mouseY < bY || mouseY > bY + bH;
  if (gameState === "PLAY" && mouseButton === LEFT && munition > 0 && isOutside) {
    munition--;
    spearSound.play();
    let closestV = null;
    let minD = Infinity;
    let d = dist(mouseX, mouseY, heart.pos.x, heart.pos.y);
    if (d < minD) {
      minD = d;
      closestV = heart;
    }

    if (closestV) {
      spears.push(new Spear(mouseX, mouseY, closestV.pos.x, closestV.pos.y));
    }
  }
}

// Mode debug lorsqu'on clique sur d
function keyPressed() {
  if (key === 'd') {
    Heart.debug = !Heart.debug;
    Laser.debug = !Laser.debug;
    Spear.debug = !Spear.debug;
  }
}

function recharge() {
  munition = 10;
  isRecharging = false;
}


function createCustomSlider(label, min, max, val, step, posX, posY) {
  let slider = createSlider(min, max, val, step);

  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');
  
  // Adjusted horizontal spacing since labels can be wide
  slider.position(posX + 160, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 330, posY + 17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
  });

  return slider;
}