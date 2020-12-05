
class Bullet {
    constructor(x, y, velocity, playerBullet) {
        this.pos = createVector(x, y);
        this.w = 10;
        this.h = 2;
        this.velocity = velocity;

        this.playerBullet = playerBullet;
        if (!playerBullet) {
            // enemy bullet
            this.charge = new Charge(x, y, null, false, false, 0, 8, 100000);
            this.charge.riseFrames = 0.25 * TARGET_FPS;
            this.charge.color = palette.sentryPointer;
            this.charge.numTriangles = 8;
        }
    }

    centroid() {
        return createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    }

    process() {
        this.pos.add(this.velocity);

        if (!this.playerBullet) {
            this.charge.position = this.pos;
        }
    }

    draw() {
        push();


        if (this.playerBullet) {
            translate(this.pos);
            fill(palette.bullet);
            noStroke();
            rect(0, 0, this.w, this.h);
        } else {
            // enemy bullet
            fill(255, 0, 0);
            this.charge.draw();
            // circle(0,0,10);

        }

        pop();
    }
} 
