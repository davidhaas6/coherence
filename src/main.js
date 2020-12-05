/* Main (p5.js)
	David Haas
	Contains p5.js callback functions -- including those that control overall program flow
*/


function preload() {
	// fonts used in the game
	fonts = {
		glitch: loadFont('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/glitch.otf'),
	};

	// images used in the game
	sprites = {
		player_map: loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/player_sprite.png'),
		enemy: loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/enemy1.png'),
		walls: [
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall1.png'),
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall2.png'),
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall3.png'),
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall4.png'),
		],
		buildings: loadImage('assets/near-buildings-bg.png'),
		skyline: loadImage('assets/buildings-bg.png'),
		backg: loadImage('assets/skyline-a.png')
	};

	// sounds used in the game
	sounds = {
		levelLose: loadSound('assets/audio/level_lose.wav'),

		playerShoot: loadSound('assets/audio/pew.wav'),
		playerJump: loadSound('assets/audio/jump.wav'),
		playerThump: loadSound('assets/audio/thump.wav'),
		newTimeline: loadSound('assets/audio/quantum.wav'),

		enemyDie: loadSound('assets/audio/explode.wav'),
		enemyShoot: loadSound('assets/audio/zap.wav'),
	}
}


function setup() {
	createCanvas(SCREEN_X, SCREEN_Y);
	frameRate(TARGET_FPS);

	palette = {
		background: color(32, 20, 41),
		// background2: color(114, 85, 55),
		background2: color(0, 0, 60),
		charge1: color(0, 191, 255),
		charge2: color(0, 255, 192),

		sentry: color(205, 92, 92),
		sentryPointer: color(255, 0, 0),

		bullet: color(182, 124, 124),
	}

	globalSynth = new p5.MonoSynth();

	// Init game logic
	this.gameState = GameState.mainMenu; // TODO: Change to splashScreen
	game = new GameManager();

	// menus
	intro = new Intro();
	mainMenu = new MainMenu();
	instructions = new Instructions();
	settings = new Settings();

}

function drawFPS() {
	fill(0, 255, 0, 200);
	let size = 12;
	textSize(size);
	text(round(frameRate()), SCREEN_X - size * 1.25, size * 0.9);
}


function draw() {

	switch (gameState) {
		case GameState.splashScreen: {
			if (!intro.isDone()) {
				intro.update();
			} else {
				intro.close();
				gameState = GameState.mainMenu;
			}
			break;
		}

		case GameState.mainMenu: {
			mainMenu.update();
			break;
		}

		case GameState.instructionsMenu: {
			instructions.update();
			break;
		}

		case GameState.settingsMenu: {
			settings.update();
			break;
		}

		case GameState.playing: {
			game.update();
			drawFPS();
		}

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