const canvas = document.getElementById("rpg");
const ctx = canvas.getContext("2d");
const tileSet = new Image();
const player = new Image();
canvas.width = 640;
canvas.height = 640;
let collision = null;
let collisionX = [];
let collisionY = [];

// keyboard event listener variable declarations
let up = false;
let down = false;
let left = false;
let right = false;

// Set map cols, rows, source x & y
let map = {
  cols: 20,
  rows: 20,
  tsize: 32,
  getTileX: function(counter, tiles) {
    return 32 * ((tiles[counter] - 1) % 64);
  },
  getTileY: function(counter, tiles) {
    return 32 * Math.floor((tiles[counter] - 1) / 64);
  }
};

// SetInterval for walking animation
let walk = [0, 48, 96];
let walkCounter = 0;
setInterval(function() {
  walkCounter++;
  if (walkCounter == 3) {
    walkCounter = 0;
  }
}, 300);

// Key down/up event listeners
document.addEventListener("keydown", e => {
  e.preventDefault();
  if (left || right || up || down) {
    return;
  }
  if (e.keyCode === 39) {
    right = true;
  }
  if (e.keyCode === 37) {
    left = true;
  }
  if (e.keyCode === 38) {
    up = true;
  }
  if (e.keyCode === 40) {
    down = true;
  }
});
document.addEventListener("keyup", e => {
  if (e.keyCode === 39) {
    right = false;
  }
  if (e.keyCode === 37) {
    left = false;
  }
  if (e.keyCode === 38) {
    up = false;
  }
  if (e.keyCode === 40) {
    down = false;
  }
  player1.walk = 0;
});

// Fetch JSON map data
let mapObj = null;
(async function() {
  const response = await fetch("http://localhost:5000/map", {
    method: "get",
    headers: { "Content-Type": "application/json" }
  });
  mapObj = await response.json();

  mapObj.layers[1].data.forEach((data, index) => {
    collisionX.push(map.getTileX(index, mapObj.layers[1].data));
    collisionY.push(map.getTileY(index, mapObj.layers[1].data));
  });
  collisionX = Array.from(new Set([...collisionX]));
  collisionY = Array.from(new Set([...collisionY]));
  draw();
  requestAnimationFrame(gameLoop);
})();

class Player {
  constructor() {
    this.x = 350;
    this.y = 350;
    this.direction = 0;
    this.walk = 0;
  }

  draw(plane, operator) {
    let that = this;
    let xy = plane == "x" ? 1 : null;
    if (xy) {
      that.x += operator;
      collisionX.forEach(colX => {
        if (that.x > colX + 32) {
          that.x -= 4;
          return;
        }
      });
    } else {
      that.y += operator;
      collisionY.forEach(colY => {
        if (that.y > colY + 32) {
          that.y -= 4;
          return;
        }
      });
    }
  }

  move() {
    if (right == true) {
      player1.walk = walk[walkCounter];
      this.direction = 64;
      this.draw("x", 1.5);
    }
    if (left == true) {
      player1.walk = walk[walkCounter];
      this.direction = 192;
      this.draw("x", -1.5);
    }
    if (up == true) {
      player1.walk = walk[walkCounter];
      this.direction = 0;
      this.draw("y", -1.5);
    }
    if (down == true) {
      player1.walk = walk[walkCounter];
      this.direction = 128;
      this.draw("y", 1.5);
    }
  }
}

function drawLayers(int) {
  let counter = 0;
  for (let c = 0; c < map.cols; c++) {
    for (let r = 0; r < map.rows; r++) {
      let x = map.getTileX(counter, mapObj.layers[int].data);
      let y = map.getTileY(counter, mapObj.layers[int].data);
      counter += 1;
      ctx.drawImage(
        tileSet, // image
        x, // source x
        y, // source y
        map.tsize, // source width
        map.tsize, // source height
        r * 32, // target x
        c * 32, // target y
        32, // target width
        32 // target height
      );
    }
  }
}

function draw() {
  tileSet.onload = function() {
    drawLayers(0);
    drawLayers(1);
  };
  tileSet.src = "assets/dungeon_tiles.png";
  player.src = "assets/death_knight.png";
}

let player1 = new Player();
function gameLoop() {
  player1.move();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLayers(0);
  drawLayers(1);
  ctx.drawImage(
    player,
    player1.walk, // source x
    player1.direction, // source y
    48, // source width
    64, // source height
    player1.x, // target x
    player1.y, // target y
    (canvas.width / 32) * 2, // target width
    (canvas.height / 32) * 2 // target height);
  );
  requestAnimationFrame(gameLoop);
}
