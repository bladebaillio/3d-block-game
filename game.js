class FirstPersonGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Player properties
        this.player = {
            x: 400,
            y: 300,
            angle: 0,
            speed: 3,
            turnSpeed: 0.08 // Increased for more responsive turning
        };
        
        // Input handling
        this.keys = {};
        
        // Simple world (walls)
        this.walls = [
            // Outer walls
            {x1: 100, y1: 100, x2: 700, y2: 100}, // top
            {x1: 700, y1: 100, x2: 700, y2: 500}, // right
            {x1: 700, y1: 500, x2: 100, y2: 500}, // bottom
            {x1: 100, y1: 500, x2: 100, y2: 100}, // left
            
            // Inner walls
            {x1: 200, y1: 200, x2: 300, y2: 200},
            {x1: 400, y1: 150, x2: 400, y2: 250},
            {x1: 500, y1: 300, x2: 600, y2: 300},
            {x1: 250, y1: 350, x2: 250, y2: 450}
        ];
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        this.keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        this.keys[e.key] = false;
    });

    // Mouse movement for turning
    this.canvas.addEventListener('click', () => {
        this.canvas.requestPointerLock(); // Lock pointer on click
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === this.canvas) {
            const sensitivity = 0.002; // adjust for comfortable turning
            this.player.angle += e.movementX * sensitivity;

            // Wrap angle to [0, 2π]
            this.player.angle %= Math.PI * 2;
            if (this.player.angle < 0) this.player.angle += Math.PI * 2;
        }
    });
    }

    
    update() {
    let moveX = 0;
    let moveY = 0;

    // Forward/back (W/Up, S/Down)
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
        moveX += Math.cos(this.player.angle) * this.player.speed;
        moveY += Math.sin(this.player.angle) * this.player.speed;
    }
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
        moveX -= Math.cos(this.player.angle) * this.player.speed;
        moveY -= Math.sin(this.player.angle) * this.player.speed;
    }

    // Strafe left/right (A/Left, D/Right)
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
        moveX += Math.cos(this.player.angle - Math.PI / 2) * this.player.speed;
        moveY += Math.sin(this.player.angle - Math.PI / 2) * this.player.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
        moveX += Math.cos(this.player.angle + Math.PI / 2) * this.player.speed;
        moveY += Math.sin(this.player.angle + Math.PI / 2) * this.player.speed;
    }

    // Simple collision detection
    let newX = this.player.x + moveX;
    let newY = this.player.y + moveY;

    if (!this.checkCollision(newX, this.player.y)) {
        this.player.x = newX;
    }
    if (!this.checkCollision(this.player.x, newY)) {
        this.player.y = newY;
    }
    }

    
    checkCollision(x, y) {
        const playerRadius = 10;
        
        for (let wall of this.walls) {
            let distance = this.pointToLineDistance(x, y, wall.x1, wall.y1, wall.x2, wall.y2);
            if (distance < playerRadius) {
                return true;
            }
        }
        return false;
    }
    
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        let A = px - x1;
        let B = py - y1;
        let C = x2 - x1;
        let D = y2 - y1;
        
        let dot = A * C + B * D;
        let lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        let dx = px - xx;
        let dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    render() {
        // Clear canvas with sky
        this.ctx.fillStyle = '#4A90E2'; // Sky blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513'; // Brown ground
        this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);
        
        // Cast rays for 3D effect
        this.castRays();
        
        // Draw crosshair
        this.drawCrosshair();
        
        // Draw minimap
        this.drawMinimap();
    }
    
    castRays() {
        const numRays = this.canvas.width;
        const fov = Math.PI / 3; // 60 degrees field of view
        
        for (let i = 0; i < numRays; i++) {
            let rayAngle = this.player.angle - fov/2 + (fov * i / numRays);
            let distance = this.castRay(rayAngle);
            
            // Fix fisheye effect
            distance = distance * Math.cos(rayAngle - this.player.angle);
            
            // Calculate wall height based on distance
            let wallHeight = (this.canvas.height / 2) / (distance * 0.01);
            wallHeight = Math.min(wallHeight, this.canvas.height);
            
            // Calculate wall color based on distance (fog effect)
            let brightness = Math.max(0.1, 1 - distance / 400);
            let color = Math.floor(brightness * 200);
            
            // Draw wall slice
            this.ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
            this.ctx.fillRect(
                i, 
                (this.canvas.height - wallHeight) / 2, 
                1, 
                wallHeight
            );
        }
    }
    
    castRay(angle) {
        let rayX = this.player.x;
        let rayY = this.player.y;
        let rayDirX = Math.cos(angle);
        let rayDirY = Math.sin(angle);
        
        let distance = 0;
        let step = 1;
        let maxDistance = 600;
        
        while (distance < maxDistance) {
            rayX += rayDirX * step;
            rayY += rayDirY * step;
            distance += step;
            
            // Check if ray hits a wall
            for (let wall of this.walls) {
                if (this.pointToLineDistance(rayX, rayY, wall.x1, wall.y1, wall.x2, wall.y2) < 3) {
                    return distance;
                }
            }
        }
        
        return maxDistance;
    }
    
    drawCrosshair() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = 10;
        
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        
        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - size, centerY);
        this.ctx.lineTo(centerX + size, centerY);
        this.ctx.stroke();
        
        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - size);
        this.ctx.lineTo(centerX, centerY + size);
        this.ctx.stroke();
    }
    
    drawMinimap() {
        const scale = 0.15;
        const mapX = this.canvas.width - 130;
        const mapY = 10;
        const mapWidth = 120;
        const mapHeight = 120;
        
        // Draw minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
        
        // Draw border
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
        
        // Draw walls on minimap
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = 1;
        this.walls.forEach(wall => {
            this.ctx.beginPath();
            this.ctx.moveTo(mapX + wall.x1 * scale, mapY + wall.y1 * scale);
            this.ctx.lineTo(mapX + wall.x2 * scale, mapY + wall.y2 * scale);
            this.ctx.stroke();
        });
        
        // Draw player on minimap
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(
            mapX + this.player.x * scale, 
            mapY + this.player.y * scale, 
            3, 0, Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw player direction
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(mapX + this.player.x * scale, mapY + this.player.y * scale);
        this.ctx.lineTo(
            mapX + this.player.x * scale + Math.cos(this.player.angle) * 15,
            mapY + this.player.y * scale + Math.sin(this.player.angle) * 15
        );
        this.ctx.stroke();
        
        // Draw field of view cone
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        const fov = Math.PI / 3;
        
        this.ctx.beginPath();
        this.ctx.moveTo(mapX + this.player.x * scale, mapY + this.player.y * scale);
        this.ctx.lineTo(
            mapX + this.player.x * scale + Math.cos(this.player.angle - fov/2) * 20,
            mapY + this.player.y * scale + Math.sin(this.player.angle - fov/2) * 20
        );
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(mapX + this.player.x * scale, mapY + this.player.y * scale);
        this.ctx.lineTo(
            mapX + this.player.x * scale + Math.cos(this.player.angle + fov/2) * 20,
            mapY + this.player.y * scale + Math.sin(this.player.angle + fov/2) * 20
        );
        this.ctx.stroke();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new FirstPersonGame();
});
