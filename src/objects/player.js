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
        this.shootFlag = false;

        this.force = {
            jump: createVector(0, -10),
            moveRight: createVector(1.5, 0),
            moveLeft: createVector(-1.5, 0),
            gravity: createVector(0, 0.6),

            shootFactor: 0.1,
            dragFactor: 0.75,  // percent movement speed when mid air
            frictionFactor: -0.25, // how much player slides after moving
            collisionFactor: -0.1,
        }

        this.curDirection = Dir.RIGHT;

        this.anim = new AnimationState(PlayerState.idle);
    }

    notify(event, data) {
        if (event == PhysicsEvent.GROUNDED) {
            this.airborne = false;
        } else if (event == PhysicsEvent.AIRBORNE) {
            this.airborne = true;
        }
    }

    centroid() {
        return createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    }



    process() {
        let keyDown = this.processMovement();

        // shooting
        if (mouseIsPressed && !this.shootFlag) {
            this.shootFlag = true;
            this.fireGun();
        } else if (!mouseIsPressed) {
            this.shootFlag = false;
        }

        // timeline
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
        }

        return keyDown;
    }

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

    branchTimeline() {
        // TODO
        this.anim.setState(PlayerState.dying);
    }

    fireGun() {
        this.anim.setState(PlayerState.shooting);
        // this.velocity.x *= this.force.shootFactor;

        let vel = this.curDirection == Dir.RIGHT ? createVector(9, 0) : createVector(-9, 0);
        game.spawnBullet(this.pos.x, this.pos.y + 18, vel, true);
    }

    processAnimState(keyDown) {
        if (this.airborne) {
            this.anim.setState(PlayerState.airborne);
        } else if (keyDown) {
            this.anim.setState(PlayerState.running);
        } else {
            this.anim.setState(PlayerState.idle);
        }
    }

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
        noStroke();

        // noFill();
        // stroke(255, 0, 0);
        // strokeWeight(2);
        // rect(0, 0, this.w, this.h);

        this.anim.drawPlayer();


        pop();

        // Draw hand
        // if (gameState == GameState.playing) {
        //     push();
        //     translate(this.pos);
        //     fill(227, 220, 237);
        //     strokeWeight(0);
        //     let handLoc = this.getHandLocation();
        //     circle(handLoc.x, handLoc.y, 8);
        //     pop();
        // }
    }

    getHandLocation() {
        let mouseLoc = createVector(mouseX, mouseY).sub(game.getTranslation()).sub(this.centroid());
        if (mouseLoc.mag() > 30)
            mouseLoc.setMag(30);

        mouseLoc.add(this.w / 2, this.h / 2);
        return mouseLoc;
    }
}


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


    setState(playerState) {
        if (this.state == PlayerState.shooting || this.state == PlayerState.dying) {
            this.nextState = playerState;
            print("setting next state to " + playerState);
        } else if (playerState != this.state) {
            this.state = playerState;
            this.startFrame = frameCount;
        }
    }

    drawPlayer() {

        // determine which animation frame to play
        let animationFrames = this.frames[this.state];
        let animFrameNumber = Math.floor((frameCount - this.startFrame) / this.frameLength[this.state]);  // the non-circular (monotonous increasing) animation frame #
        if ((this.state == PlayerState.shooting || this.state == PlayerState.dying) && animFrameNumber > animationFrames.length) {
            this.state = this.nextState;
            this.startFrame = frameCount;
            animationFrames = this.frames[this.state];
            animFrameNumber = Math.floor((frameCount - this.startFrame) / this.frameLength[this.state]);
        }
        let currentFrame = animationFrames[animFrameNumber % animationFrames.length];  // the grid index of the current animation frame


        // draw the animation
        let src = { // the location of the frame within the spritemap 
            x: (currentFrame % 6) * this.spriteSize,
            y: Math.floor(currentFrame / 6) * this.spriteSize,
        }

        let dst = { // where to draw the frame on the canvas
            x: -14,
            y: -57,
        }

        if (this.state == PlayerState.airborne) {
            dst.y = 0;
        }

        push();
        image(this.spritemap,
            dst.x, dst.y, this.spriteSize * this.scale, this.spriteSize * this.scale,
            src.x, src.y, this.spriteSize, this.spriteSize);

        // noFill();
        // stroke(0, 255, 0);
        // strokeWeight(2);
        // rect(0, 0, this.spriteSize, this.spriteSize);

        pop();
    }
}