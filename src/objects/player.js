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
    dying: 4,
}

class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);

        this.w = 18;
        this.h = 30;


        this.airborne = false;
        this.dropped = false; // dash down mid-air

        this.shootFlag = false;
        this.shootCooldown = 0.5 * TARGET_FPS;
        this.lastShot = -1;


        this.force = {
            jump: createVector(0, -10),
            drop: createVector(0, 6),
            moveRight: createVector(1.5, 0),
            moveLeft: createVector(-1.5, 0),
            gravity: createVector(0, 0.6),
            shoot: createVector(8,-2),

            dragFactor: 0.75,  // percent movement speed when mid air
            frictionFactor: -0.25, // how much player slides after moving
            collisionFactor: -0.1,
        }

        this.curDirection = Dir.RIGHT;

        this.anim = new AnimationState(PlayerState.idle);
    }

    // notify the player object of an event
    notify(event, data) {
        if (event == PhysicsEvent.GROUNDED) {
            if(this.dropped) {
                sounds.playerThump.play(); 
            }
            this.airborne = false;
            this.dropped = false;
        } else if (event == PhysicsEvent.AIRBORNE) {
            this.airborne = true;
        }
    }

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
        if (keyIsDown(81)) {
            this.branchTimeline();
        }

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

        else if(keyIsDown(83) && this.airborne && !this.dropped) {
            print("dropped!");
            this.dropped = true;
            this.acceleration.add(this.force.drop);
            sounds.playerJump.play();
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

    // routine to branch the player into a new timeline
    branchTimeline() {
        // TODO
        this.anim.setState(PlayerState.dying);
        sounds.newTimeline.play();
    }

    // routine when the player fires their weapon
    fireGun() {
        this.anim.setState(PlayerState.shooting);

        // knockback
        let knockback = this.force.shoot.copy();
        if(this.curDirection == Dir.RIGHT) knockback.x *= -1;
        this.acceleration.add(knockback);

        // spawn bullet
        let vel = this.curDirection == Dir.RIGHT ? createVector(9, 0) : createVector(-9, 0);
        game.spawnBullet(this.pos.x, this.pos.y + 18, vel, true);
    }

    // decides the player's animation state based on their current actions
    processAnimState(keyDown) {
        if (this.airborne) {
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

        this.spritemap = sprites.player_map;
        this.spriteSize = 64;
        this.scale = 1.5;

        // Corresponds with PlayerState object
        this.frames = [
            [0],  // idle
            [1, 2, 3, 4, 5, 6],  // running
            [9, 10, 11, 12, 13],  // shooting
            [21],  // airborne
            [27, 28, 29, 30, 31, 32, 33, 34],  // dying
        ]

        // how many frames each animation step is shown for, corrseponds with PlayerState object
        this.frameLength = [
            1,
            2,
            2,
            1,
            2,
        ]
    }

    // sets the players animation state
    setState(playerState) {
        if (this.state == PlayerState.shooting || this.state == PlayerState.dying) {
            this.nextState = playerState;
        } else if (playerState != this.state) {
            this.state = playerState;
            this.startFrame = frameCount;
        }
    }

    // determines and draws the current frame players animation
    drawPlayer() {

        /* determine which animation frame to play */
        let animationFrames = this.frames[this.state];
        let animFrameNumber = Math.floor((frameCount - this.startFrame) / this.frameLength[this.state]);  // the monotonously increasing animation frame number

        // for one-hot animations, move on to the next queued animation after completion
        if ((this.state == PlayerState.shooting || this.state == PlayerState.dying) && animFrameNumber > animationFrames.length) {
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