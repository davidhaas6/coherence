/* Blocks
    David Haas
    Functions for various block objects in the game
*/

// a basic wall
class Wall {
    constructor(x, y) {
        this.pos = createVector(x, y);

        this.w = TILE_SIZE;
        this.h = TILE_SIZE;
        this.sprite = random(sprites.walls);
    }

    notify(event, data) {

    }

    centroid() {
        return createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    }

    draw() {
        push();
        translate(this.pos);
        image(this.sprite, 0, 0, this.w, this.h);
        pop();
    }
}

// the gate, the player enters this to win
class Gate {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.w = TILE_SIZE;
        this.h = TILE_SIZE;
        this.center = createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);

        this.particles = new ChargeGroup(0, true, 5, 0.75);
        this.core = new Charge(this.center.x, this.center.y, null, false, false, null, 15, 20000);
    }

    notify(event, data) {

    }

    centroid() {
        return createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    }

    draw() {
        this.particles.draw();
        this.core.draw();
    }

    process() {
        this.particles.add(this.center.x, this.center.y);
        this.particles.process();
    }
}

