/* Main (p5.js)
	David Haas
	Contains p5.js callback functions -- including those that control overall program flow
*/

var remoteDir = 'https://raw.githubusercontent.com/davidhaas6/coherence/main/';

function preload() {
	// fonts used in the game
	fonts = {
		glitch: loadFont(remoteDir + 'assets/glitch.otf'),
	};

	// images used in the game
	sprites = {
		player_map: loadImage(remoteDir + 'assets/player_sprite.png'),
		walls: [
			loadImage(remoteDir + 'assets/wall1.png'),
			loadImage(remoteDir + 'assets/wall2.png'),
			loadImage(remoteDir + 'assets/wall3.png'),
			loadImage(remoteDir + 'assets/wall4.png'),
		],

		buildings: loadImage(remoteDir + 'assets/near-buildings-bg.png'),
		skyline: loadImage(remoteDir + 'assets/buildings-bg.png'),
		backg: loadImage(remoteDir + 'assets/skyline-a.png'),
		backgAlt: loadImage(remoteDir + 'assets/skyline-a.png')
	};

	// sounds used in the game
	sounds = {
		levelLose: loadSound(remoteDir + 'assets/audio/level_lose.wav'),
		teleport: loadSound(remoteDir + 'assets/audio/teleport.wav'),

		playerShoot: loadSound(remoteDir + 'assets/audio/pew.wav'),
		playerJump: loadSound(remoteDir + 'assets/audio/jump.wav'),
		playerThump: loadSound(remoteDir + 'assets/audio/thump.wav'),
		newTimeline: loadSound(remoteDir + 'assets/audio/quantum.wav'),
		noQuanta: loadSound(remoteDir + 'assets/audio/click.wav'),

		enemyDie: loadSound(remoteDir + 'assets/audio/explode.wav'),
		enemyShoot: loadSound(remoteDir + 'assets/audio/zap.wav'),
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

		sentry: color(32, 20, 41),
		sentryPointer: color(	255, 106, 106),

		bullet: color(182, 124, 124),
	}

	globalSynth = new p5.MonoSynth();

	// Init game logic
	this.gameState = GameState.splashScreen; // TODO: Change to splashScreen
	game = new GameManager();

	// menus
	intro = new Intro();
	mainMenu = new MainMenu();
	instructions = new Instructions();
	settings = new Settings();
	levelSelect = new LevelSelect();
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

		case GameState.levelSelect: {
			levelSelect.update();
			break;
		}

		case GameState.playing: {
			game.update();
			drawFPS();
			break;
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
	} else if (gameState == GameState.levelSelect) {
		levelSelect.onClick(event);
	}
}

function keyPressed() {
	if(keyCode == ESCAPE) {
		gameState = GameState.mainMenu;
	}
}