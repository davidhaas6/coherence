class Enemy {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.w = 32;
        this.h = 64;

        this.curDirection = Dir.RIGHT;
    }

    process() {

    }

    centroid() {
        return createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
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

        image(sprites.enemy, 0, 0);
        pop();
    }


}