const gameArea = document.querySelector(".gameArea");
const player = document.querySelector(".playerCar");
const startMenu = document.getElementById("startMenu");
const gameOver = document.getElementById("gameOver");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const levelMsg = document.getElementById("levelMsg");
const highScoreText = document.getElementById("highScore");
const engineSound = document.getElementById("engineSound");
const crashSound = document.getElementById("crashSound");
const progressBar = document.getElementById("progressBar");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let keys = {};
let moveLeftActive = false;
let moveRightActive = false;
let score = 0;
let level = 1;
let baseSpeed = 3;
let speed = baseSpeed;
let levelTime = 0;   // seconds spent in current level (12s)
let isPlaying = false;
let roadPos = 0;
let highScore = localStorage.getItem("highScore") || 0;
let lastTime = Date.now();

highScoreText.innerText = "High Score: " + highScore;

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// LEFT BUTTON
leftBtn.addEventListener("touchstart", () => moveLeftActive = true);
leftBtn.addEventListener("touchend", () => moveLeftActive = false);

// RIGHT BUTTON
rightBtn.addEventListener("touchstart", () => moveRightActive = true);
rightBtn.addEventListener("touchend", () => moveRightActive = false);

// SWIPE CONTROLS
let startX = 0;

document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

document.addEventListener("touchmove", e => {
    let diff = e.touches[0].clientX - startX;
    if (diff > 30) moveRightActive = true;
    if (diff < -30) moveLeftActive = true;
});

document.addEventListener("touchend", () => {
    moveLeftActive = false;
    moveRightActive = false;
});

let enemies = [];
for (let i = 0; i < 2; i++) {
    let enemy = document.createElement("div");
    enemy.className = "enemyCar";
    enemy.style.left = Math.random() * 250 + "px";
    enemy.style.top = -100 * (i + 1) + "px";
    gameArea.appendChild(enemy);
    enemies.push(enemy);
}

function startGame() {
    startMenu.style.display = "none";
    isPlaying = true;
    engineSound.play();
    requestAnimationFrame(gamePlay);
}

function endGame() {
    isPlaying = false;
    engineSound.pause();
    crashSound.play();
    document.getElementById("finalScore").innerText = "Score: " + score;
    gameOver.style.display = "flex";
}

function restartGame() {
    location.reload();
}

function winGame() {
    isPlaying = false;
    engineSound.pause();
    confetti();

    gameOver.style.display = "flex";
    gameOver.innerHTML = `
        <img src="images/trophy.png" width="100">
        <h1 style="color:gold;">⭐⭐⭐ You Win..! ⭐⭐⭐</h1>
        <p>🏁 You completed all 5 levels</p>
        <p>Final Score: ${score}</p>
        <button onclick="restartGame()">Play Again</button>
    `;
}

function confetti() {
    for (let i = 0; i < 80; i++) {
        let dot = document.createElement("div");
        dot.style.position = "fixed";
        dot.style.width = "6px";
        dot.style.height = "6px";
        dot.style.background = `hsl(${Math.random() * 360},100%,50%)`;
        dot.style.top = "-10px";
        dot.style.left = Math.random() * 100 + "vw";
        dot.style.zIndex = "1000";
        document.body.appendChild(dot);

        let fall = setInterval(() => {
            dot.style.top = dot.offsetTop + 5 + "px";
            if (dot.offsetTop > window.innerHeight) {
                dot.remove();
                clearInterval(fall);
            }
        }, 20);
    }
}

function moveLeft() {
    player.style.left = Math.max(0, player.offsetLeft - 25) + "px";
}
function moveRight() {
    player.style.left = Math.min(250, player.offsetLeft + 25) + "px";
}

function isCollide(a, b) {
    let r1 = a.getBoundingClientRect();
    let r2 = b.getBoundingClientRect();
    return !(r1.bottom < r2.top || r1.top > r2.bottom || r1.right < r2.left || r1.left > r2.right);
}

function gamePlay() {
    if (!isPlaying) return;

    roadPos += speed;
    gameArea.style.backgroundPositionY = roadPos + "px";

    if ((keys["ArrowLeft"] || moveLeftActive) && player.offsetLeft > 0)
        player.style.left = player.offsetLeft - 5 + "px";

    if ((keys["ArrowRight"] || moveRightActive) && player.offsetLeft < 250)
        player.style.left = player.offsetLeft + 5 + "px";

    enemies.forEach(enemy => {
        enemy.style.top = enemy.offsetTop + speed + "px";
        if (enemy.offsetTop > 500) {
            enemy.style.top = "-100px";
            enemy.style.left = Math.random() * 250 + "px";
        }
        if (isCollide(player, enemy)) endGame();
    });

    score++;
    scoreText.innerText = "Score: " + score;

    // LEVEL TIMER
    let now = Date.now();
    if (now - lastTime >= 1000) {   // 1 second
        levelTime++;
        lastTime = now;
    }

    // Update progress bar
    progressBar.style.width = (levelTime / 12) * 100 + "%";

    // LEVEL PROGRESSION (12 seconds per level)
    if (levelTime >= 12) {   // 12 seconds per level
        levelTime = 0;
        if (level < 5) {      // Only 5 levels now
            level++;
            speed = Math.min(baseSpeed + level, 12);

            levelMsg.innerText = "🚦 Level " + level;
            progressBar.style.width = "0%";
            setTimeout(() => levelMsg.innerText = "", 1500);
        } else {
            // Level 5 reached → WIN
            winGame();
            return;
        }
    }

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreText.innerText = "High Score: " + highScore;
    }

    levelText.innerText = "Level: " + level;
    requestAnimationFrame(gamePlay);
}
