
var Dir = {
    LEFT: 0,
    RIGHT: 1,
}

class Player {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(0, 0);

        this.width = 32;
        this.height = 64;

        this.jumpHeight = 32; // pixels
        this.airborne = false;
        this.jumpFlag = false;

        this.force = {
            jump: createVector(0, -6),
            moveRight: createVector(1, 0),
            moveLeft: createVector(-1, 0),
            gravity: createVector(0, 0.2),

            dragFactor: -0.2,
        }

        this.curDirection = Dir.RIGHT;
    }

    process() {
        this.processMovement();

        // gravity
        if (this.airborne) {
            this.acceleration.add(this.force.gravity);
        }

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
        if ( (keyIsDown(32) || keyIsDown(87)) && !this.airborne) {
            this.acceleration.add(this.force.jump);
            this.airborne = true;
        }
    }

    draw() {
        push();
        switch (this.curDirection) {
            case Dir.LEFT:
                translate(this.pos.x + this.width, this.pos.y);
                applyMatrix(-1, 0, 0, 1, 0, 0);
                break;
            case Dir.RIGHT:
                translate(this.pos);
                break;
        }

        image(sprites.player, 0, 0);

        fill(63, 81, 181);
        stroke(0);
        circle(this.width + 10, 32, 8);
        circle(this.width, 35, 8);
        pop();
    }
}

class Enemy {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.width = 32;
        this.height = 64;
    }

    process() {

    }

    draw() {
        push();
        translate(this.pos);
        image(sprites.enemy, 0, 0);
        pop();
    }
}

class Wall {

}

