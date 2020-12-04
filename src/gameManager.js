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
        this.bullets = [];


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

    isAirborne(entity) {
        let vbuffer = 5, hbuffer = 3;  // TODO: this fixes the wall launch bug, but it could introduce its own bugs

        let bottomY = entity.pos.y + entity.h + vbuffer;
        let x_bottomLeft = entity.pos.x + hbuffer;
        let x_bottomRight = entity.pos.x + entity.w - hbuffer;

        return this.whichTile(x_bottomLeft, bottomY) != "w" &&
            this.whichTile(x_bottomRight, bottomY) != "w";
    }

    collisionCheck(entity1, entity2, adjust = false) {
        // Distance between the centroids of the two entities
        var collisionVector = entity1.centroid().sub(entity2.centroid());
        var absCollisionVec = createVector(abs(collisionVector.x), abs(collisionVector.y));

        // Threshold distance between centroids for collision
        var collisionThresh = createVector(entity1.w / 2 + entity2.w / 2, entity1.h / 2 + entity2.h / 2);

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
                entity1.pos.add(adjustment);
            }
        }
        return collisionDirection;
    }

    activeTimeline() {
        return this.timelines[this.timelines.length - 1]
    }

    spawnBullet(x, y, v, isPlayer) {
        this.bullets.push(new Bullet(x, y, v, isPlayer));
    }

    processBullets() {
        let toRemove = [];
        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i];
            bullet.process();

            // bullet wall
            let wallCollision = false;
            for (let j = 0; j < this.walls.length; j++) {
                let collision = this.collisionCheck(bullet, this.walls[j]);
                if (collision != null) {
                    print("wall collision!! " + collision);
                    toRemove.push(i);
                    wallCollision = true;
                    break;
                }
            }
            if (wallCollision) continue;


            if (!bullet.playerBullet) {
                // bullet-player collision   (fired by enemy)
                let collision = this.collisionCheck(bullet, this.activeTimeline());
                if (collision != null) {
                    print("player collision!! " + collision);
                    toRemove.push(i);
                    // TODO: kill player
                }
            } else {
                // bullet-enemy  (fired by player)
                for (let j = 0; j < this.enemies.length; j++) {
                    let collision = this.collisionCheck(bullet, this.enemies[j]);
                    if (collision != null) {
                        print("enemy collision!! " + collision);
                        toRemove.push(i);
                        this.enemies.splice(i, 1);
                        break;
                    }
                }
            }
        }

        toRemove.forEach((removeIndex) => this.bullets.splice(removeIndex, 1));  // remove inactive bullets
    }

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
        background(palette.background2);
        // this.drawBacktiles();
        push();
        translate(this.getTranslation());

        this.background.draw();

        this.walls.forEach((wall, idx) => {
            wall.draw();
        });

        this.bullets.forEach((bullet, idx) => {
            bullet.draw();
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

        this.processBullets();

        // process enemies
        this.enemies.forEach((enemy, idx) => {
            enemy.process();
        });

        // process gates
        this.gates.forEach((gate, idx) => {
            gate.process();
            let collision = this.collisionCheck(this.activeTimeline(), gate);
            if (collision) {
                this.levelWon();
            }
        });

        // process player
        if (this.levelStatus == LevelStatus.playing || secs() < (this.endTime + 0.3)) {
            let airState = this.isAirborne(this.activeTimeline()) ?
                PhysicsEvent.AIRBORNE : PhysicsEvent.GROUNDED;
            this.activeTimeline().notify(airState, null);

            this.activeTimeline().process();
        }


        // wall collisions
        this.walls.forEach((wall) => {
            // player-wall
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
