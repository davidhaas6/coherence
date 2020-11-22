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



const level1 = [
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "wwwww                    wwwwwwww",
    "ww                        wwwwwww",
    "w                          wwwwww",
    "w   w       w   w w w        wwww",
    "w        w ww ww              www",
    "ww            w                 w",
    "w w           ww        www     w",
    "w    w         wwwww             ",
    " wwww   w ww       www          x",
    "ww  ww      w         ww   wwwwww",
    "w               www    w   wwwwww",
    "w p            www          wwwww",
    "w            ww              wwww",
    "wwwwwwwwww                    www",
    "ww  ww  www       wwwwww        w",
    "w         wwwwwwwwww   wwwwwwwwww",
]

const LEVELS = [level1];


