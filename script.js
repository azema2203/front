let currentUser = null;
let currentGame = null;
let gameInterval = null;
let matchTimer = null;
let matchTimeLeft = 0;

function init() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
        showDashboard();
    }
}

function switchToRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authError').textContent = '';
}

function switchToLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('authError').textContent = '';
}

function register() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    
    if (!username || !password) {
        document.getElementById('authError').textContent = 'Заполните все поля!';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
        document.getElementById('authError').textContent = 'Пользователь уже существует!';
        return;
    }
    
    users[username] = {
        password: password,
        coins: 50,
        skin: 'kitten',
        ownedSkins: ['kitten'],
        lastSpin: null,
        scores: { dino: 0, snake: 0, collect: 0, jump: 0, match: 0, catch: 0 }
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = { username, ...users[username] };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    
    showDashboard();
}
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (!users[username] || users[username].password !== password) {
        document.getElementById('authError').textContent = 'Неверное имя или пароль!';
        return;
    }
    
    currentUser = { username, ...users[username] };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard();
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showScreen('loginScreen');
}

function saveUserData() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[currentUser.username] = {
        password: users[currentUser.username].password,
        coins: currentUser.coins,
        skin: currentUser.skin,
        ownedSkins: currentUser.ownedSkins,
        lastSpin: currentUser.lastSpin,
        scores: currentUser.scores
    };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showDashboard() {
    showScreen('dashboardScreen');
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    document.getElementById('coinsDisplay').textContent = currentUser.coins;
    
    Object.keys(currentUser.scores).forEach(game => {
        const el = document.getElementById(`score-${game}`);
        if (el) el.textContent = currentUser.scores[game];
    });
    
    checkWheelAvailability();
    createHearts();
    drawWheel(0);
}

function createHearts() {
    const banner = document.getElementById('welcomeBanner');
    banner.querySelectorAll('.heart').forEach(h => h.remove());
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.textContent = '💕';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 2 + 's';
            banner.appendChild(heart);
        }, i * 300);
    }
}

function backToDashboard() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    if (matchTimer) {
        clearInterval(matchTimer);
        matchTimer = null;
    }
    
    const timerElement = document.querySelector('.timer');
    if (timerElement) {
        timerElement.remove();
    }
    
    showDashboard();
}

function drawWheel(rotation) {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = 175;
    const centerY = 175;
    const radius = 160;
    
    const segments = [
        { coins: 10, color: '#ff69b4' },
        { coins: 50, color: '#ffd700' },
        { coins: 20, color: '#ff1493' },
        { coins: 30, color: '#ffb6c1' },
        { coins: 40, color: '#ff69b4' }
    ];
    
    const anglePerSegment = (Math.PI * 2) / segments.length;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const startOffset = -Math.PI / 2;
    
    segments.forEach((seg, i) => {
        const startAngle = i * anglePerSegment + rotation + startOffset;
        const endAngle = startAngle + anglePerSegment;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Quicksand';
        ctx.fillText(`${seg.coins}🪙`, radius * 0.65, 0);
        ctx.restore();
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    ctx.fillStyle = '#ff69b4';
    ctx.font = 'bold 20px Quicksand';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Крути!', centerX, centerY);
}

function checkWheelAvailability() {
    const today = new Date().toDateString();
    const btn = document.getElementById('spinBtn');
    
    if (currentUser && currentUser.lastSpin === today) {
        btn.disabled = true;
        btn.textContent = 'Приходи завтра!';
    } else {
        btn.disabled = false;
        btn.textContent = 'Крутить!';
    }
}

function spinWheel() {
    const btn = document.getElementById('spinBtn');
    const canvas = document.getElementById('wheelCanvas');
    
    btn.disabled = true;
    
    canvas.classList.add('wheel-spinning');
    
    const segments = [10, 50, 20, 30, 40];
    const segmentsCount = segments.length;
    const anglePerSegment = 360 / segmentsCount;
    
    const winningIndex = Math.floor(Math.random() * segmentsCount);
    const coins = segments[winningIndex];
   
    const targetAngleDeg = 360 - (winningIndex * anglePerSegment + anglePerSegment / 2);
  
    const fullSpins = 5;
    const totalAngleDeg = fullSpins * 360 + targetAngleDeg;
    
    const duration = 3000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = totalAngleDeg * Math.PI / 180 * easeOut;
        
        drawWheel(currentRotation);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                canvas.classList.remove('wheel-spinning');
                
                if (currentUser) {
                    currentUser.coins += coins;
                    currentUser.lastSpin = new Date().toDateString();
                    saveUserData();
                   
                    document.getElementById('coinsDisplay').textContent = currentUser.coins;
                   
                    alert(`🎉 Ты выиграл ${coins} монет!`);
                
                    createConfetti();
                }
                
                checkWheelAvailability();
            }, 500);
        }
    }
    
    animate();
}

function createConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700', '#87ceeb'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '9999';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)'
            });
            
            animation.onfinish = () => confetti.remove();
        }, i * 20);
    }
}
function showProfile() {
    showScreen('profileScreen');
    document.getElementById('profileCoins').textContent = currentUser.coins;
    
    document.querySelectorAll('.skin-card').forEach(card => {
        const skin = card.dataset.skin;
        if (currentUser.ownedSkins.includes(skin)) {
            card.classList.remove('locked');
            if (currentUser.skin === skin) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
    });
}

function changeName() {
    const newName = document.getElementById('newUsername').value.trim();
    if (!newName) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[newName]) {
        alert('Это имя уже занято!');
        return;
    }
    
    const oldData = users[currentUser.username];
    delete users[currentUser.username];
    users[newName] = oldData;
    currentUser.username = newName;
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    alert('Имя изменено!');
    document.getElementById('newUsername').value = '';
}

function selectSkin(skin, cost) {
    if (currentUser.ownedSkins.includes(skin)) {
        currentUser.skin = skin;
        saveUserData();
        showProfile();
        return;
    }
    
    if (currentUser.coins >= cost) {
        currentUser.coins -= cost;
        currentUser.ownedSkins.push(skin);
        currentUser.skin = skin;
        saveUserData();
        showProfile();
    } else {
        alert('Недостаточно монет!');
    }
}

function getSkinEmoji() {
    const skins = { kitten: '🐱', princess: '👸', prince: '🤴' };
    return skins[currentUser.skin] || '🐱';
}

function startGame(game) {
    currentGame = game;
    showScreen('gameScreen');
    
    const titles = {
        dino: 'Go Dino, Go',
        snake: 'Snake',
        collect: 'Collect sweets',
        jump: 'Star Jump',
        match: 'Match pairs',
        catch: 'Catch balloons'
    };
    
    const instructions = {
        dino: 'Нажми ПРОБЕЛ чтобы прыгать! Избегай сладости',
        snake: 'Используй стрелки для управления, собирай кексики',
        collect: 'Двигай мышкой, собирай сладости, избегай бомбочек 💣',
        jump: 'Двигай мышкой чтобы ловить звезду ⭐',
        match: 'Найди все пары карточек за 60 секунд!',
        catch: 'Лови шарики мышкой, у тебя 3 жизни!'
    };
    
    document.getElementById('gameTitle').textContent = titles[game];
    document.getElementById('gameInstructions').textContent = instructions[game];
    document.getElementById('currentScore').textContent = '0';
    
    if (matchTimer) {
        clearInterval(matchTimer);
        matchTimer = null;
    }
    
    switch(game) {
        case 'dino': runDinoGame(); break;
        case 'snake': runSnakeGame(); break;
        case 'collect': runCollectGame(); break;
        case 'jump': runJumpGame(); break;
        case 'match': runMatchGame(); break;
        case 'catch': runCatchGame(); break;
    }
}

function restartCurrentGame() {
    if (currentGame) {
        startGame(currentGame);
    }
}

function updateScore(score) {
    document.getElementById('currentScore').textContent = score;
    if (score > currentUser.scores[currentGame]) {
        currentUser.scores[currentGame] = score;
        saveUserData();
    }
}

function gameOver(finalScore) {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    if (matchTimer) {
        clearInterval(matchTimer);
        matchTimer = null;
    }
    setTimeout(() => {
        alert(`Игра окончена! Счёт: ${finalScore}`);
    }, 100);
}

function runDinoGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let player = { x: 50, y: 300, w: 40, h: 40, jumping: false, velocity: 0 };
    let obstacles = [];
    let nextObstacleDistance = 150 + Math.random() * 150;
    let distanceTraveled = 0;
    let gameRunning = true;
    
    function jump() {
        if (!player.jumping) {
            player.jumping = true;
            player.velocity = -15;
        }
    }
    
    const keyHandler = (e) => {
        if (e.code === 'Space' && gameRunning) {
            e.preventDefault();
            jump();
        }
    };
    
    document.addEventListener('keydown', keyHandler);
    
    function update() {
        if (!gameRunning) {
            document.removeEventListener('keydown', keyHandler);
            return;
        }
        
        ctx.fillStyle = '#fff0f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffb6c1';
        ctx.fillRect(0, 340, canvas.width, 5);
        
        if (player.jumping) {
            player.velocity += 0.8;
            player.y += player.velocity;
            if (player.y >= 300) {
                player.y = 300;
                player.jumping = false;
                player.velocity = 0;
            }
        }
        
        ctx.font = '40px Arial';
        ctx.fillText(getSkinEmoji(), player.x, player.y + 40);
        
        distanceTraveled += 5;
        if (distanceTraveled >= nextObstacleDistance) {
            obstacles.push({ x: canvas.width, y: 310, w: 30, h: 30 });
            nextObstacleDistance = 150 + Math.random() * 150;
            distanceTraveled = 0;
        }
        
        obstacles.forEach((obs, i) => {
            obs.x -= 5;
            ctx.font = '30px Arial';
            ctx.fillText(['🧁', '🍰', '🎂'][i % 3], obs.x, obs.y + 30);
            
            if (obs.x < player.x + player.w && obs.x + obs.w > player.x &&
                obs.y < player.y + player.h && obs.y + obs.h > player.y) {
                gameRunning = false;
                gameOver(score);
            }
            
            if (obs.x < 0) {
                obstacles.splice(i, 1);
                score++;
                updateScore(score);
            }
        });
        
        if (gameRunning) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

function runSnakeGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let snake = [{ x: 300, y: 200 }];
    let dx = 20, dy = 0;
    let food = { x: 400, y: 200 };
    let gameRunning = true;
    
    const keyHandler = (e) => {
        if (!gameRunning) return;
        if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -20; }
        if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 20; }
        if (e.key === 'ArrowLeft' && dx === 0) { dx = -20; dy = 0; }
        if (e.key === 'ArrowRight' && dx === 0) { dx = 20; dy = 0; }
    };
    
    document.addEventListener('keydown', keyHandler);
    
    function update() {
        if (!gameRunning) {
            document.removeEventListener('keydown', keyHandler);
            return;
        }
        
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            gameRunning = false;
            gameOver(score);
            return;
        }
        
        for (let part of snake) {
            if (part.x === head.x && part.y === head.y) {
                gameRunning = false;
                gameOver(score);
                return;
            }
        }
        
        snake.unshift(head);
        
        if (head.x === food.x && head.y === food.y) {
            score++;
            updateScore(score);
            food.x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
            food.y = Math.floor(Math.random() * (canvas.height / 20)) * 20;
        } else {
            snake.pop();
        }
        
        ctx.fillStyle = '#fff0f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillText(getSkinEmoji(), snake[0].x, snake[0].y + 20);
        
        ctx.fillStyle = '#ffb6c1';
        for (let i = 1; i < snake.length; i++) {
            ctx.beginPath();
            ctx.arc(snake[i].x + 10, snake[i].y + 10, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.font = '25px Arial';
        ctx.fillText('🧁', food.x, food.y + 20);
    }
    
    gameInterval = setInterval(update, 150);
}

function runCollectGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let player = { x: 300, y: 350, w: 40, h: 40 };
    let items = [];
    let gameRunning = true;
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left - player.w / 2;
    });
    
    function update() {
        if (!gameRunning) return;
        
        ctx.fillStyle = '#fff0f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (Math.random() < 0.03) {
            const isBomb = Math.random() < 0.2;
            items.push({ 
                x: Math.random() * (canvas.width - 30), 
                y: 0, 
                w: 30, 
                h: 30,
                isBomb: isBomb
            });
        }
        
        items.forEach((item, i) => {
            item.y += 3;
            ctx.font = '30px Arial';
            
            if (item.isBomb) {
                ctx.fillText('💣', item.x, item.y + 30);
            } else {
                ctx.fillText(['🍰', '🧁', '🍪', '🍩'][i % 4], item.x, item.y + 30);
            }
            
            if (item.x < player.x + player.w && item.x + item.w > player.x &&
                item.y < player.y + player.h && item.y + item.h > player.y) {
                items.splice(i, 1);
                
                if (item.isBomb) {
                    gameRunning = false;
                    gameOver(score);
                } else {
                    score++;
                    updateScore(score);
                }
            }
            
            if (item.y > canvas.height) {
                items.splice(i, 1);
            }
        });
        
        ctx.font = '40px Arial';
        ctx.fillText(getSkinEmoji(), player.x, player.y + 40);
        
        if (gameRunning) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

function runJumpGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let gameRunning = true;
    let combo = 0;
    let maxCombo = 0;
    let lastDifficultyIncrease = 0; 
    
    let platform = {
        x: canvas.width / 2 - 80,
        y: canvas.height - 50,
        w: 160,
        h: 20,
        color: '#ff69b4',
        glow: false
    };
    
    let star = {
        x: canvas.width / 2 - 20,
        y: canvas.height - 150,
        w: 40,
        h: 40,
        vx: 3,
        vy: -12,
        gravity: 0.5,
        bounce: 0.88,
        wallBounce: 0.7,
        rotation: 0,
        glow: true
    };
    
    let particles = [];
    
    canvas.addEventListener('mousemove', (e) => {
        if (!gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        platform.x = mouseX - platform.w / 2;
        
        if (platform.x < 0) platform.x = 0;
        if (platform.x > canvas.width - platform.w) {
            platform.x = canvas.width - platform.w;
        }
    });
    
    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: color,
                life: 30
            });
        }
    }
    
    function update() {
        if (!gameRunning) return;
        
        ctx.fillStyle = '#fff0f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        });
        
        star.vy += star.gravity;
        star.y += star.vy;
        star.x += star.vx;
        star.rotation += 0.08;
      
        if (star.x + star.w >= canvas.width) {
            star.x = canvas.width - star.w;
            star.vx = -Math.abs(star.vx) * star.wallBounce; 
            createParticles(star.x + star.w, star.y + star.h/2, '#FFD700', 10);
            combo++;
        }
        
        if (star.x <= 0) {
            star.x = 0;
            star.vx = Math.abs(star.vx) * star.wallBounce; 
            createParticles(star.x, star.y + star.h/2, '#FFD700', 10);
            combo++;
        }
        
        if (star.y <= 0) {
            star.y = 0;
            star.vy = Math.abs(star.vy) * star.wallBounce; 
            createParticles(star.x + star.w/2, star.y, '#FFD700', 10);
            combo++;
            
            if (combo > maxCombo) maxCombo = combo;
        }
        
        
        if (star.y + star.h >= platform.y && 
            star.y <= platform.y + platform.h &&
            star.x + star.w >= platform.x && 
            star.x <= platform.x + platform.w &&
            star.vy > 0) { 
            
            const platformCenter = platform.x + platform.w / 2;
            const starCenter = star.x + star.w / 2;
            const hitPosition = (starCenter - platformCenter) / (platform.w / 2);
            
            star.vy = -15 * star.bounce;
            
            star.vx += hitPosition * 6;
            
            if (Math.abs(star.vx) > 8) star.vx = 8 * Math.sign(star.vx);
           
            score++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            updateScore(score);
            
            platform.glow = true;
            star.glow = true;
            createParticles(star.x + star.w/2, star.y + star.h, '#ff69b4', 15);
            
            setTimeout(() => {
                platform.glow = false;
                star.glow = false;
            }, 150);
            
            if (score > 0 && score % 10 === 0 && score !== lastDifficultyIncrease) {
                lastDifficultyIncrease = score;
                
                star.gravity += 0.08;
                
                star.bounce *= 0.96;
                
                star.vx *= 1.15;
                
                if (platform.w > 100) {
                    platform.w -= 5;
                }
                
                createParticles(canvas.width / 2, canvas.height / 2, '#ff1493', 30);
                
                ctx.fillStyle = '#ff1493';
                ctx.font = 'bold 40px Quicksand';
                ctx.textAlign = 'center';
                ctx.fillText('УРОВЕНЬ ВЫШЕ! 🔥', canvas.width / 2, canvas.height / 2);
            }
        }
       
        if (star.y > canvas.height) {
            gameRunning = false;
            setTimeout(() => {
                gameOver(score);
            }, 100);
            return;
        }
        
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 30;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        if (platform.glow) {
            ctx.shadowColor = '#ff1493';
            ctx.shadowBlur = 20;
        }
        
        ctx.fillStyle = platform.color;
        ctx.beginPath();
        ctx.roundRect(platform.x, platform.y, platform.w, platform.h, 10);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(star.x + star.w/2, star.y + star.h/2);
        ctx.rotate(star.rotation);
        
        if (star.glow) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 25;
        }
        
        ctx.font = '40px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', 0, 0);
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(getSkinEmoji(), platform.x + platform.w/2, platform.y - 25);
        
        const level = Math.floor(score / 10) + 1;
        ctx.fillStyle = '#ff69b4';
        ctx.font = 'bold 20px Quicksand';
        ctx.textAlign = 'left';
        ctx.fillText(`Уровень: ${level}`, 10, 30);
        
        if (star.vy < 2 && star.vy > -2) {
            combo = 0;
        }
        
        if (gameRunning) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

function runMatchGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const symbols = ['💕', '🎀', '🌸', '⭐', '🍰', '🧁'];

    let cards = [];
    symbols.forEach(symbol => {
        cards.push(symbol);
        cards.push(symbol);
    });
    
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    let revealed = Array(12).fill(false);
    let first = null, second = null;
    let score = 0;
    let matches = 0;
    let canClick = true;
    let gameRunning = true;
  
    matchTimeLeft = 60;
    const timerElement = document.createElement('div');
    timerElement.className = 'timer';
    timerElement.style.cssText = `
        font-size: 1.5em;
        font-weight: bold;
        color: #ff1493;
        margin: 15px 0;
        padding: 10px;
        background: #fff0f5;
        border-radius: 10px;
        border: 2px solid #ff69b4;
    `;
    timerElement.textContent = `⏰ Время: ${matchTimeLeft} сек`;
    document.querySelector('.game-canvas-container').insertBefore(timerElement, document.querySelector('.game-controls'));
    
    matchTimer = setInterval(() => {
        if (!gameRunning) return;
        
        matchTimeLeft--;
        timerElement.textContent = `⏰ Время: ${matchTimeLeft} сек`;
        
        if (matchTimeLeft <= 0) {
            gameRunning = false;
            clearInterval(matchTimer);
            setTimeout(() => {
                alert(`⏰ Время вышло! Твой счет: ${score}`);
                gameOver(score);
            }, 100);
        }
    }, 1000);
    
    canvas.addEventListener('click', (e) => {
        if (!canClick || second !== null || !gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
      
        const col = Math.floor((x - 10) / 150);
        const row = Math.floor((y - 10) / 133);
        const idx = row * 4 + col;
        
        if (idx < 0 || idx >= 12 || revealed[idx]) return;
        
        const cardX = col * 150 + 10;
        const cardY = row * 133 + 10;
        if (x < cardX || x > cardX + 130 || y < cardY || y > cardY + 113) {
            return; 
        }

        if (first === null) {
            first = idx;
            revealed[idx] = true;
            draw();
        } else {
            second = idx;
            revealed[idx] = true;
            draw();
            canClick = false;

            setTimeout(() => {
                if (cards[first] === cards[second]) {
                    matches++;
                    score += 10;
                    updateScore(score);
                    
                    if (matches === 6) {
                        gameRunning = false;
                        clearInterval(matchTimer);
                    
                        const timeBonus = matchTimeLeft;
                        const finalScore = score + timeBonus;
                        
                        updateScore(finalScore);
                        
                        setTimeout(() => {
                            gameOver(finalScore);
                        }, 100);
                    }
                } else {
                    revealed[first] = false;
                    revealed[second] = false;
                }
                first = null;
                second = null;
                canClick = true;
                draw();
            }, 800);
        }
    });
    
    function draw() {
        ctx.fillStyle = '#fff0f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 12; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = col * 150 + 10;
            const y = row * 133 + 10;
          
            if (revealed[i]) {
               
                ctx.fillStyle = '#fff';
                ctx.fillRect(x, y, 130, 113);
                ctx.strokeStyle = '#ff69b4';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, 130, 113);
                
                ctx.font = '60px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ff69b4';
                ctx.fillText(cards[i], x + 65, y + 56);
            } else {
                
                ctx.fillStyle = '#ffb6c1';
                ctx.fillRect(x, y, 130, 113);
                ctx.strokeStyle = '#ff69b4';
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, 130, 113);
                
               
                ctx.font = 'bold 50px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText('?', x + 65, y + 56);
            }
        }
    }
    
    draw();
    
    window.addEventListener('resize', draw);
}


function runCatchGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let lives = 3;
    let player = { x: 300, y: 350, w: 80, h: 50 };
    let balloons = [];
    let gameRunning = true;
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left - player.w / 2;
    });
    
    canvas.addEventListener('click', (e) => {
        if (!gameRunning) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        balloons.forEach((b, i) => {
            if (clickX >= b.x && clickX <= b.x + b.w &&
                clickY >= b.y && clickY <= b.y + b.h) {
                balloons.splice(i, 1);
                score++;
                updateScore(score);
            }
        });
    });
    
    function update() {
        if (!gameRunning) return;
        
        ctx.fillStyle = '#fff0f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff69b4';
        ctx.font = '20px Quicksand';
        ctx.fillText(`❤️ Жизни: ${lives}`, 10, 30);
        
        if (Math.random() < 0.01) {
            balloons.push({ 
                x: Math.random() * (canvas.width - 30), 
                y: 0, 
                w: 30, 
                h: 40, 
                speed: 2 + Math.random() * 2
            });
        }
        
        balloons.forEach((b, i) => {
            b.y += b.speed;
            ctx.font = '35px Arial';
            ctx.fillText('🎈', b.x, b.y + 35);
            
            if (b.x < player.x + player.w - 20 && b.x + b.w > player.x + 20 &&
                b.y < player.y + player.h && b.y + b.h > player.y) {
                balloons.splice(i, 1);
                score++;
                updateScore(score);
            }
            
            if (b.y > canvas.height) {
                balloons.splice(i, 1);
                lives--;
                if (lives <= 0) {
                    gameRunning = false;
                    gameOver(score);
                }
            }
        });
        
        ctx.font = '50px Arial';
        ctx.fillText(getSkinEmoji(), player.x, player.y + 50);
        
        if (gameRunning) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

init();