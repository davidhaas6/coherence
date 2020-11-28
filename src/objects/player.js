class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);

        this.w = 28;
        this.h = 28;

        this.airborne = false;
        this.jumpFlag = false;

        this.force = {
            jump: createVector(0, -8),
            moveRight: createVector(1.5, 0),
            moveLeft: createVector(-1.5, 0),
            gravity: createVector(0, 0.4),

            dragFactor: -0.2,
            collisionFactor: -0.1,
        }

        this.curDirection = Dir.RIGHT;
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
        this.processMovement();

        // if (this.airborne) {
        //TODO: Find a way to know when the player has nothing below them
        // this is a quick-fix that produces collisions on every step

        //TODO: if tile below player is empty
        if (this.airborne) {
            this.acceleration.add(this.force.gravity);
        } 
        // }

        // drag
        this.acceleration.add(this.force.dragFactor * this.velocity.x, 0);

        this.velocity.add(this.acceleration);
        this.pos.add(this.velocity);
        this.acceleration.set(0, 0);
    }

    processMovement() {
        if (keyIsDown(65)) {
            this.acceleration.add(this.force.moveLeft);
            this.curDirection = Dir.LEFT;
        }
        if (keyIsDown(68)) {
            this.acceleration.add(this.force.moveRight);
            this.curDirection = Dir.RIGHT;
        }

        // Jumping
        if ((keyIsDown(32) || keyIsDown(87)) && !this.airborne) {
            this.acceleration.add(this.force.jump);
            this.airborne = true;
        }
    }

    processCollision(collision) {
        print(collision);
        if (collision == "left" || collision == "right") {
            this.velocity.x *= this.force.collisionFactor;
        } else if (collision == "bottom") {
            this.airborne = false;
            this.velocity.y = 0;
        } else if (collision == "top") {
            this.velocity.y *= this.force.collisionFactor;
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

        // image(sprites.player, 0, 0);
        fill(230, 237, 220);
        rect(0, 0, this.w, this.h);
        pop();

        // Draw hand
        if (gameState == GameState.playing) {
            push();
            translate(this.pos);
            fill(227, 220, 237);
            strokeWeight(0);
            let handLoc = this.getHandLocation();
            circle(handLoc.x, handLoc.y, 8);
            pop();
        }
    }

    getHandLocation() {
        let mouseLoc = createVector(mouseX, mouseY).sub(game.getTranslation()).sub(this.centroid());
        if (mouseLoc.mag() > 30)
            mouseLoc.setMag(30);

        mouseLoc.add(this.w / 2, this.h / 2);
        return mouseLoc;
    }


}