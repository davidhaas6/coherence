// David Haas
// Final Checkpoint 1
// p5.js

/* Creative efforts
 - Intro has particle effects
 - Particle effects carry sound
 - Custom fonts
 - Button animation and sounds
 - Particle effects on main screen
*/

const TILE_SIZE = 32;
const SCREEN_X = 512;
const SCREEN_Y = 512;

const TARGET_FPS = 30;

const GameState = {
  splashScreen: 0,
  mainMenu: 1,
  settingsMenu: 2,
  instructionsMenu: 3,
}

var palette;
let fonts;
let sprites;
let globalSynth;

// Game objects
var gameState;
let intro;

function preload() {
  fonts = {
    glitch: loadFont('assets/glitch.otf'),
  };

  sprites = {
    player: loadImage('assets/player.png'),
    enemy: loadImage('assets/enemy1.png'),
  };
}

function setup() {
  createCanvas(SCREEN_X, SCREEN_Y);
  frameRate(TARGET_FPS);

  palette = {
    background: color(32, 20, 41),
    charge1: color(0, 191, 255),
    charge2: color(0, 255, 192),
  }

  globalSynth = new p5.MonoSynth();

  // Init game logic
  this.gameState = GameState.splashScreen; // TODO: Change to splashScreen

  intro = new Intro();
  mainMenu = new MainMenu();
  instructions = new Instructions();
  settings = new Settings();
}


class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.width = 32;
    this.height = 64;
  }

  process() {

  }

  draw() {
    push();
    translate(this.pos);
    image(sprites.player, 0, 0);
    pop();
  }
}

class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.width = 32;
    this.height = 64;
  }

  process() {

  }

  draw() {
    push();
    translate(this.pos);
    image(sprites.enemy, 0, 0);
    pop();
  }
}

class Charge {
  constructor(x, y, initAccel = createVector(0, 0), noisyMovement = false, audio = true, volume = 0.01, diameter = 5) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = initAccel;
    this.diameter = max(3, randomGaussian(diameter, 1))

    this.color = lerpColor(palette.charge1, palette.charge2, random());
    this.numTriangles = max(3, randomGaussian(5, 2));
    this.zappiness = 0.2;

    this.lifeSpan = randomGaussian(4, 1) * TARGET_FPS;
    this.riseFrames = this.diameter / 75 * TARGET_FPS;
    this.spawnFrame = frameCount;

    this.damping = 0.988;

    this.noise = {
      x: random(1000),
      y: random(1000),
      step: 0.01,
      maxVal: 0.05,
      fillX: random(1000),
      fillY: random(1000),
      fillStep: 0.02,
    }


    this.audioEnabled = audio;
    if (this.audioEnabled) {
      this.volume = volume;
      this.freq = randomGaussian(100, 10);
      this.synth = new p5.Oscillator('sawtooth');
      this.synth.freq(this.freq);
      this.synth.amp(0);
      this.synth.start();
    }
  }

  process() {
    // Random movment
    if (this.noisyMovement) {
      var noiseVal = map(noise(this.noise.x += this.noise.step, this.noise.y += this.noise.step), 0, 1, -this.noise.maxVal, this.noise.maxVal);
      this.acceleration.add(noiseVal, noiseVal);
    }

    // Process movement
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    // Dampen momentum
    this.acceleration.set(0, 0);
    this.velocity.mult(this.damping);

    this.lifeSpan -= 1;

    if (this.audioEnabled) {
      this.processAudio();
    }
  }

  processAudio() {
    var risePercent = min(1, (frameCount - this.spawnFrame) / this.riseFrames);
    this.synth.amp(this.volume * risePercent);
    this.synth.freq(this.freq + 20 * noise(this.noise.fillX, this.noise.fillY));
    this.synth.pan(map(this.position.x, 0, SCREEN_X, -1, 1));
  }

  isDone() {
    return this.lifeSpan <= 0;
  }

  close() {
    if (this.audioEnabled)
      this.synth.stop();
  }

  draw() {
    push();
    translate(this.position.x, this.position.y);

    // calculate random noise
    var noiseVal = map(noise(this.noise.fillX += this.noise.fillStep, this.noise.fillY += this.noise.fillStep), 0, 1, 50, 255);
    var noiseColor = color(this.color._getRed(), this.color._getGreen(), this.color._getBlue(), noiseVal);

    fill(noiseColor);
    stroke(noiseColor);
    strokeWeight(this.diameter / 15);

    // Draw bubble border
    var d = this.diameter;
    if ((frameCount - this.spawnFrame) < this.riseFrames) {
      var pct = (frameCount - this.spawnFrame) / this.riseFrames;
      d *= pct;
    }

    // circle(0, 0, d);

    var r = d / 2;
    for (var i = 0; i < this.numTriangles; i++) {
      var v1 = p5.Vector.random2D().setMag(r * randomGaussian(1, this.zappiness));
      var v2 = p5.Vector.random2D().setMag(r * randomGaussian(1, this.zappiness));
      var v3 = p5.Vector.random2D().setMag(r * randomGaussian(1, this.zappiness));

      triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
    }


    pop();
  }
}

class ChargeGroup {
  constructor(maxAudible = 100, noisy = false, diameter = 5) {
    this.charges = [];
    this.noisyMovement = noisy;
    this.maxAudible = maxAudible; // max # of charges to paly audio
    this.diameter = diameter;
  }

  add(x, y, dir = p5.Vector.random2D()) {
    this.charges.push(new Charge(x, y, dir, this.noisyMovement, this.charges.length < this.maxAudible, 0.01 * 100 / this.maxAudible, this.diameter));
  }

  process() {
    this.charges.forEach((charge, i) => {
      charge.process();
      if (charge.isDone()) {
        charge.close();
        this.charges.splice(i, 1);
      }
    });
  }

  draw() {
    this.charges.forEach((charge) => {
      charge.draw();
    });
  }

  close() {
    this.charges.forEach((charge) => {
      charge.close();
    });
    this.charges = [];
  }
}

class Level {
  constructor() {

  }
}

function secs() {
  return millis() / 1000;
}

class Intro {
  constructor() {
    this.x = 18;
    this.y = 272;
    this.size = 70;
    this.text = 'Coherence'
    this.color = palette.charge2;
    this.font = fonts.glitch;
    this.startTime = null;
    this.fadeOutTime = 6;
    this.lifeTime = 10;

    this.points = this.font.textToPoints(this.text, this.x, this.y, this.size, {
      sampleFactor: .2,
      simplifyThreshold: 0
    });
    this.drawnPoints = [];

    this.charges = new ChargeGroup(this.points.length * 0.7);

  }

  activeSecs() {
    if (this.startTime == null) return 0;
    return secs() - this.startTime;
  }

  update() {
    if (this.startTime == null) {
      this.startTime = secs();
    }
    let opacity, subOpacity;
    if (this.activeSecs() < this.fadeOutTime) { // Fade in
      opacity = min(-40 + (3 * this.activeSecs()) ** 2, 255);
      subOpacity = min(-1500 + (2 * this.activeSecs()) ** 3, 255);
    } else { // Fade out
      opacity = max(255 - (this.activeSecs() - this.fadeOutTime) ** 4, 0);
      subOpacity = opacity;
    }
    let fadeColor = color(this.color._getRed(), this.color._getGreen(), this.color._getBlue(), opacity);

    push();
    // shearX(PI / 2);
    textFont(this.font);
    textSize(this.size);
    fill(fadeColor);
    text(this.text, this.x, this.y);

    textSize(20);
    fill(color(this.color._getRed(), this.color._getGreen(), this.color._getBlue(), subOpacity));
    text("Haas Studios", 180, 300);

    pop();

    this.updateCharges();
  }

  isDone() {
    return this.activeSecs() > this.lifeTime;
  }

  updateCharges() {
    if (this.activeSecs() < 5) {
      this.points.forEach((p) => {
        if (random() < 0.03 && !this.drawnPoints.includes(p)) {
          this.drawnPoints.push(p);
          this.charges.add(p.x, p.y, p5.Vector.random2D().setMag(.01));
        }
      });
    }
    this.charges.process();
    this.charges.draw();
  }

  close() {
    this.charges.close();
  }
}

class Button {
  constructor(x, y, w, h, text, onClick = () => { }, color = palette.charge2, color2 = palette.charge1) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.secondaryColor = color2;

    this.text = text;
    this.font = fonts.glitch;
    this.fontSize = 20;
    this.textRect = this.font.textBounds(this.text, 0, 0, this.fontSize);

    this.onClick = onClick;
    this.hover = false;
  }

  process() {
    if (this.inBounds(mouseX, mouseY)) {
      if (this.hover === false) {
        globalSynth.play('G2', 0.1, 0, 0.1);
      }
      this.hover = true;
    } else {
      this.hover = false;
    }
  }

  inBounds(x, y) {
    return this.x <= x && x < (this.x + this.w) && this.y <= y && y < (this.y + this.h);
  }

  draw() {
    push();
    fill(this.hover ? this.secondaryColor : this.color);
    noStroke();
    rect(this.x, this.y, this.w, this.h);

    textFont(this.font);
    textSize(this.fontSize);
    fill(palette.background);
    text(this.text, this.x + this.w / 2 - this.textRect.w / 2, this.y + this.h / 2 + this.textRect.h / 2);


    textSize(20);
    pop();
  }

  clickEvent(clickX, clickY) {
    if (this.inBounds(clickX, clickY)) {
      globalSynth.play('C3', 0.2, 0, 0.1);
      this.onClick();
    }
  }
}

class MainMenu {
  constructor() {
    // Title
    this.title = {
      size: 60,
      text: 'Coherence',
      color: palette.charge2,
      font: fonts.glitch,
      x: 50,
      y: 128
    }

    this.initButtons();

    this.charges = new ChargeGroup(0, true, 8);

    this.player = new Player(240,432);
    this.enemy = new Enemy(64,400);
    this.enemy2 = new Enemy(416,400);
  }

  initButtons() {
    let leftX = 128;
    let topY = this.title.y + 64;
    let width = 256;
    let height = 50;
    let spacing = 32;

    let playClicked = () => { print("Play button clicked -- not implemented") };
    let instructionsClicked = () => { gameState = GameState.instructionsMenu };
    let settingsClicked = () => { gameState = GameState.settingsMenu };

    this.playButton = new Button(leftX, topY, width, height, "Play", playClicked);
    this.instructionsButton = new Button(leftX, topY + height * 1 + spacing, width, height, "Instructions", instructionsClicked);
    this.settingsButton = new Button(leftX, topY + height * 2 + spacing * 2, width, height, "Settings", settingsClicked);
  }

  update() {
    this.player.process();
    this.player.draw();
    this.enemy.process();
    this.enemy.draw();
    this.enemy2.process();
    this.enemy2.draw();

    this.updateCharges();

    push();
    // Title
    textFont(this.title.font);
    textSize(this.title.size);
    fill(this.title.color);
    text(this.title.text, this.title.x, this.title.y);

    // Buttons
    this.playButton.process();
    this.instructionsButton.process();
    this.settingsButton.process();
    this.playButton.draw();
    this.instructionsButton.draw();
    this.settingsButton.draw();

    pop();
  }

  updateCharges() {
    var num = random();
    if (num < 0.25) {
      this.charges.add(random(0, SCREEN_X), SCREEN_Y, createVector(randomGaussian(0, .1), -1).setMag(randomGaussian(3, 1)));
    } else if (num < 0.5) {
      this.charges.add(random(0, SCREEN_X), 1, createVector(randomGaussian(0, .1), 1).setMag(randomGaussian(3, 1)));
    }
    this.charges.process();
    this.charges.draw();
  }

  onClick(event) {
    this.playButton.clickEvent(event.clientX, event.clientY);
    this.instructionsButton.clickEvent(event.clientX, event.clientY);
    this.settingsButton.clickEvent(event.clientX, event.clientY);
  }
}


class Instructions {
  constructor() {
    this.backButton = new Button(355, 460, 128, 32, "<-- Back", () => { gameState = GameState.mainMenu });
  }

  update() {
    this.backButton.draw();
    this.backButton.process();

    push();
    textFont(fonts.glitch);
    textSize(60);
    fill(palette.charge2);
    text('Instructions', 20, 60);
    pop();
  }
  onClick(event) {
    this.backButton.clickEvent(event.clientX, event.clientY);
  }
}

class Settings {
  constructor() {
    this.backButton = new Button(355, 460, 128, 32, "<-- Back", () => { gameState = GameState.mainMenu });
  }

  update() {
    this.backButton.draw();
    this.backButton.process();

    push();
    textFont(fonts.glitch);
    textSize(60);
    fill(palette.charge2);
    text('Settings', 90, 60);
    pop();
  }
  onClick(event) {
    this.backButton.clickEvent(event.clientX, event.clientY);
  }
}


function drawGrid() {
  // Draws the bounding box of the inputted game object
  push();
  strokeWeight(2);
  noFill();
  stroke(255, 255, 255, 10);
  for (let i = 0; i < 1000 / TILE_SIZE; i++) {
    for (let j = 0; j < 1000 / TILE_SIZE; j++) {
      rect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
  pop();
}


function draw() {
  background(palette.background);

  if (gameState == GameState.splashScreen) {
    if (!intro.isDone()) {
      intro.update();
    } else {
      intro.close();
      gameState = GameState.mainMenu;
    }
  }

  else if (gameState == GameState.mainMenu) {
    mainMenu.update();
  } else if (gameState == GameState.instructionsMenu) {
    instructions.update();
  } else if (gameState == GameState.settingsMenu) {
    settings.update();
  }

  // rect(256,256,32,64);
}

function mouseClicked(event) {
  userStartAudio();
  if (gameState == GameState.splashScreen) {
    intro.close();
    gameState = GameState.mainMenu;
  } else if (gameState == GameState.mainMenu) {
    mainMenu.onClick(event);
  } else if (gameState == GameState.instructionsMenu) {
    instructions.onClick(event);
  } else if (gameState == GameState.settingsMenu) {
    settings.onClick(event);
  }
}