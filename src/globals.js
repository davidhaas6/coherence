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
    "ww    wwwwwwwwwwwwwww          ww    w",
    "ww p  wwww           e w       w    ww",
    "ww          wwwwwwwwww w   w   www   w",
    "wwwwwwwwwwwwwwwww      w   w   w  w ww",
    "ww    www   e              w   wwwwwww",
    "ww    www wwwwwwwww www  www      ewww",
    "wwwwwwwww w      www  www  w wwwwwwwww",
    "w  w e    ww www x     w  ww w      ww",
    "w  w   wwwwwwwwwwwwww  w   w        ww",
    "w  w   wwww      wwww  w  ww        ww",
    "w  w          e        w  w   wwww  ww",
    "wwwwwwwwwwwwwwwwwwwww wwww   wwww   ww",
    "wwwwww        ww  www     e www     ww",
    "w     w   ww        wwwwwwwww    ww ww",
    "w x        wwe    w            wwwwwww",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
]


const level3 = [
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    " wp w                                                                                  ",
    " w  wwwww               ww                                                             ",
    " w  w          ww                                                                      ",
    " w  w                                                                                  ",
    " w  w                      ww                                                          ",
    " w  w                www                                     w                         ",
    " w  w                              www                      w                          ",
    " w  w            ww                    w    w       w      w                           ",
    " w  w       ww                                     w              wwwww                ",
    " w  w   w                                                            ww                ",
    " w     w       e                           www                       ww                ",
    " w wwww              ww    ww    ww   ww         ww    wwww     w x  ww                ",
    " w w                                                            wwwwwww                ",
    " wwww                                                                                  ",
    " wwwwww          e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e  e      ",
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


