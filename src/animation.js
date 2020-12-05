// David Haas
// Animation elements used in coherence

class Charge {
    constructor(x, y, initAccel, noisyMovement = false, audio = true, volume = 0.01, diameter = 5, lifeSpan) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = initAccel ?? createVector(0, 0);
        this.diameter = max(3, randomGaussian(diameter, 1))

        this.color = lerpColor(palette.charge1, palette.charge2, random());
        this.numTriangles = max(3, randomGaussian(5, 2));
        this.zappiness = 0.2;

        this.lifeSpan = (lifeSpan ?? randomGaussian(4, 1)) * TARGET_FPS;
        // print(this.lifeSpan);
        this.riseFrames = this.diameter / 75 * TARGET_FPS;
        this.spawnFrame = frameCount;

        this.damping = 0.988;

        this.noise = {
            x: random(1000),
            y: random(1000),
            step: 0.01,
            maxVal: 0.05,
            fillX: random(1000),
            fillY: random(1000),
            fillStep: 0.02,
        }


        this.audioEnabled = audio;
        if (this.audioEnabled) {
            this.volume = volume;
            this.freq = randomGaussian(100, 10);
            this.synth = new p5.Oscillator('sawtooth');
            this.synth.freq(this.freq);
            this.synth.amp(0);
            this.synth.start();
        }
    }

    process() {
        // Random movment
        if (this.noisyMovement) {
            var noiseVal = map(noise(this.noise.x += this.noise.step, this.noise.y += this.noise.step), 0, 1, -this.noise.maxVal, this.noise.maxVal);
            this.acceleration.add(noiseVal, noiseVal);
        }

        // Process movement
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);

        // Dampen momentum
        this.acceleration.set(0, 0);
        this.velocity.mult(this.damping);

        this.lifeSpan -= 1;

        if (this.audioEnabled) {
            this.processAudio();
        }
    }

    processAudio() {
        var risePercent = min(1, (frameCount - this.spawnFrame) / this.riseFrames);
        this.synth.amp(this.volume * risePercent);
        this.synth.freq(this.freq + 20 * noise(this.noise.fillX, this.noise.fillY));
        this.synth.pan(map(this.position.x, 0, SCREEN_X, -1, 1));
    }

    isDone() {
        return this.lifeSpan <= 0;
    }

    close() {
        if (this.audioEnabled)
            this.synth.stop();
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        // calculate random noise
        var noiseVal = map(noise(this.noise.fillX += this.noise.fillStep, this.noise.fillY += this.noise.fillStep), 0, 1, 50, 255);
        var noiseColor = color(this.color._getRed(), this.color._getGreen(), this.color._getBlue(), noiseVal);

        fill(noiseColor);
        stroke(noiseColor);
        strokeWeight(this.diameter / 15);

        // Draw bubble border
        var d = this.diameter;
        if ((frameCount - this.spawnFrame) < this.riseFrames) {
            var pct = (frameCount - this.spawnFrame) / this.riseFrames;
            d *= pct;
        }

        // circle(0, 0, d);

        var r = d / 2;
        for (var i = 0; i < this.numTriangles; i++) {
            var v1 = p5.Vector.random2D().setMag(r * randomGaussian(1, this.zappiness));
            var v2 = p5.Vector.random2D().setMag(r * randomGaussian(1, this.zappiness));
            var v3 = p5.Vector.random2D().setMag(r * randomGaussian(1, this.zappiness));

            triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
        }


        pop();
    }
}

// a set of charges
class ChargeGroup {
    constructor(maxAudible = 100, noisy = false, diameter = 5, lifeSpan) {
        this.charges = [];
        this.noisyMovement = noisy;
        this.maxAudible = maxAudible; // max # of charges to paly audio
        this.diameter = diameter;
        this.lifeSpan = lifeSpan
    }

    // add a charge
    add(x, y, dir = p5.Vector.random2D()) {
        this.charges.push(new Charge(x, y, dir, this.noisyMovement, this.charges.length < this.maxAudible, 0.01 * 100 / this.maxAudible, this.diameter, this.lifeSpan));
    }

    process() {
        this.charges.forEach((charge, i) => {
            charge.process();
            if (charge.isDone()) {
                charge.close();
                this.charges.splice(i, 1);
            }
        });
    }

    draw() {
        this.charges.forEach((charge) => {
            charge.draw();
        });
    }

    close() {
        this.charges.forEach((charge) => {
            charge.close();
        });
        this.charges = [];
    }
}



// animated background clouds
class BackgroundClouds {
    constructor(xMax, yMax, opacity=100, speed=0.01) {
        this.backgSeed = random(1500);
        this.xMax = xMax;
        this.yMax = yMax;
        this.opacity = opacity;
        this.noiseSpeed = speed;
    }

    draw() {
        const squareSize = 16;
        const stepX = 0.1, stepY = 0.1;
        var noiseX = this.backgSeed, noiseY = 0;

        var lightness = 0;

        push();
        noStroke();
        for (let i = 0; i < this.xMax; i += squareSize) {
            noiseY = 0;
            for (let j = 0; j < this.yMax; j += squareSize) {
                var noiseVal = map(noise(noiseX, noiseY), 0, 1, 0, 255 - lightness);
                let cloudVal = lightness + noiseVal;
                fill(cloudVal, cloudVal, cloudVal, this.opacity);
                rect(i, j, squareSize, squareSize);

                noiseY += stepY;
            }
            noiseX += stepX;
        }
        this.backgSeed -= this.noiseSpeed;

        pop();
    }
}
