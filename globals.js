// David Haas
// Values and functions used throughout the project

const TILE_SIZE = 32;

const SCREEN_X = 512;
const SCREEN_Y = 512;

const TARGET_FPS = 30;

var globalSynth;
var palette;
var fonts;
var sprites;



function secs() {
    return millis() / 1000;
}

// class BoundingBox {
//     constructor(x1, y1, x2, y2) {
//         this.x1 = x1;
//         this.y1 = y1;
//         this.x2 = x2;
//         this.y2 = y2;
//     }

//     collides(bbox2) {
//         let collision_vec = [0, 0, 0, 0]; // left right up down

//         let left_of_the_other = this.x1 > bbox2.x2 || bbox2.x1 > this.x2;
//         let above_the_other = this.y1 > bbox2.y2 || bbox2.y1 > this.y2;

//         if (!left_of_the_other && !above_the_other) {
//             collision_vec[COLLISION.LEFT] = this.x1 <= bbox2.x2;
//             collision_vec[COLLISION.RIGHT] = bbox2.x1 <= this.x2;
//             collision_vec[COLLISION.UP] = this.y1 <= bbox2.y2;
//             collision_vec[COLLISION.DOWN] = bbox2.y1 <= this.y2;
//         }


//         return collision_vec;
//     }

//     draw() {
//         noFill();
//         strokeWeight(2);
//         stroke(200, 20, 0, 127);
//         rect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);

//         strokeWeight(1);
//         stroke(0);
//     }
// }





const level1 = [
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "w                               ",
    "w                               ",
    "w                               ",
    "w                               ",
    "w                               ",
    "w               w               ",
    "w               w               ",
    "w               w               ",
    " wwww   w       w               ",
    "ww  ww       wwww               ",
    "w    ww     wwwww               ",
    "w p        wwwwww               ",
    "w        wwwwwwww               ",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
]

const LEVELS = [level1];


