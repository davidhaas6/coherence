/* Main (p5.js)
	David Haas
	Contains p5.js callback functions -- including those that control overall program flow
*/


function preload() {
	fonts = {
		glitch: loadFont('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/glitch.otf'),
	};

	sprites = {
		player: loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/player.png'),
		enemy: loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/enemy1.png'),
		walls: [
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall1.png'),
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall2.png'),
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall3.png'),
			loadImage('https://raw.githubusercontent.com/davidhaas6/coherence/main/assets/wall4.png'),
		],

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
	game = new GameManager();

	// menus
	intro = new Intro();
	mainMenu = new MainMenu();
	instructions = new Instructions();
	settings = new Settings();

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