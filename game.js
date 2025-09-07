class FirstPersonGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Player properties
        this.player = { x: 400, y: 300, angle: 0, speed: 3, turnSpeed: 0.08, lives: 20 };

        // Enemy properties (with neural network)
        this.enemy = new NeuralEnemy(600, 400);

        // Bullets
        this.bullets = []; // Player bullets
        this.enemyBullets = []; // Enemy bullets

        // Input handling
        this.keys = {};

        // Simple world (walls)
        this.walls = [
            {x1: 100, y1: 100, x2: 700, y2: 100},
            {x1: 700, y1: 100, x2: 700, y2: 500},
            {x1: 700, y1: 500, x2: 100, y2: 500},
            {x1: 100, y1: 500, x2: 100, y2: 100},
            {x1: 200, y1: 200, x2: 300, y2: 200},
            {x1: 400, y1: 150, x2: 400, y2: 250},
            {x1: 500, y1: 300, x2: 600, y2: 300},
            {x1: 250, y1: 350, x2: 250, y2: 450}
        ];

        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', e => this.keys[e.key] = true);
        document.addEventListener('keyup', e => this.keys[e.key] = false);

        document.addEventListener('click', () => {
            // Shoot bullet toward player direction
            this.bullets.push({x: this.player.x, y: this.player.y, angle: this.player.angle, speed: 5});
        });
    }

    update() {
        this.updatePlayer();
        this.enemy.update(this.player, this.walls, this.enemyBullets);

        this.updateBullets(this.bullets, this.enemy);
        this.updateBullets(this.enemyBullets, this.player);

        if (this.player.lives <= 0 || this.enemy.lives <= 0) {
            this.resetRound();
        }
    }

    updatePlayer() {
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) this.player.angle -= this.player.turnSpeed;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) this.player.angle += this.player.turnSpeed;

        let moveX = 0, moveY = 0;
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            moveX += Math.cos(this.player.angle) * this.player.speed;
            moveY += Math.sin(this.player.angle) * this.player.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            moveX -= Math.cos(this.player.angle) * this.player.speed;
            moveY -= Math.sin(this.player.angle) * this.player.speed;
        }

        let newX = this.player.x + moveX;
        let newY = this.player.y + moveY;
        if (!this.checkCollision(newX, this.player.y)) this.player.x = newX;
        if (!this.checkCollision(this.player.x, newY)) this.player.y = newY;
    }

    updateBullets(bullets, target) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            let b = bullets[i];
            b.x += Math.cos(b.angle) * b.speed;
            b.y += Math.sin(b.angle) * b.speed;

            if (Math.hypot(b.x - target.x, b.y - target.y) < 10) {
                target.lives--;
                bullets.splice(i, 1);
            } else if (b.x < 0 || b.y < 0 || b.x > this.canvas.width || b.y > this.canvas.height) {
                bullets.splice(i, 1);
            }
        }
    }

    resetRound() {
        this.player.lives = 20;
        this.player.x = 400;
        this.player.y = 300;
        this.enemy.lives = 20;
        this.enemy.x = 600;
        this.enemy.y = 400;
        this.enemy.mutate();
        this.bullets = [];
        this.enemyBullets = [];
    }

    checkCollision(x, y) {
        const playerRadius = 10;
        for (let wall of this.walls) {
            let distance = this.pointToLineDistance(x, y, wall.x1, wall.y1, wall.x2, wall.y2);
            if (distance < playerRadius) return true;
        }
        return false;
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        let A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
        let dot = A*C + B*D, lenSq = C*C + D*D;
        let param = lenSq !== 0 ? dot / lenSq : -1;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param*C; yy = y1 + param*D; }
        let dx = px - xx, dy = py - yy;
        return Math.sqrt(dx*dx + dy*dy);
    }

    render() {
    // Clear canvas: sky
    this.ctx.fillStyle = '#4A90E2';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

    // Cast rays for 3D walls (original first-person rendering)
    this.castRays();

    // Draw crosshair
    this.drawCrosshair();

    // Draw minimap (player + walls)
    this.drawMinimap();

    // Draw enemy on minimap and world (green circle)
    this.ctx.fillStyle = 'green';
    this.ctx.beginPath();
    this.ctx.arc(this.enemy.x, this.enemy.y, 10, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw player bullets (white)
    this.drawBullets(this.bullets, 'white');

    // Draw enemy bullets (red)
    this.drawBullets(this.enemyBullets, 'red');

    // Draw player and enemy lives
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Player Lives: ${this.player.lives}`, 10, 20);
    this.ctx.fillText(`Enemy Lives: ${this.enemy.lives}`, 10, 40);
    }


    drawBullets(bullets, color) {
        this.ctx.fillStyle = color;
        bullets.forEach(b => {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, 3, 0, Math.PI*2);
            this.ctx.fill();
        });
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    castRays() { /* Existing raycasting code here */ }
    drawCrosshair() { /* Existing crosshair code here */ }
    drawMinimap() { /* Existing minimap code here */ }
}

// Enemy neural network
class NeuralEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 2;
        this.lives = 20;
        this.weights = Array.from({length: 12}, () => Math.random() * 2 - 1);
    }

    mutate() {
        this.weights = this.weights.map(w => w + (Math.random() - 0.5) * 0.2);
    }

    think(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angleToPlayer = Math.atan2(dy, dx);
        const angleDiff = angleToPlayer - this.angle;
        const inputs = [dx/800, dy/600, angleDiff/Math.PI];
        const outputs = [];
        for (let i = 0; i < 4; i++) {
            let sum = 0;
            for (let j = 0; j < 3; j++) sum += inputs[j] * this.weights[i*3 + j];
            outputs.push(Math.tanh(sum));
        }
        return outputs;
    }

    update(player, walls, bullets) {
        const [forward, left, right, shoot] = this.think(player);

        if (forward > 0) {
            let newX = this.x + Math.cos(this.angle) * this.speed;
            let newY = this.y + Math.sin(this.angle) * this.speed;

            if (!this.checkCollision(newX, this.y, walls)) this.x = newX;
            if (!this.checkCollision(this.x, newY, walls)) this.y = newY;
        }
        if (left > 0) this.angle -= 0.05;
        if (right > 0) this.angle += 0.05;
        if (shoot > 0.5) bullets.push({x: this.x, y: this.y, angle: this.angle, speed: 5});
    }

    checkCollision(x, y, walls) {
        const radius = 10;
        for (let wall of walls) {
            let dx = x - wall.x1, dy = y - wall.y1, C = wall.x2 - wall.x1, D = wall.y2 - wall.y1;
            let dot = dx*C + dy*D, lenSq = C*C + D*D;
            let param = lenSq !== 0 ? dot / lenSq : -1;
            let xx, yy;
            if (param < 0) { xx = wall.x1; yy = wall.y1; }
            else if (param > 1) { xx = wall.x2; yy = wall.y2; }
            else { xx = wall.x1 + param*C; yy = wall.y1 + param*D; }
            let dist = Math.hypot(x-xx, y-yy);
            if (dist < radius) return true;
        }
        return false;
    }
}

// Start game
window.addEventListener('load', () => new FirstPersonGame());
