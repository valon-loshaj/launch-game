document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const gameCanvas = document.getElementById('game-canvas');
    const ctx = gameCanvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const angleSlider = document.getElementById('angle-slider');
    const angleValue = document.getElementById('angle-value');
    const trajectoryLine = document.getElementById('trajectory-line');
    const fireButton = document.getElementById('fire-button');
    const characterOptions = document.querySelectorAll('.character-option');
    
    // Game state
    let score = 0;
    let selectedCharacter = 'mouse';
    let launchAngle = 45;
    let isLaunching = false;
    let projectile = null;
    let targets = [];
    let animationId = null;
    let lastTime = 0;
    
    // Game constants
    const GRAVITY = 0.0015;
    const INITIAL_VELOCITY = 0.5;
    const CHARACTER_SIZE = 30;
    const TARGET_SIZE = 40;
    const TARGET_COUNT = 3;
    
    // Character emoji mapping
    const characterEmojis = {
        mouse: '🐭',
        apple: '🍎',
        fish: '🐟'
    };
    
    // Initialize canvas size
    function resizeCanvas() {
        gameCanvas.width = gameCanvas.offsetWidth;
        gameCanvas.height = gameCanvas.offsetHeight;
        generateTargets();
    }
    
    // Handle character selection
    characterOptions.forEach(option => {
        option.addEventListener('click', function() {
            characterOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedCharacter = this.getAttribute('data-character');
        });
    });
    
    // Handle angle selection
    angleSlider.addEventListener('input', function() {
        launchAngle = parseInt(this.value);
        angleValue.textContent = launchAngle;
        updateTrajectoryLine();
    });
    
    // Update trajectory line visualization
    function updateTrajectoryLine() {
        const radians = (90 - launchAngle) * Math.PI / 180;
        trajectoryLine.style.transform = `rotate(${-launchAngle}deg)`;
    }
    
    // Fire button event
    fireButton.addEventListener('click', function() {
        if (!isLaunching) {
            launchProjectile();
        }
    });
    
    // Launch the projectile
    function launchProjectile() {
        if (isLaunching) return;
        
        isLaunching = true;
        
        const radians = launchAngle * Math.PI / 180;
        
        projectile = {
            x: CHARACTER_SIZE,
            y: gameCanvas.height - CHARACTER_SIZE,
            velocityX: Math.cos(radians) * INITIAL_VELOCITY,
            velocityY: -Math.sin(radians) * INITIAL_VELOCITY,
            character: selectedCharacter
        };
        
        if (!animationId) {
            lastTime = performance.now();
            animationLoop();
        }
    }
    
    // Generate random targets
    function generateTargets() {
        targets = [];
        
        for (let i = 0; i < TARGET_COUNT; i++) {
            const x = gameCanvas.width * 0.6 + Math.random() * (gameCanvas.width * 0.3);
            const y = gameCanvas.height * 0.3 + Math.random() * (gameCanvas.height * 0.6);
            
            targets.push({
                x,
                y,
                hit: false
            });
        }
    }
    
    // Check for collision between projectile and targets
    function checkCollisions() {
        if (!projectile) return;
        
        targets.forEach(target => {
            if (!target.hit) {
                const dx = projectile.x - target.x;
                const dy = projectile.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < CHARACTER_SIZE / 2 + TARGET_SIZE / 2) {
                    target.hit = true;
                    score++;
                    scoreDisplay.textContent = score;
                }
            }
        });
    }
    
    // Main animation loop
    function animationLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Draw targets
        targets.forEach(target => {
            ctx.beginPath();
            ctx.fillStyle = target.hit ? '#ddd' : '#ff9800';
            ctx.arc(target.x, target.y, TARGET_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b26a00';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // Update and draw projectile
        if (projectile) {
            // Update position
            projectile.x += projectile.velocityX * deltaTime;
            projectile.y += projectile.velocityY * deltaTime;
            projectile.velocityY += GRAVITY * deltaTime;
            
            // Draw character
            ctx.font = `${CHARACTER_SIZE}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(characterEmojis[projectile.character], projectile.x, projectile.y);
            
            // Check for collisions
            checkCollisions();
            
            // Check if projectile is out of bounds
            if (projectile.y > gameCanvas.height + CHARACTER_SIZE || 
                projectile.x < -CHARACTER_SIZE || 
                projectile.x > gameCanvas.width + CHARACTER_SIZE) {
                
                // Reset the game state
                projectile = null;
                isLaunching = false;
                
                // Check if all targets are hit
                const allTargetsHit = targets.every(target => target.hit);
                if (allTargetsHit) {
                    generateTargets();
                }
            }
        }
        
        // Draw launching point
        ctx.beginPath();
        ctx.fillStyle = '#e53935';
        ctx.arc(CHARACTER_SIZE, gameCanvas.height - CHARACTER_SIZE, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Continue animation loop
        animationId = requestAnimationFrame(animationLoop);
    }
    
    // Initialize game
    function init() {
        resizeCanvas();
        updateTrajectoryLine();
        window.addEventListener('resize', resizeCanvas);
    }
    
    init();
});