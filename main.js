// David Haas
// Final Checkpoint 2
// p5.js


const GameState = {
	splashScreen: 0,
	mainMenu: 1,
	settingsMenu: 2,
	instructionsMenu: 3,
	playing: 4,
}

const LevelStatus = {
	playing: 0,
	lost: 1,
	won: 2
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
	this.gameState = GameState.splashScreen; // TODO: Change to splashScreen
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
		this.gates = [];

		this.levelIndex = 0;
		this.levelStatus = null;
		this.endTime = null;
	}

	loadLevel() {
		// Loads the level specified by levelIndex
		this.walls = [];
		this.enemies = [];
		this.gates = [];
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
					case 'x':
						this.gates.push(new Gate(j * TILE_SIZE, i * TILE_SIZE));
				}
			}
		}

		// set game to playing
		gameState = GameState.playing;
		this.levelStatus = LevelStatus.playing;
		this.endTime = null;
	}

	levelWon() {
		if (this.levelStatus == LevelStatus.playing) {
			this.levelStatus = LevelStatus.won;
			this.endTime = secs();
		}
	}

	collisionCheck(player, wall, adjust = false) {
		// Distance between the centroids of the player and wall
		var collisionVector = player.centroid().sub(wall.centroid());
		var absCollisionVec = createVector(abs(collisionVector.x), abs(collisionVector.y));

		// Threshold distance between centroids for collision
		var collisionThresh = createVector(player.w / 2 + wall.w / 2, player.h / 2 + wall.h / 2);

		var collisionDirection = null;
		if (absCollisionVec.x < collisionThresh.x && absCollisionVec.y < collisionThresh.y) {
			var offset = collisionThresh.sub(absCollisionVec);
			var adjustment = createVector(0, 0);

			if (offset.x < offset.y) {
				if (collisionVector.x > 0) {
					collisionDirection = "left";
					adjustment.x = offset.x;
				}
				else {
					collisionDirection = "right";
					adjustment.x = -offset.x;
				}
			}
			else {
				if (collisionVector.y > 0) {
					collisionDirection = "top";
					adjustment.y = offset.y;
				}
				else {
					collisionDirection = "bottom";
					adjustment.y = -offset.y;
				}
			}

			if (adjust) {
				player.pos.add(adjustment);
			}
		}
		return collisionDirection;
	}

	activeTimeline() { return this.timelines[this.timelines.length - 1] };

	getTranslation() {
		var playerLoc = this.activeTimeline().centroid();
		var center = createVector(SCREEN_X / 2, SCREEN_Y / 2);
		var max_x = LEVELS[this.levelIndex][0].length * TILE_SIZE;
		var max_y = LEVELS[this.levelIndex].length * TILE_SIZE;

		let trans = center.copy().sub(playerLoc);
		if ((playerLoc.x + center.x) > max_x) {
			trans.x = SCREEN_X - max_x;
		} else if (playerLoc.x - center.x < 0) {
			trans.x = 0;
		}
		if (playerLoc.y + center.y > max_y) {
			trans.y = SCREEN_Y - max_y;
		} else if (playerLoc.y - center.y < 0) {
			trans.y = 0;
		}


		return trans;
	}

	draw() {
		push();
		translate(this.getTranslation());

		this.walls.forEach((wall, idx) => {
			wall.draw();
		});

		this.enemies.forEach((enemy, idx) => {
			enemy.draw();
		});

		if (this.levelStatus == LevelStatus.playing || secs() < (this.endTime + 1)) {
			this.activeTimeline().draw();
		}

		this.gates.forEach((gate, idx) => {
			gate.draw();
		});
		pop();


		if (this.levelStatus != LevelStatus.playing && secs() > (this.endTime + 1)) {
			push();
			translate(20,0);
			stroke(0,0,0,127);
			strokeWeight(.5);
			fill(0,0,0,169);
			rectMode(CORNERS);
			rect(90, SCREEN_Y/2 - 45, SCREEN_X-110, SCREEN_Y / 2 + 50)
			textSize(50);
			textFont(fonts.glitch);
			fill(palette.charge2);
			text('Level', 155, SCREEN_Y / 2);

			let outcome = this.levelStatus == LevelStatus.won ? 'Complete' : ' Failed '
			text(outcome, 100, SCREEN_Y / 2 + 40);
			pop();
		}
	}

	process() {
		if (this.levelStatus != LevelStatus.playing && secs() > this.endTime + 2) {
			if(secs() > this.endTime + 5) {
				gameState = GameState.mainMenu;
			}
			return;
		}

		this.walls.forEach((wall) => {
			let collision = this.collisionCheck(this.activeTimeline(), wall, true);
			if (collision != null) {
				this.activeTimeline().processCollision(collision);
			}
		});

		this.enemies.forEach((enemy, idx) => {
			enemy.process();
		});

		this.gates.forEach((gate, idx) => {
			gate.process();
			let collision = this.collisionCheck(this.activeTimeline(), gate);
			if (collision) {
				this.levelWon();
			}
		});

		if (this.levelStatus == LevelStatus.playing || secs() < (this.endTime + 0.3)) 
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