class Enemy {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.w = 32;
        this.h = 32;

        this.body = new Charge(this.w / 2, this.h / 2, null, false, false, 0, 16, 100000)
        this.body.color = palette.background;
        this.body.numTriangles = 20;
        this.body.zappiness = .1;

        this.arm = new Charge(x, y, null, false, false, 0, 6, 100000);
        this.arm.color = palette.sentryPointer;
        this.arm.numTriangles = 8;

        this.attackCooldown = 1;
        this.lastAttack = -1;
        this.attackDist = 300;
    }

    notify(event, data) {

    }

    process() {
        // hover
        this.pos.y += sin(frameCount / 15) / 10;

        // attack
        let toPlayer = game.activeTimeline().centroid().sub(this.centroid());
        if (toPlayer.mag() < this.attackDist && (secs() - this.lastAttack) > this.attackCooldown) {
            let vel = toPlayer.setMag(10);
            let c = this.centroid();
            game.spawnBullet(c.x, c.y, vel, false);
            this.lastAttack = secs();
        }
    }

    centroid() {
        return createVector(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    }


    draw() {
        let radius = 10;

        // point the triangle at the player
        if (game.activeTimeline() != null) {
            let toPlayer = game.activeTimeline().centroid().sub(this.centroid());
            if (toPlayer.mag() > 25)
                toPlayer.setMag(radius + this.arm.diameter / 2);
            toPlayer.add(this.w / 2, this.h / 2);

            this.arm.position = toPlayer;
        }

        push();
        translate(this.pos);

        fill(200, 200, 200);
        ellipseMode(CENTER);
        // circle(this.w / 2, this.h / 2, radius * 2);
        this.body.draw();

        this.arm.draw();

        // bounding box
        // stroke(255, 0, 0, 100);
        // noFill();
        // rect(0, 0, this.w, this.h);

        pop();
    }


}