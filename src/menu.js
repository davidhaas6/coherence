// David Haas
// Menu elements used in coherence

class Intro {
    constructor() {
        this.x = 18;
        this.y = 272;
        this.size = 70;
        this.text = 'Coherence'
        this.color = palette.charge2;
        this.font = fonts.glitch;
        this.startTime = null;
        this.fadeOutTime = 6;
        this.lifeTime = 10;

        this.points = this.font.textToPoints(this.text, this.x, this.y, this.size, {
            sampleFactor: .2,
            simplifyThreshold: 0
        });
        this.drawnPoints = [];

        this.charges = new ChargeGroup(this.points.length * 0.7);

    }

    activeSecs() {
        if (this.startTime == null) return 0;
        return secs() - this.startTime;
    }

    update() {
        if (this.startTime == null) {
            this.startTime = secs();
        }
        let opacity, subOpacity;
        if (this.activeSecs() < this.fadeOutTime) { // Fade in
            opacity = min(-40 + (3 * this.activeSecs()) ** 2, 255);
            subOpacity = min(-1500 + (2 * this.activeSecs()) ** 3, 255);
        } else { // Fade out
            opacity = max(255 - (this.activeSecs() - this.fadeOutTime) ** 4, 0);
            subOpacity = opacity;
        }
        let fadeColor = color(this.color._getRed(), this.color._getGreen(), this.color._getBlue(), opacity);

        push();
        background(palette.background);

        // shearX(PI / 2);
        textFont(this.font);
        textSize(this.size);
        fill(fadeColor);
        text(this.text, this.x, this.y);

        textSize(20);
        fill(color(this.color._getRed(), this.color._getGreen(), this.color._getBlue(), subOpacity));
        text("Haas Studios", 180, 300);

        pop();

        this.updateCharges();
    }

    isDone() {
        return this.activeSecs() > this.lifeTime;
    }

    updateCharges() {
        if (this.activeSecs() < 5) {
            this.points.forEach((p) => {
                if (random() < 0.03 && !this.drawnPoints.includes(p)) {
                    this.drawnPoints.push(p);
                    this.charges.add(p.x, p.y, p5.Vector.random2D().setMag(.01));
                }
            });
        }
        this.charges.process();
        this.charges.draw();
    }

    close() {
        this.charges.close();
    }
}

// a button
class Button {
    constructor(x, y, w, h, text, onClick = () => { }, color = palette.charge2, color2 = palette.charge1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.secondaryColor = color2;

        this.text = text;
        this.font = fonts.glitch;
        this.fontSize = 20;
        this.textRect = this.font.textBounds(this.text, 0, 0, this.fontSize);

        this.onClick = onClick;
        this.hover = false;
    }

    process() {
        if (this.inBounds(mouseX, mouseY)) {
            if (this.hover === false) {
                globalSynth.play('G2', 0.1, 0, 0.1);
            }
            this.hover = true;
        } else {
            this.hover = false;
        }
    }

    inBounds(x, y) {
        return this.x <= x && x < (this.x + this.w) && this.y <= y && y < (this.y + this.h);
    }

    draw() {
        push();
        fill(this.hover ? this.secondaryColor : this.color);
        noStroke();
        rect(this.x, this.y, this.w, this.h);

        textFont(this.font);
        textSize(this.fontSize);
        fill(palette.background);
        text(this.text, this.x + this.w / 2 - this.textRect.w / 2, this.y + this.h / 2 + this.textRect.h / 2);


        textSize(20);
        pop();
    }

    clickEvent(clickX, clickY) {
        if (this.inBounds(clickX, clickY)) {
            globalSynth.play('C3', 0.2, 0, 0.1);
            this.onClick();
        }
    }
}

class MainMenu {
    constructor() {
        // Title
        this.title = {
            size: 60,
            text: 'Coherence',
            color: palette.charge2,
            font: fonts.glitch,
            x: 50,
            y: 128
        }

        this.initButtons();

        this.charges = new ChargeGroup(0, true, 8);

        this.player = new Player(240, 150);
        // this.player.pos.y = this.playButton.y - this.player.h;
        this.playerAnim = {
            step: 2,
            shootStart: -1,
            shootFrames: 10,
            shootCooldown: 30,
            isRunning: true,
        }

        this.clouds = new BackgroundClouds(SCREEN_X, SCREEN_Y, 40, 0.05);
    }

    // loads buttons
    initButtons() {
        let leftX = 128;
        let topY = this.title.y + 64;
        let width = 256;
        let height = 50;
        let spacing = 32;

        let playClicked = () => { game.loadLevel() };
        let instructionsClicked = () => { gameState = GameState.instructionsMenu };
        let settingsClicked = () => { gameState = GameState.settingsMenu };

        this.playButton = new Button(leftX, topY, width, height, "Play", playClicked);
        this.instructionsButton = new Button(leftX, topY + height * 1 + spacing, width, height, "Instructions", instructionsClicked);
        this.settingsButton = new Button(leftX, topY + height * 2 + spacing * 2, width, height, "Settings", settingsClicked);
    }

    // main processing loop
    update() {
        background(palette.background);
        this.updateCharges();

        push();

        this.clouds.draw();

        // Title
        textFont(this.title.font);
        textSize(this.title.size);
        fill(this.title.color);
        text(this.title.text, this.title.x, this.title.y);

        // Buttons
        this.playButton.process();
        this.instructionsButton.process();
        this.settingsButton.process();
        this.playButton.draw();
        this.instructionsButton.draw();
        this.settingsButton.draw();

        // player
        this.updatePlayer();

        pop();
    }

    // animate the player running around and shooting
    updatePlayer() {
        this.player.draw();

        if(random() < 0.02 && frameCount > this.playerAnim.shootStart + this.playerAnim.shootCooldown) {
            // this.playerAnim.isRunning = false;
            this.player.anim.setState(PlayerState.shooting);
            this.playerAnim.shootStart = frameCount;

        }

        let shootingOver = (frameCount - this.playerAnim.shootStart) > this.playerAnim.shootFrames;

        if (shootingOver) {
            this.player.anim.setState(PlayerState.running);

            // switch directions
            let overRight = (this.player.pos.x + this.player.w)  > this.playButton.x + this.playButton.w + 70;
            let overLeft = this.player.pos.x < this.playButton.x - 70;
            if(overRight || overLeft || random() < 0.003) {
                
                this.playerAnim.step *= -1;
                this.player.curDirection = this.player.curDirection == Dir.LEFT ? Dir.RIGHT : Dir.LEFT;
            }

            // move
            this.player.pos.x += this.playerAnim.step;
        }
    }

    // processes charges
    updateCharges() {
        var num = random();
        if (num < 0.25) {
            this.charges.add(random(0, SCREEN_X), SCREEN_Y, createVector(randomGaussian(0, .1), -1).setMag(randomGaussian(3, 1)));
        } else if (num < 0.5) {
            this.charges.add(random(0, SCREEN_X), 1, createVector(randomGaussian(0, .1), 1).setMag(randomGaussian(3, 1)));
        }
        this.charges.process();
        this.charges.draw();
    }

    // button click routing
    onClick(event) {
        this.playButton.clickEvent(event.clientX, event.clientY);
        this.instructionsButton.clickEvent(event.clientX, event.clientY);
        this.settingsButton.clickEvent(event.clientX, event.clientY);
    }
}


class Instructions {
    constructor() {
        this.backButton = new Button(355, 460, 128, 32, "<-- Back", () => { gameState = GameState.mainMenu });
    }

    update() {
        background(palette.background);

        this.backButton.draw();
        this.backButton.process();

        push();
        textFont(fonts.glitch);
        fill(palette.charge2);

        textSize(60);
        text('Instructions', 20, 60);
        
        stroke(palette.charge2);
        strokeWeight(2);
        line(20,80,SCREEN_X-20, 80);
        
        strokeWeight(1);
        textSize(20);
        // textFont('Helvetica');
        text('Press A or D to move left or right.', 20, 110);
        text('Press space or W to jump.', 20, 140);
        text('Reach the teleporter to win.', 20, 170);
        pop();
    }
    onClick(event) {
        this.backButton.clickEvent(event.clientX, event.clientY);
    }
}

class Settings {
    constructor() {
        this.backButton = new Button(355, 460, 128, 32, "<-- Back", () => { gameState = GameState.mainMenu });
    }

    update() {
        background(palette.background);

        this.backButton.draw();
        this.backButton.process();

        push();
        textFont(fonts.glitch);
        textSize(60);
        fill(palette.charge2);
        text('Settings', 90, 60);
        pop();
    }
    
    onClick(event) {
        this.backButton.clickEvent(event.clientX, event.clientY);
    }
}