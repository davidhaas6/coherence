// David Haas
// Final Checkpoint 2
// p5.js

/* Creative efforts
 - Intro has particle effects
 - Particle effects carry sound
 - Custom fonts
 - Button animation and sounds
 - Particle effects on main screen
*/

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
    glitch: loadFont('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/glitch.otf'),
  };

  sprites = {
    player: loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/player.png'),
    enemy: loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/enemy1.png'),
    wall1:
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
  this.gameState = GameState.mainMenu; // TODO: Change to splashScreen

  intro = new Intro();
  mainMenu = new MainMenu();
  instructions = new Instructions();
  settings = new Settings();
}

class GameManager {
  constructor() {
    this.walls = [];
    this.enemies = [];
    this.timelines = [];

    this.levelIndex = 0;
  }

  loadTilemap(tilemap) {
    for (let i = 0; i < tilemap.length; i++) {
      for (let j = 0; j < tilemap[i].length; j++) {
        switch (tilemap[i][j]) {
          case 'w':
            walls.push(new Wall(j * TILE_SIZE, i * TILE_SIZE));
            break;
          case 'p':
            player = new Player(j * TILE_SIZE, i * TILE_SIZE);
            break;
          case 'e':
            enemies.push(new Enemy(j * TILE_SIZE, i * TILE_SIZE));
            break;
        }
      }
    }
  }

  update() {

  }


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