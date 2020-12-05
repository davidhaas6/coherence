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


const GameState = {
	splashScreen: 0,
	mainMenu: 1,
	settingsMenu: 2,
    instructionsMenu: 3,
    levelSelect: 4,
	playing: 5,
}

const LevelStatus = {
	playing: 0,
	lost: 1,
	won: 2
}

var GameEvent = {
    AIRBORNE: 0,
    GROUNDED: 1,
    REACTIVATE: 2,
    TELEPORTING: 3,
};


// Game objects
var gameState;
let intro;


function secs() {
    return millis() / 1000;
}

var Dir = {
    LEFT: 0,
    RIGHT: 1,
}




const level1 = [
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "w                        wwwwwwww",
    "w                         wwwwwww",
    "w                          wwwwww",
    "w                           wwwww",
    "w                             www",
    "w             e                 w",
    "w    w     wwww                 w",
    "w      w                         ",
    "w       w     wwwwwww   w       x",
    "w         w             wwwwwwwww",
    "w         we            w  wwwwww",
    "w p w     wwwwwww       w  w  www",
    "w   w               wwwwwwwwwwwww",
    "wwwwww             ww          ww",
    "wwwwwwww     e   wwwwww         w",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
]


const level2 = [
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "ww    wwwwwwwwwwwwwww          wwwwwww",
    "ww p  wwww           e w       wwwwwww",
    "ww          wwwwwwwwww w   w   wwwwwww",
    "wwwwwwwwwwwwwwwwwwwwww w   w   wwwwwww",
    "wwwwwwwww   e          w   w   wwwwwww",
    "wwwwwwwww wwwwwwwww      www      ewww",
    "wwwwwwwww wwwwwwwwwwwwwwwwww wwwwwwwww",
    "wwww e    wwwwww x     wwwww wwwwwwwww",
    "wwww   wwwwwwwwwwwwww  wwwww wwwwwwwww",
    "wwww   wwww      wwww  wwwww       www",
    "wwww          e        wwww   wwww www",
    "wwwwwwwwwwwwwwwwwwwww wwww   wwwww www",
    "wwwwwwwwwwwwwwwwwwwww     e wwwwww www",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
]


const level3 = [
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    " wp wx                                                                                 ",
    " w  wwwww               ww                     e                                       ",
    " w  w          ww     e                                                                ",
    " w  w                                                                                  ",
    " w  w                      ww                                                          ",
    " w  w                www                                     w                         ",
    " w  w                              www                      w                          ",
    " w  w            ww                    w    w              w             e             ",
    " w  w       ww                                    ww              wwwww                ",
    " w  w   w                                                       e    ww                ",
    " w     w                                                             ww                ",
    " w wwww              ww    ww    ww   ww    ww    ww     www    w xx ww                ",
    " w w                                                            wwwwwww                ",
    " wwww                                                                                  ",
    " wwwwww e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e      ",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
]

const level4 = [
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww                                                           w",
    "wwwwwwwwwww wwwwwwwwwwwwwwwwwwww                                                            w",
    "ww wwwwwwwww w          wwwwww                                                              w",
    "ww wwwwwwwww wwwwwwwwwwwwwwwwwwww                                                           w",
    "ww wwwwwwwww wwwwwwwwwwwwwwwwwwww                                                           w",
    "ww wwwwwwwww wwwwwwwwwwwwwwwwwwww                                                           w",
    "ww wwwwwwwww wwwwwwwwwwwwwwwwwwww                                                           w",
    "ww wwwwwwwwww       w wwwwwwwwwww                                                           w",
    "ww wwwwwwwwwwwwwwwwww wwwwwwwwwww                                                           w",
    "ww wwwwwwwwwwwwwwwwww ww    wwwww                                                           w",
    "ww wwwwwwwwwwwwwwwwww wwx   wwwww                                                           w",
    "ww w        w           w                                                                   w",
    "ww w        w                                                                               w",
    "ww w        w                                                                               w",
    "w           w              www    wwwwwwwwwww     wwwwwwww                                  w",
    "w          ew        e e      we             ww                                             w",
    "w              w         ew    we            www     ewwwwwwww        e                     w",
    "w  www         e          we    wwwwwwwwww   wwwwwwwwww e    w    wwwwww         e        x w",
    "w p  wwwwwwwwwwwwwwwwwwwwwww                 wwwx e           e        wwwwwwwwwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
]                                                            



const LEVELS = [level1, level2, level3, level4];


