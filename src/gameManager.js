/* Game Manager
    David Haas
    The game manager coordinates the interaction between game objects and the map.
*/

class GameManager {
    constructor() {
        this.background = null;

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

        // init backg clouds
        this.background = new BackgroundClouds(tilemap[0].length * TILE_SIZE, tilemap.length * TILE_SIZE);

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

    whichTile(x, y) {
        // Returns the tile at the x,y coordinates in reference to the level
        let tilemap = LEVELS[this.levelIndex];
        return tilemap[floor(y / TILE_SIZE)][floor(x / TILE_SIZE)];
    }

    isAirborne(entity, bufferLength = 0) {
        let bottomY = entity.pos.y + entity.h + bufferLength;
        let x_bottomLeft = entity.pos.x;
        let x_bottomRight = entity.pos.x + entity.w;

        return this.whichTile(x_bottomLeft, bottomY) === " " &&
            this.whichTile(x_bottomRight, bottomY) === " ";
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

    activeTimeline() {
        return this.timelines[this.timelines.length - 1]
    };

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
        background(palette.background);

        push();
        translate(this.getTranslation());

        this.background.draw();

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
            translate(20, 0);
            stroke(0, 0, 0, 127);
            strokeWeight(.5);
            fill(0, 0, 0, 169);
            rectMode(CORNERS);
            rect(90, SCREEN_Y / 2 - 45, SCREEN_X - 110, SCREEN_Y / 2 + 50)
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
        // win/lose
        if (this.levelStatus != LevelStatus.playing && secs() > this.endTime + 2) {
            if (secs() > this.endTime + 5) {
                gameState = GameState.mainMenu;
            }
            return;
        }

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

        if (this.levelStatus == LevelStatus.playing || secs() < (this.endTime + 0.3)) {
            let airState = this.isAirborne(this.activeTimeline()) ? 
                    PhysicsEvent.AIRBORNE : PhysicsEvent.GROUNDED;
            this.activeTimeline().notify(airState, null);
            this.activeTimeline().process();
        }

                // player-wall collision
                this.walls.forEach((wall) => {
                    let collision = this.collisionCheck(this.activeTimeline(), wall, true);
                    if (collision != null) {
                        this.activeTimeline().processCollision(collision);
                    }
                });
    }

    update() {
        this.process();
        this.draw();
    }


}
