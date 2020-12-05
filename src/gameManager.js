/* Game Manager
    David Haas
    The game manager coordinates the interaction between game objects and the map.
*/

class GameManager {
    constructor() {
        this.clouds = null;

        this.initEntities();

        this.levelIndex = 0;
        this.levelStatus = null;
        this.endTime = null;

        this.numCharges = 2;
        this.playerSpawn = [0, 0];
    }

    // inits the game entities to empty variables
    initEntities() {
        this.walls = [];
        this.enemies = [];
        this.timelines = [];
        this.gates = [];
        this.bullets = [];

        this.activeIndex = 0;  // active timeline index
        this.usedCharges = 0;
    }

    // load a new level
    loadLevel() {
        // Loads the level specified by levelIndex
        this.initEntities();
        let tilemap = LEVELS[this.levelIndex];

        for (let i = 0; i < tilemap.length; i++) {
            for (let j = 0; j < tilemap[i].length; j++) {
                switch (tilemap[i][j]) {
                    case 'w':
                        this.walls.push(new Wall(j * TILE_SIZE, i * TILE_SIZE));
                        break;
                    case 'p':
                        this.playerSpawn = [j * TILE_SIZE, i * TILE_SIZE];
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
        this.clouds = new BackgroundClouds(tilemap[0].length * TILE_SIZE, tilemap.length * TILE_SIZE, 100);

        // set game to playing
        gameState = GameState.playing;
        this.levelStatus = LevelStatus.playing;
        this.endTime = null;
    }

    // level win routine
    levelWon() {
        if (this.levelStatus == LevelStatus.playing) {
            this.levelStatus = LevelStatus.won;
            this.endTime = secs();
        }
    }

    // level lose routine
    levelLost() {
        if (this.levelStatus == LevelStatus.playing) {
            sounds.levelLose.play();

            this.levelStatus = LevelStatus.lost;
            this.endTime = secs();
        }
    }

    // Returns the tile at the x,y coordinates in reference to the level
    whichTile(x, y) {

        let tilemap = LEVELS[this.levelIndex];
        return tilemap[floor(y / TILE_SIZE)][floor(x / TILE_SIZE)];
    }

    // determines if an entity is in the air or on ground
    isAirborne(entity) {
        let vbuffer = 2, hbuffer = 3;  // TODO: this fixes the wall launch bug, but it could introduce its own bugs

        let bottomY = entity.pos.y + entity.h + vbuffer;
        let x_bottomLeft = entity.pos.x + hbuffer;
        let x_bottomRight = entity.pos.x + entity.w - hbuffer;

        return this.whichTile(x_bottomLeft, bottomY) != "w" &&
            this.whichTile(x_bottomRight, bottomY) != "w";
    }

    // check if two entities collide
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

    // get the player's active timeline
    activeTimeline() {
        return this.timelines[this.activeIndex];
    }

    canBranch() {
        return this.timelines.length < this.numCharges && this.levelStatus == LevelStatus.playing;
    }

    newTimeline() {
        if (this.canBranch()) {
            this.timelines.push(new Player(this.playerSpawn[0], this.playerSpawn[1]));
            this.activeIndex++;
        }
    }

    gateReached() {
        this.activeTimeline().notify(GameEvent.TELEPORTING);
        if (this.activeIndex == 0)
            this.levelWon();
        else {
            this.activeIndex--;
            this.activeTimeline().notify(GameEvent.REACTIVATE);
        }
    }

    // create a new bullet, either for the player or enemy
    spawnBullet(x, y, v, isPlayer) {
        if (isPlayer) {
            sounds.playerShoot.play();
        } else {
            sounds.enemyShoot.play();
        }
        this.bullets.push(new Bullet(x, y, v, isPlayer));
    }

    // handle bullet movement and collision
    processBullets() {
        let toRemove = [];
        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i];
            bullet.process();

            // bullet wall collision
            let wallCollision = false;
            for (let j = 0; j < this.walls.length; j++) {
                let collision = this.collisionCheck(bullet, this.walls[j]);
                if (collision != null) {
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
                    toRemove.push(i);

                    // push back player
                    this.activeTimeline().acceleration.add(bullet.velocity.setMag(10));
                    this.levelLost();
                }
            } else {
                // bullet-enemy collision   (fired by player)
                for (let j = 0; j < this.enemies.length; j++) {
                    let collision = this.collisionCheck(bullet, this.enemies[j]);
                    if (collision != null) {
                        toRemove.push(i);

                        this.enemies.splice(j, 1);
                        sounds.enemyDie.play();

                        break;
                    }
                }
            }
        }

        // remove inactive bullets
        toRemove.forEach((removeIndex) => this.bullets.splice(removeIndex, 1));
    }

    // gets the screen/map's current drawing translation, so that the player is centered
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


    // draws background images
    drawBg() {
        // level bounds
        let max_x = LEVELS[this.levelIndex][0].length * TILE_SIZE;
        let max_y = LEVELS[this.levelIndex].length * TILE_SIZE;

        // sprite dimensions
        let backg_w = sprites.backg.width * 2.5;
        let backg_h = sprites.backg.height * 2.5;

        let skyline_w = sprites.skyline.width * 2
        let skyline_h = sprites.skyline.height * 2;

        let buildings_w = sprites.buildings.width
        let buildings_h = sprites.buildings.height;

        let trans = this.getTranslation();

        // draw skyline
        push();
        translate(trans.copy().mult(0.1));
        for (let i = 0; i < Math.ceil(max_x / backg_w); i++) {
            let img = i % 2 == 0 ? sprites.backg : sprites.backgAlt;
            image(img, i * backg_w, max_y - backg_h, backg_w, backg_h);
        }
        pop();

        push();
        translate(trans.copy().mult(0.1));
        for (let i = 0; i < Math.ceil(max_x / skyline_w); i++) {
            image(sprites.skyline, i * skyline_w, max_y - skyline_h, skyline_w, skyline_h);
        }
        pop();

        // draw building sprite in the middle of the map 
        push();
        translate(trans.mult(0.3));
        let cx = max_x / 2 - buildings_w / 2;
        image(sprites.buildings, cx, max_y - buildings_h, buildings_w, buildings_h);
        pop();


    }

    drawHUD() {
        let d = 16, weight = 3, spacing = 5;
        let y = SCREEN_Y - (spacing + d), x = 95;
        let mainColor = palette.charge2;

        push();
        ellipseMode(CORNER);

        // text
        fill(palette.charge2);
        textFont(fonts.glitch);
        textSize(16);
        text("Quanta:", 5, SCREEN_Y - 8);

        // charges
        for (let i = 0; i < this.numCharges - 1; i++) {
            noFill();
            stroke(palette.background2);
            strokeWeight(weight);
            circle(x + i * (spacing + weight + d), y, d);

            fill(0, 255, 192, 200);
            if (this.timelines.length + i < this.numCharges)
                circle(x + i * (spacing + weight + d), y, d);
        }
        pop();
    }

    // main draw loop
    draw() {
        background(palette.background2);

        this.drawBg();

        push();
        translate(this.getTranslation());

        this.clouds.draw();

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
            this.timelines.forEach((playerBranch, idx) => {
                if (idx <= this.activeIndex)  // don't draw timelines who've reached the end
                    playerBranch.draw();
            });
        }

        this.gates.forEach((gate, idx) => {
            gate.draw();
        });
        pop();

        this.drawHUD();

        // level win/lose dialogue
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


            if (this.levelStatus == LevelStatus.won) {
                text('Complete', 100, SCREEN_Y / 2 + 40);
            } else {
                text('Failed', 146, SCREEN_Y / 2 + 40);
            }
            pop();
        }
    }

    // main processing loop
    process() {
        // win/lose
        if (this.levelStatus != LevelStatus.playing && secs() > this.endTime + 2) {
            if (secs() > this.endTime + 5) {
                gameState = GameState.mainMenu;
                print("moving to menu");
            }
            return;
        }

        // only process enemies and bullets when game is active
        if (this.levelStatus == LevelStatus.playing) {
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
                    sounds.teleport.play();
                    this.gateReached();
                }
            });
        }



        // process player
        if (this.levelStatus == LevelStatus.playing || secs() < (this.endTime + 0.3)) {
            let airState = this.isAirborne(this.activeTimeline()) ?
                GameEvent.AIRBORNE : GameEvent.GROUNDED;
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
