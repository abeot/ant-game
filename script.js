
const gamepadOutput = document.getElementById("gamepadOutput");
const player = document.getElementById("player");
const keyOut = document.getElementById("keyOut");
const mainWrapper = document.getElementById("mainWrapper");
const world = document.getElementById("world");
const healthBar = document.getElementById("healthBar");
const xpBar = document.getElementById("xpBar");
const healthParagraph = document.getElementById("healthParagraph");
const xpParagraph = document.getElementById("xpParagraph")
//const resultParagraph = document.getElementById("resultParagraph");
const spiderAudio = new Audio("spidersound.mp3");
const appleAudio = new Audio("applecrunch.mp3");


const tileSize = 64; 
const worldSize = 20; 
let exploredTiles = new Set();
let hostileTiles = new Set();
let spawned = new Set();
let seenTiles = new Set();
let foodTiles = new Set();
let eaten = new Set();
let activeMonsters = [];
let offsetX = 0, offsetY = 0;
let prevOffsetX = 0, prevOffsetY = 0;
let nonzeroOffset = false;

let playerX = 230;
let playerY = 230;

let globalX = 230;
let globalY = 230;

const worldBounds = {
    minY: 0, // Player can't go up beyond this
    maxY: 500   // Player can't go down beyond this
};


let health = 100;
let xp = 0;
let gameOver = false;


window.addEventListener("load", function(){
    generateWorld();
    window.requestAnimationFrame(update);
});


let up = 0, down = 0, left = 0, right = 0;
let globalNavigator;

function generateWorld(startX = 0, startY = 0) {
    console.log("regenerate world");
    world.innerHTML = "";
    for (let y = startY; y < startY + worldSize; y++) {
        for (let x = startX; x < startX + worldSize; x++) {
            let tile = document.createElement("div");
            tile.classList.add("tile");
            tile.style.left = `${x * tileSize}px`;
            tile.style.top = `${y * tileSize}px`;
            tile.setAttribute("data-x", x);
            tile.setAttribute("data-y", y);

            tile.style.backgroundImage = "url('dirt2.png')";
            if (exploredTiles.has(`${x},${y}`)) {
                tile.classList.add("explored");
                if (hostileTiles.has(`${x},${y}`)) {
                    // tile.style.backgroundImage = "url('spider.png')"; 
                    // //tile.style.backgroundImage = "url('dirt2.png')";
                    // tile.style.backgroundSize = "contain"; 
                    // tile.style.backgroundRepeat = "no-repeat"; 
                    // tile.style.backgroundPosition = "center"; 
                    if (!spawned.has(`${x},${y}`)) {
                        console.log(`Spider appeared at ${x},${y}`);
                    }
                }
                if (foodTiles.has(`${x},${y}`)) {
                    if (!eaten.has(`${x},${y}`)) {
                        tile.style.backgroundImage = "url('apple.png')";
                        tile.style.backgroundSize = "contain"; 
                        tile.style.backgroundRepeat = "no-repeat"; 
                        tile.style.backgroundPosition = "center"; 
                        // tile.setAttribute("contains", "food");
                    }
                }
            }

            // if (exploredTiles.has(`${x},${y}`)) {
            //     tile.classList.add("explored");
            //     //tile.createAttribute("contains");
            //     let randomNum = Math.floor(Math.random() * 20) + 1;
            //     if (randomNum == 18) {
            //         tile.setAttribute("contains", "food");
            //     }
            //     else if (randomNum == 19 || randomNum == 20) {
            //         tile.setAttribute("contains", "enemy");
            //     }
            //     else {
            //         tile.setAttribute("contains", "nothing");
            //     }
            // }
            world.appendChild(tile);
        }
    }
}

function move(dx, dy) {
    
    // console.log("player global coords: " + globalX + ", " + globalY);
    // console.log("offsets: " +offsetX + ", " + offsetY);
    // console.log("player: " + playerX + ", " + playerY);

    let nextGlobalX = globalX + dx;
    let nextGlobalY = globalY + dy;

    if (nextGlobalY < worldBounds.minY || nextGlobalY > worldBounds.maxY) return;

    globalX = nextGlobalX;
    globalY = nextGlobalY;

    let tileX = Math.floor(globalX / tileSize);
    let tileY = Math.floor(globalY / tileSize);

    if (foodTiles.has(`${tileX},${tileY}`)) {
        if (!eaten.has(`${tileX},${tileY}`)) {
            eaten.add(`${tileX},${tileY}`);
            
            let tile = document.querySelector(`.tile[data-x="${tileX}"][data-y="${tileY}"]`);
            tile.style.backgroundImage = "url('dirt2.png')";
            tile.style.backgroundSize = "";
            tile.style.backgroundRepeat = "";
            tile.style.backgroundPosition = "";

            
            gainHealth();
            gainXP();
        }
    }

    // console.log("CURRENT tileX, tileY: " + tileX + " " + tileY);

    // mark tile as explored
    // add neighbors too
    let ddx = 0, ddy = 0;
    for (ddx=-1; ddx<=1; ++ddx) {
        for (ddy=-1; ddy<=1; ++ddy) {
            let neighborX = tileX + ddx;
            let neighborY = tileY + ddy;
            exploredTiles.add(`${neighborX},${neighborY}`);

            let tile = document.querySelector(`.tile[data-x="${neighborX}"][data-y="${neighborY}"]`);
            
            if (!seenTiles.has(`${neighborX},${neighborY}`)) {
                let randomNum = Math.floor(Math.random() * 20) + 1;
                if (randomNum == 1) {
                    hostileTiles.add(`${neighborX},${neighborY}`);
                } else if (randomNum == 2) {
                    foodTiles.add(`${neighborX},${neighborY}`);
                }
            }
            seenTiles.add(`${neighborX},${neighborY}`);
            
            if (tile) {
                tile.classList.add("explored");
                
                if (hostileTiles.has(`${neighborX},${neighborY}`)) {

                    // tile.style.backgroundImage = "url('spider.png')"; 
                    // //tile.style.backgroundImage = "url('dirt2.png')";
                    // tile.style.backgroundSize = "contain"; 
                    // tile.style.backgroundRepeat = "no-repeat"; 
                    // tile.style.backgroundPosition = "center"; 
                    // console.log(`Spider appeared at ${neighborX},${neighborY}`);

                    if (!spawned.has(`${neighborX},${neighborY}`)) {
                        let monsterX = playerX + (ddx) * tileSize;
                        let monsterY = playerY + (ddy) * tileSize;
                        console.log("Player was at " + playerX + ", " + playerY);
                        spawned.add(`${neighborX},${neighborY}`);

                        let monster = document.createElement("img");
                        // const audio = new Audio("spidersound.mp3");
                        // audio.play();
                        monster.src = "spider.png";
                        monster.classList.add("monster");
                        monster.style.left = `${monsterX}px`;
                        monster.style.top = `${monsterY}px`;

                        mainWrapper.appendChild(monster);
                        // world.appendChild(monster);

                        activeMonsters.push({
                            element: monster,
                            x: monsterX, 
                            y: monsterY
                        });
                    }
                }
                if (foodTiles.has(`${tileX},${tileY}`)) {
                    if (!eaten.has(`${tileX},${tileY}`)) {
                        tile.style.backgroundImage = "url('apple.png')";
                        tile.style.backgroundSize = "contain"; 
                        tile.style.backgroundRepeat = "no-repeat"; 
                        tile.style.backgroundPosition = "center"; 
                        // tile.setAttribute("contains", "food");
                    }
                }
            }
        }
    }

    // generateWorld(Math.floor(globalX / tileSize) - worldSize / 2, Math.floor(globalY / tileSize) - worldSize / 2);

    let update = false;
    const boundary = 125;
    
    playerX += dx;
    playerY += dy;

    if (playerX < boundary) {
        offsetX += dx;
        playerX -= dx;
        world.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    } else if (playerX > 375) {
        offsetX += dx;
        playerX -= dx;
        world.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    } else {
        player.style.left = `${playerX}px`;
    }

    if (playerY < boundary) {
        offsetY += dy;
        playerY -= dy;
        world.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    } else if (playerY > 375) {
        offsetY += dy;
        playerY -= dy;
        world.style.transform = `translate(${-offsetX}px, ${-offsetY}px)`;
    } else {
        player.style.top = `${playerY}px`;
    }

    if (Math.abs(offsetX - prevOffsetX) > tileSize || Math.abs(offsetY - prevOffsetY) > tileSize) {
        console.log("moved past prevOffsetX, prevOffsetY");
        prevOffsetX = offsetX;
        prevOffsetY = offsetY;
        update = true;
    } else if (prevOffsetX == 0 && prevOffsetY == 0 && !nonzeroOffset) {
        console.log("prevOffsetX == 0 && prevOffsetY == 0");
        nonzeroOffset = true;
        prevOffsetX = offsetX;
        prevOffsetY = offsetY;
        update = true;
    }

    if (update) {
        // console.log("on tile bound");
        generateWorld(Math.floor(offsetX / tileSize) - 1, Math.floor(offsetY / tileSize) - 1);
    }
}

function updateMonsters() {
    const speed = 1;

    let newActiveMonsters = [];

    activeMonsters.forEach((monster) => {

        // console.log("Spider coords at " + monster.x + ", " + monster.y);
        // console.log("Spider on screen at " + monster.element.style.left + ", " + monster.element.style.top);
        // console.log("Player coords at " + playerX + ", " + playerY);
        // console.log("Player on screen at " + player.style.left + ", " + player.style.top);
        let dx = playerX - monster.x;
        let dy = playerY - monster.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        const eps = 30;

        if (distance > eps) {
            let moveX = 1.0 * dx / distance * speed;
            let moveY = 1.0 * dy / distance * speed;

            monster.x += moveX;
            monster.y += moveY;

            monster.element.style.left = `${monster.x}px`;
            monster.element.style.top = `${monster.y}px`;

            newActiveMonsters.push(monster);
        } else {
            // collision
            console.log("Collision with spider");
            loseHealth();

            monster.element.remove();
        }
    });

    activeMonsters = newActiveMonsters;

}

function update() {
    // gamepadOutput.innerHTML = "Gamepad connected at index "
    // + e.gamepad.index + ": " + e.gamepad.id + ". " + 
    // e.gamepad.buttons.length + " buttons, " + e.gamepad.axes.length
    // + " axes.";
    
    if (globalNavigator !== null && globalNavigator !== undefined) {
        console.log(globalNavigator);
        let dx = 0;
        let dy = 0;
    
        for (const gamepad of globalNavigator.getGamepads()) {
            if (!gamepad) continue;
            for (const [index, axis] of gamepad.axes.entries()) {
                gamepadOutput.innerHTML += "<br>JUST PRESSED GAMEPAD NO "
                + gamepad.index + " with the axes index " + index
                + " with amount " + axis;
                if (index == 0) dx = axis;
                if (index == 1) dy = axis;
            }
        }
        gamepadOutput.innerHTML = "<br>dx: " + dx + "<br>dy: " + dy;
        move(dx, dy);
    }

    updateMonsters(); // move spiders toward player
    
    // if (numPressed == 2) {
    //     if (left) move(-2 / Math.sqrt(2), 0);
    //     if (right) move(2 / Math.sqrt(2), 0);
    //     if (up) move(0, -2 / Math.sqrt(2));
    //     if (down) move(0, 2 / Math.sqrt(2));
    // }
    // else {
    //     if (left) move(-2, 0);
    //     if (right) move(2, 0);
    //     if (up) move(0, -2);
    //     if (down) move(0, 2);
    // }
    if (numPressed == 2) {
        if (left) move(-1, 0);
        if (right) move(1, 0);
        if (up) move(0, -1);
        if (down) move(0, 1);
    }
    else {
        if (left) move(-Math.sqrt(2), 0);
        if (right) move(Math.sqrt(2), 0);
        if (up) move(0, -Math.sqrt(2));
        if (down) move(0, Math.sqrt(2));
    }
    
    
    
    
    
    // spider code
    /*
    let chance = Math.floor(Math.random() * 100)
    
    if (chance == 1) {
        let spider = document.createElement("div")
        spider.classList.add("tile");
    
        tile.style.backgroundImage = "url('spider.png')";
        world.appendChild(spider); 
        
        let
        
    }
    */
    if (!gameOver) {
        requestAnimationFrame(update);
    } 
}

document.addEventListener("keydown", keyPress);
document.addEventListener("keyup", keyRelease);
let numPressed = 0;

function keyRelease(e) {
    if (e.keyCode)
    switch(e.keyCode){
        case 38: up = 0; break;
        case 40: down = 0; break;
        case 39: right = 0; break;
        case 37: left = 0; break;
    }
    numPressed--;
}

function keyPress(e) {
    keyOut.innerHTML = "Key pressed: " + e.keyCode;
    if (e.keyCode)
    switch(e.keyCode){
        case 38: up = 1; break;
        case 40: down = 1; break;
        case 39: right = 1; break;
        case 37: left = 1; break;
    }
    numPressed++;
}

window.addEventListener("gamepadconnected", (e) => {
    globalNavigator = navigator;
    update();
});


window.addEventListener("gamepaddisconnected", (e) => {
  console.log(
    "Gamepad disconnected from index %d: %s",
    e.gamepad.index,
    e.gamepad.id,
  );
  gamepadOutput.innerHTML += "<br>STUFF";
  gamepadOutput.innerHTML += "<br>Gamepad disconnected from index "
  + e.gamepad.index + ": " + e.gamepad.id;
});

function loseHealth() {
    health -= 20;
    spiderAudio.play();
    if (health <= 0) {
        health = 0
        stopGame("lose");
    }
    healthParagraph.innerHTML = "Health: " + health;
    healthBar.value = health;
}

function gainHealth() {
    console.log("Health gained");
    health += 10;
    if (health > 100) {
        health = 100;
    }

    appleAudio.play();


    healthParagraph.innerHTML = "Health: " + health;
    healthBar.value = health;
}


function gainXP() {
    console.log("XP gained");
    
    xp += 10
    xpBar.value = xp
    
    xpParagraph.innerHTML = "XP: " + xp;
    
    
    
    
    if (xp >= 100) {
        stopGame("win");
    }
    
}


let gameEnd = document.createElement("div");


// CURRENTLY MOVING ALL ENDINGS TO ONE FUNCTION
// function win() {
//     mainWrapper.style.opacity = "0.5";
    
    
//     //gameEnd.classList.add("winTitle");
    
//     //mainWrapper.appendChild(gameEnd);
    
//     // let resultParagraph = document.createElement("p");
//     // resultParagraph.innerHTML = "Congrats! You won"
//     // resultParagraph.classList.add("endingParagraph");
   
//     // mainWrapper.appendChild(resultParagraph)
    
//     gameOver = true;
    
// } 





function stopGame(result) {
    gameOver = true;
    mainWrapper.style.opacity = "0.7";

    let resultParagraph = document.createElement("p");
    if (result == "win") {
        //let text = document.createTextNode("Congrats! You won!");
        resultParagraph.innerHTML = "Congrats You Won"; 
        
    }
    else {
        //let text = document.createTextNode("Shucks! I guess the spiders go to you :|");
        resultParagraph.innerHTML = "Shucks! I guess the spiders killed you.";
        
    } 
    //resultParagraph.appendChild(text);
    resultParagraph.classList.add("endingParagraph")
    mainWrapper.appendChild(resultParagraph);
    resultParagraph.style.zIndex = 11;
    gameOver = true;
    
    //window.createElement("");
}






// const bossMusic= 
