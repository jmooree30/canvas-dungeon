const canvas = document.getElementById("rpg");
const ctx = canvas.getContext("2d");
const tileSet = new Image();
const player = new Image();
canvas.width = window.innerWidth;
canvas.height = window.innerWidth;

// keyboard event listeners
let up = false;
let down = false;
let left = false;
let right = false;
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
this.map = fetch("http://localhost:5000/map", {
  method: "get",
  headers: { "Content-Type": "application/json" }
})
  .then(res => res.json())
  .then(data => {
    mapObj = data;
    draw();
    requestAnimationFrame(gameLoop);
  });

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
      if (that.x > canvas.width - 60) {
        that.x -= 4;
        return;
      }
      if (that.x < 26) {
        that.x += 4;
        return;
      }
    } else {
      that.y += operator;
      if (that.y > canvas.height - 70) {
        that.y -= 4;
        return;
      }
      if (that.y < 26) {
        that.y += 4;
        return;
      }
      if (that.y > window.innerHeight) {
        that.y -= 4;
        console.log("poop");
        window.scrollTo(0, window.innerHeight + 5);
        return;
      }
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

let walk = [0, 48, 96];
let walkCounter = 0;
setInterval(function() {
  walkCounter++;
  if (walkCounter == 3) {
    walkCounter = 0;
  }
}, 300);

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
        (r * canvas.width) / 20, // target x
        (c * canvas.width) / 20, // target y
        canvas.width / 20, // target width
        canvas.width / 20 // target height
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
