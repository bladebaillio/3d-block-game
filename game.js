const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 3,
    rotation: 0,
    size: 10,
};

const walls = [
    { x: 0, y: 0, width: canvas.width, height: player.size },
    { x: 0, y: canvas.height - player.size, width: player.size, height: canvas.height },
    { x: canvas.width - player.size, y: 0, width: player.size, height: canvas.height },
    { x: canvas.width, y: canvas.height - player.size, width: player.size, height: canvas.height }
];

const keys = {};

function drawWall(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawPlayer() {
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

function drawScene() {
    ctx.translate(player.x, player.y);
    ctx.rotate(-player.rotation);
    ctx.fillStyle = 'lightgray';
    ctx.fillRect(-player.size, -player.size, canvas.width, canvas.height);
    walls.forEach((wall) => drawWall(wall.x - player.x, wall.y - player.y, wall.width, wall.height, 'white'));
    ctx.translate(-player.x, -player.y);
}

function update() {
    player.rotation += (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    player.x += (keys.left ? -player.speed : 0) + (keys.right ? player.speed : 0);
    player.y += (keys.up ? -player.speed : 0) + (keys.down ? player.speed : 0);

    player.rotation = Math.min(Math.max(player.rotation, 0), 360);
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.size));
    player.y = Math.max(player.size, Math.min(player.y, canvas.height - player.size));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene();
    drawPlayer();
}

function keyDownHandler(event) {
    keys[event.key] = true;
}

function keyUpHandler(event) {
    keys[event.key] = false;
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

setInterval(update, 1000 / 60); // Update the game 60 times per second