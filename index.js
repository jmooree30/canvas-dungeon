const canvas = document.getElementById("rpg");
const ctx = canvas.getContext("2d");
const tileSet = new Image();
const player = new Image();
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;
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
  cols: 100,
  rows: 100,
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
    if (data != 0) {
      collisionX.push(32 * (index % 20));
      collisionY.push(32 * Math.floor(index / 100));
    }
  });
  draw();
  requestAnimationFrame(gameLoop);
})();

class Player {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.reverseX = canvas.width / 2;
    this.reverseY = canvas.height / 2;
    this.direction = 0;
    this.walk = 0;
  }

  draw(plane, amount) {
    let that = this;
    if (plane == "x") {
      that.x += amount;
      that.reverseX -= amount;
    }
    if (plane == "y") {
      that.y += amount;
      that.reverseY -= amount;
    }
    collisionX.forEach((colX, index) => {
      if (
        that.reverseX < colX + 20 &&
        that.reverseX + 20 > colX &&
        that.reverseY < collisionY[index] + 20 &&
        that.reverseY + 20 > collisionY[index]
      ) {
        if (plane == "x") {
          that.x -= amount;
          that.reverseX += amount;
        }
        if (plane == "y") {
          that.y -= amount;
          that.reverseY += amount;
        }
        return;
      }
    });
  }

  move() {
    if (right == true) {
      player1.walk = walk[walkCounter];
      this.direction = 64;
      this.draw("x", -11.5);
      if (player1.reverseX > 3200 - canvas.width / 2) {
        endX += 2;
      }
    }
    if (left == true) {
      player1.walk = walk[walkCounter];
      this.direction = 192;
      this.draw("x", 11.5);
      if (player1.reverseX > 3200 - canvas.width / 2) {
        endX -= 2;
      }
    }
    if (up == true) {
      player1.walk = walk[walkCounter];
      this.direction = 0;
      this.draw("y", 11.5);
      if (player1.reverseY > 3200 - canvas.width / 2) {
        endY -= 2;
      }
    }
    if (down == true) {
      player1.walk = walk[walkCounter];
      this.direction = 128;
      this.draw("y", -11.5);
      if (player1.reverseY > 3200 - canvas.width / 2) {
        endY += 2;
      }
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

let endX = canvas.width / 2;
let endY = canvas.height / 2;
let player1 = new Player();
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  if (
    player1.reverseX > 3200 - canvas.width / 2 &&
    player1.reverseY > 3200 - canvas.width / 2
  ) {
    ctx.translate(-3200 + canvas.width, -3200 + canvas.height);
  } else if (player1.reverseX > 3200 - canvas.width / 2) {
    ctx.translate(-3200 + canvas.width, player1.y - canvas.height / 2);
  } else if (player1.reverseY > 3200 - canvas.width / 2) {
    ctx.translate(player1.x - canvas.width / 2, -3200 + canvas.height);
  } else if (player1.x > canvas.width / 2 && player1.y > canvas.height / 2) {
    ctx.translate(0, 0);
    endX = canvas.width / 2;
    endY = canvas.height / 2;
  } else if (player1.x > canvas.width / 2) {
    ctx.translate(0, player1.y - canvas.height / 2);
    endX = canvas.width / 2;
    endY = canvas.height / 2;
  } else if (player1.y > canvas.height / 2) {
    ctx.translate(player1.x - canvas.width / 2, 0);
    endX = canvas.width / 2;
    endY = canvas.height / 2;
  } else {
    ctx.translate(player1.x - canvas.width / 2, player1.y - canvas.height / 2);
    endX = canvas.width / 2;
    endY = canvas.height / 2;
  }
  if (
    player1.reverseX > 3200 - canvas.width / 2 &&
    player1.reverseY > 3200 - canvas.width / 2
  ) {
    player1.move();
    drawLayers(0);
    drawLayers(1);
    ctx.restore();
    ctx.drawImage(
      player,
      player1.walk, // source x
      player1.direction, // source y
      48, // source width
      64, // source height
      endX, // target x
      endY, // target y
      32, // target width
      32 // target height);
    );
  } else if (player1.reverseX > 3200 - canvas.width / 2) {
    player1.move();
    drawLayers(0);
    drawLayers(1);
    ctx.restore();
    ctx.drawImage(
      player,
      player1.walk, // source x
      player1.direction, // source y
      48, // source width
      64, // source height
      endX, // target x
      canvas.height / 2, // target y
      32, // target width
      32 // target height);
    );
  } else if (player1.reverseY > 3200 - canvas.width / 2) {
    player1.move();
    drawLayers(0);
    drawLayers(1);
    ctx.restore();
    ctx.drawImage(
      player,
      player1.walk, // source x
      player1.direction, // source y
      48, // source width
      64, // source height
      canvas.width / 2, // target x
      endY, // target y
      32, // target width
      32 // target height);
    );
  } else if (player1.x > canvas.width / 2 && player1.y > canvas.height / 2) {
    player1.move();
    drawLayers(0);
    drawLayers(1);
    ctx.restore();
    ctx.drawImage(
      player,
      player1.walk, // source x
      player1.direction, // source y
      48, // source width
      64, // source height
      player1.reverseX, // target x
      player1.reverseY, // target y
      32, // target width
      32 // target height);
    );
  } else if (player1.x > canvas.width / 2) {
    player1.move();
    drawLayers(0);
    drawLayers(1);
    ctx.restore();
    ctx.drawImage(
      player,
      player1.walk, // source x
      player1.direction, // source y
      48, // source width
      64, // source height
      player1.reverseX, // target x
      canvas.height / 2, // target y
      32, // target width
      32 // target height);
    );
  } else if (player1.y > canvas.height / 2) {
    player1.move();
    drawLayers(0);
    drawLayers(1);
    ctx.restore();
    ctx.drawImage(
      player,
      player1.walk, // source x
      player1.direction, // source y
      48, // source width
      64, // source height
      canvas.width / 2, // target x
      player1.reverseY, // target y
      32, // target width
      32 // target height);
    );
  } else {
    player1.move();
    drawLayers(0);
    drawLayers(1);
    ctx.restore();
    ctx.drawImage(
      player,
      player1.walk, // source x
      player1.direction, // source y
      48, // source width
      64, // source height
      canvas.width / 2, // target x
      canvas.height / 2, // target y
      32, // target width
      32 // target height);
    );
  }
  requestAnimationFrame(gameLoop);
}
