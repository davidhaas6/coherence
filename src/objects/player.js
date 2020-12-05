/* Player
    David Haas
    Functions for the player character
*/

// animation state for the player
const PlayerState = {
    idle: 0,
    running: 1,
    shooting: 2,
    airborne: 3,
    branching: 4,
    reactivating: 5,
    teleporting: 6,
}

class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);

        this.w = 18;
        this.h = 30;

        // branching/quanta mechanics
        this.branchStart = -1;
        this.branchLength = 15;  // frames for animation to complete
        this.branchKeyReleased = true;

        // shooting 
        this.shootFlag = false;
        this.shootCooldown = 0.5 * TARGET_FPS;
        this.lastShot = -1;

        // movement
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);

        this.airborne = false;
        this.dropped = false; // dash down mid-air

        this.force = {
            jump: createVector(0, -10),
            drop: createVector(0, 6),
            moveRight: createVector(1.5, 0),
            moveLeft: createVector(-1.5, 0),
            gravity: createVector(0, 0.6),
            shoot: createVector(8, -2),

            dragFactor: 0.75,  // percent movement speed when mid air
            frictionFactor: -0.25, // how much player slides after moving
            collisionFactor: -0.1,
        }


        // animation and appearance
        this.anim = new AnimationState(PlayerState.idle);

        this.teleporting = false;
        this.branching = false;
        this.reactivating = false;

        this.curDirection = Dir.RIGHT;
    }

    // notify the player object of an event
    notify(event, data) {
        switch (event) {
            case GameEvent.GROUNDED: {
                if (this.dropped) {
                    sounds.playerThump.play();
                }
                this.airborne = false;
                this.dropped = false;
                break;
            }
            case GameEvent.AIRBORNE: {
                this.airborne = true;
                break;
            }
            case GameEvent.REACTIVATE: {
                this.anim.releaseFrame();
                this.reactivating = true;
                break;
            }
            case GameEvent.TELEPORTING: {
                this.teleporting = true;
                break;
            }

            default:
                print("UNKNOWN EVENT. event: " + event + " data: " + data);
                break;
        }
    }

    // centroid of the player's hitbox
    centroid() {
        return createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    }

    // main processing loop
    process() {
        let keyDown = this.processMovement();

        // shooting
        if (mouseIsPressed && (frameCount - this.lastShot) > this.shootCooldown && !this.shootFlag) {
            this.shootFlag = true;
            this.lastShot = frameCount;
            this.fireGun();
        } else if (!mouseIsPressed) {
            this.shootFlag = false;
        }

        // branch timelines
        this.processBranching();

        this.processAnimState(keyDown);

        if (this.airborne) {
            this.acceleration.add(this.force.gravity);
        }
        this.acceleration.add(this.force.frictionFactor * this.velocity.x, 0);


        this.velocity.add(this.acceleration);
        this.pos.add(this.velocity);
        this.acceleration.set(0, 0);
    }

    // handles movement and jumping
    processMovement() {
        var air_reduction = this.airborne ? this.force.dragFactor : 1;  // slow down player strafing mid-air
        let keyDown = false;

        if (!this.anim.playingOnehotAnimation()) {
            if (keyIsDown(65)) {
                this.acceleration.add(this.force.moveLeft.copy().mult(air_reduction));
                this.curDirection = Dir.LEFT;
                keyDown = true;
            }
            if (keyIsDown(68)) {
                this.acceleration.add(this.force.moveRight.copy().mult(air_reduction));
                this.curDirection = Dir.RIGHT;
                keyDown = true;
            }

            // Jumping
            if ((keyIsDown(32) || keyIsDown(87)) && !this.airborne) {
                this.acceleration.add(this.force.jump);
                this.airborne = true;
                sounds.playerJump.play();
            }

            else if (keyIsDown(83) && this.airborne && !this.dropped) {
                this.dropped = true;
                this.acceleration.add(this.force.drop);
                sounds.playerJump.play();
            }
        }

        return keyDown;
    }

    // handles collisions between the player and a block
    processCollision(collision) {
        if (collision == "left" || collision == "right") {
            this.velocity.x *= this.force.collisionFactor;
        } else if (collision == "bottom") {
            this.airborne = false;
            this.velocity.y = 0;
        } else if (collision == "top") {
            this.velocity.y *= this.force.collisionFactor;
        }
    }


    processBranching() {
        if (keyIsDown(81) && !this.branching) {
            // start branching
            if (game.canBranch()) {
                sounds.newTimeline.play();
                this.branching = true;
                this.branchStart = frameCount;
            } else {
                if (this.branchKeyReleased)
                    sounds.noQuanta.play();
            }

            this.branchKeyReleased = false;

        } else if (this.branching && (frameCount - this.branchStart) == this.branchLength) {
            // complete branching
            this.anim.holdFrame();
            game.newTimeline();
            this.branching = false;
        }

        if (!keyIsDown(81)) {
            this.branchKeyReleased = true;
        }
    }


    // routine when the player fires their weapon
    fireGun() {
        this.anim.setState(PlayerState.shooting);

        // knockback
        let knockback = this.force.shoot.copy();
        if (this.curDirection == Dir.RIGHT) knockback.x *= -1;
        this.acceleration.add(knockback);

        // spawn bullet
        let vel = this.curDirection == Dir.RIGHT ? createVector(9, 0) : createVector(-9, 0);
        game.spawnBullet(this.pos.x, this.pos.y + 18, vel, true);
    }

    // decides the player's animation state based on their current actions
    processAnimState(keyDown) {
        if (this.reactivating) {
            this.anim.setState(PlayerState.reactivating, true);
            this.reactivating = false;
        } else if (this.branching) {
            this.anim.setState(PlayerState.branching);
        } else if (this.teleporting) {
            this.anim.setState(PlayerState.teleporting, true);
        } else if (this.airborne) {
            this.anim.setState(PlayerState.airborne);
        } else if (keyDown) {
            this.anim.setState(PlayerState.running);
        } else {
            this.anim.setState(PlayerState.idle);
        }
    }

    // draw loop
    draw() {
        push();

        switch (this.curDirection) {
            case Dir.LEFT:
                translate(this.pos.x + this.w, this.pos.y);
                applyMatrix(-1, 0, 0, 1, 0, 0);
                break;
            case Dir.RIGHT:
                translate(this.pos);
                break;
        }

        this.anim.drawPlayer();

        pop();
    }
}


// Class to process the player's animations
class AnimationState {
    constructor(initialState) {
        this.state = initialState;
        this.startFrame = frameCount;

        this.nextState = null;
        this.hold = false;

        this.spritemap = sprites.player_map;
        this.spriteSize = 64;
        this.scale = 1.5;


        // Corresponds with PlayerState object
        this.frames = [
            [0],  // idle
            [1, 2, 3, 4, 5, 6],  // running
            [9, 10, 11, 12, 13],  // shooting
            [21],  // airborne
            [27, 28, 29, 30, 31, 32, 33, 34],  // branching
            [34, 33, 32, 31, 30, 29, 28, 27], // reactivating
            [7, 8]
        ]

        // how many frames each animation step is shown for, corrseponds with PlayerState object
        this.frameLength = [
            1,
            2,
            2,
            1,
            2,
            2,
            1,
        ]
    }

    playingOnehotAnimation() {
        return this.state == PlayerState.shooting ||
            this.state == PlayerState.branching ||
            this.state == PlayerState.reactivating;
    }

    // sets the players animation state
    setState(playerState, force = false) {
        if (this.playingOnehotAnimation() && !force) {
            this.nextState = playerState;
        } else if (playerState != this.state) {
            this.state = playerState;
            this.startFrame = frameCount;
        }
    }

    holdFrame() {
        this.hold = frameCount;
    }

    releaseFrame() {
        this.hold = false;
    }

    // determines and draws the current frame players animation
    drawPlayer() {
        let gameFrame = this.hold ? this.hold : frameCount;

        /* determine which animation frame to play */
        let animationFrames = this.frames[this.state];
        let animFrameNumber = Math.floor((gameFrame - this.startFrame) / this.frameLength[this.state]);  // the monotonously increasing animation frame number

        // for one-hot animations, move on to the next queued animation after completion
        if (this.playingOnehotAnimation() && animFrameNumber > animationFrames.length) {
            this.state = this.nextState;
            this.startFrame = frameCount;
            animationFrames = this.frames[this.state];
            animFrameNumber = Math.floor((frameCount - this.startFrame) / this.frameLength[this.state]);
        }

        let currentFrame = animationFrames[animFrameNumber % animationFrames.length];  // the grid index of the current animation frame


        /* draw the animation */
        // the location of the frame within the spritemap 
        let src = {
            x: (currentFrame % 6) * this.spriteSize,
            y: Math.floor(currentFrame / 6) * this.spriteSize,
        }

        // where to draw the frame on the canvas
        let dst = {
            x: -14,
            y: -57,
        }

        if (this.state == PlayerState.airborne) {
            // shift up the drawing region for the airborne frame
            // this is needed b/c the spritemap draws the jumping sprite higher than other frames
            dst.y = 0;
        }

        push();
        image(this.spritemap,
            dst.x, dst.y, this.spriteSize * this.scale, this.spriteSize * this.scale,
            src.x, src.y, this.spriteSize, this.spriteSize);

        pop();
    }
}