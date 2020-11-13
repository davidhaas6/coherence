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
	playing: 4,
}



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


class GameManager {
	constructor() {
		this.walls = [];
		this.enemies = [];
		this.timelines = [];

		this.levelIndex = 0;
	}

	loadLevel() {
		// Loads the level specified by levelIndex
		this.walls = [];
		this.enemies = [];
		this.timelines = [];
		let tilemap = LEVELS[this.levelIndex];

		for (let i = 0; i < tilemap.length; i++) {
			for (let j = 0; j < tilemap[i].length; j++) {
				switch (tilemap[i][j]) {
					case 'w':
						this.walls.push(new Wall(j * TILE_SIZE, i * TILE_SIZE));
						break;
					case 'p':
						this.timelines.push(new Player(j * TILE_SIZE, i * TILE_SIZE));
						break;
					case 'e':
						this.enemies.push(new Enemy(j * TILE_SIZE, i * TILE_SIZE));
						break;
				}
			}
		}

		// set game to playing
		gameState = GameState.playing;
	}

	collisionCheck(player, wall) {
		var xVector = (player.pos.x + (player.w / 2)) - (wall.pos.x + (wall.w / 2));
		var yVector = (player.pos.y + (player.h / 2)) - (wall.pos.y + (wall.h / 2));
		// print(xVector, yVector);
		// var collisionVector = player.centroid() - wall.centroid();
		//TODO: Vectorize x/yVector and halfWidth/height

		var halfWidths = (player.w / 2) + (wall.w / 2);
		var halfHeights = (player.h / 2) + (wall.h / 2);

		var collisionDirection = null;

		if (Math.abs(xVector) < halfWidths && Math.abs(yVector) < halfHeights) {
			var x_offset = halfWidths - Math.abs(xVector);
			var y_offset = halfHeights - Math.abs(yVector);
			if (x_offset < y_offset) {
				if (xVector > 0) {
					collisionDirection = "left";
					player.pos.x += x_offset;
				}
				else {
					collisionDirection = "right";
					 player.pos.x -= x_offset;
				}
			}
			else {
				if (yVector > 0) {
					collisionDirection = "top"; 
					player.pos.y += y_offset;
				}
				else {
					collisionDirection = "bottom"; 
					player.pos.y -= y_offset;
				}
			}
		}
		return collisionDirection;
	}

	activeTimeline() { return this.timelines[this.timelines.length - 1] };

	draw() {
		push();
		translate(SCREEN_X/2 - this.activeTimeline().centroid().x, SCREEN_Y/2 - this.activeTimeline().centroid().y,)
		this.walls.forEach((wall, idx) => {
			wall.draw();
		});

		this.enemies.forEach((enemy, idx) => {
			enemy.draw();
		});

		this.activeTimeline().draw();

		pop();
	}

	process() {
		// print(this.activeTimeline().pos);
		this.walls.forEach((wall) => {
			let collision = this.collisionCheck(this.activeTimeline(), wall);
			if (collision != null) {
				this.activeTimeline().processCollision(collision);
			}
		});


		this.enemies.forEach((enemy, idx) => {
			enemy.draw();
		});



		this.activeTimeline().process();

	}

	update() {
		this.process();
		this.draw();
	}
}





function draw() {
	background(palette.background);



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