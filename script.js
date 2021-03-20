// CLASS DEFINITIONS
class Shot {
	constructor(shotX, shotY) {
		this.shotX = shotX;
		this.shotY = shotY;
	}
}

class Enemy {
	constructor() {
		this.enemyImg = rndInt(1, 3);
		this.enemyX = rndInt(
			canvas.width / 2 - canvas.width / 4,
			canvas.width / 2 + canvas.width / 4
		);
		this.enemyY = rndInt(0, 50);
		this.enemyDx = rndInt(0, 3);
		this.enemyDxDir = rndInt(1, 2);
		this.enemyDy = rndInt(3, 4);
		this.enemyAlive = true;
	}
}

// HELPER FUNCTION: LOAD IMAGES
function loadImages(images, callback) {
	let name,
		result = {},
		count = images.length;
	let onload = function () {
		count--;
		if (count == 0) {
			callback(result);
		}
	};

	for (let i = 0; i < images.length; i++) {
		name = images[i];
		result[name] = new Image();
		result[name].addEventListener("load", onload);
		result[name].src = `${name}.png`;
	}
}
// HELPER FUNCTION: LOAD SOUNDS
function loadSounds(sounds, callback) {
	let name,
		result = {},
		count = sounds.length;
	let canplay = function () {
		count--;
		if (count == 0) {
			callback(result);
		}
	};

	for (let i = 0; i < sounds.length; i++) {
		name = sounds[i];
		result[name] = new Audio();
		result[name].addEventListener("canplay", canplay, false);
		result[name].src = `${name}.mp3`;
	}
}
// HELPER FUNCTION: GET RANDOM INT (MIN AND MAX INCLUSIVE)
function rndInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let images = ["background", "ship", "enemy1", "enemy2", "enemy3", "explosion"];
let background1;
let background2;
let ship;
let enemy1;
let enemy2;
let enemy3;
let explosion;

let sounds = ["music", "laser", "explosion", "kill"];
let music;
let laser;
let explosionSound;
let kill;

let play = false;

let background1X = 0;
let background1Y = 0;
let backgroundSpeed = 2;

let shipAlive = true;
let shipX = canvas.width / 2;
let shipY = 500;
let shipSpeed = 4;
let shipDx = 0;
let shipDy = 0;

let shots = [];
let shotColor = "lightgreen";
let shotSpeed = 5;
let shotWidth = 3;
let shotHeight = 6;

let enemies = [];

let score = 0;
let counter = 0;

// EVENT LISTENERS FOR KEY INPUT
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
function keyDown(e) {
	if (play && shipAlive) {
		if (e.keyCode === 37) {
			shipDx = -shipSpeed;
		}
		if (e.keyCode === 39) {
			shipDx = +shipSpeed;
		}
		if (e.keyCode === 38) {
			shipDy = -shipSpeed;
		}
		if (e.keyCode === 40) {
			shipDy = +shipSpeed;
		}
	}
	if (e.keyCode === 32) {
		if (play && shipAlive) {
			shoot();
		}
		if (!play) {
			gamePlay();
		}
	}
	if (play && !shipAlive) {
		if (e.keyCode === 82) {
			gameRestart();
		}
	}
}

function keyUp(e) {
	if (e.keyCode === 37) {
		shipDx = 0;
	}
	if (e.keyCode === 39) {
		shipDx = 0;
	}
	if (e.keyCode === 38) {
		shipDy = 0;
	}
	if (e.keyCode === 40) {
		shipDy = 0;
	}
}

loadImages(images, run);

function run(images) {
	background1 = images.background;
	background2 = background1;
	ship = images.ship;
	shipX = canvas.width / 2 - ship.width / 2;
	enemy1 = images.enemy1;
	enemy2 = images.enemy2;
	enemy3 = images.enemy3;
	explosion = images.explosion;
	loadSounds(sounds, init);
}

function init(sounds) {
	music = sounds.music;
	laser = sounds.laser;
	explosionSound = sounds.explosion;
	kill = sounds.kill;
	window.requestAnimationFrame(gameLoop);
}

function gamePlay() {
	play = true;
	music.pause();
	music.currentTime = 0;
	music.play();
}

function gameRestart() {
	music.pause();
	music.currentTime = 0;
	music.play();
	background1X = 0;
	background1Y = 0;
	shipAlive = true;
	shipX = canvas.width / 2;
	shipY = 500;
	shipDx = 0;
	shipDy = 0;
	shots = [];
	enemies = [];
	score = 0;
	counter = 0;
}

// GAME LOOP
function gameLoop() {
	if (!play) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(background1, 0, 0);
		ctx.fillStyle = "white";
		ctx.font = "40px Audiowide";
		ctx.textAlign = "center";
		ctx.fillText("Press space to play", canvas.width / 2, 290);
	}
	if (play && shipAlive) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		update();
		draw();
		ctx.fillStyle = "white";
		ctx.font = "15px Audiowide";
		ctx.textAlign = "center";
		ctx.fillText("Score: " + score, 670, 20);
	}
	if (play && !shipAlive) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		update();
		draw();
		ctx.fillStyle = "white";
		ctx.font = "15px Audiowide";
		ctx.textAlign = "center";
		ctx.fillText("Score: " + score, 670, 20);
		ctx.font = "50px Audiowide";
		ctx.textAlign = "center";
		ctx.fillText("Game Over", canvas.width / 2, 270);
		ctx.font = "20px Audiowide";
		ctx.fillText('Press "R" to restart', canvas.width / 2, 340);
	}
	window.requestAnimationFrame(gameLoop);
}

// Update game
function update() {
	updateBackground();
	updateShip();
	updateShots();
	updateEnemies();
	shotCollisions();
	shipCollisions();
}

// Draw game
function draw() {
	drawBackground();
	drawShip();
	drawShots();
	drawEnemies();
}

// CHECK COLLISIONS
// Helper function: Check if 2 rectangles intersect
function intersectRect(r1, r2) {
	return !(
		r2.left > r1.right ||
		r2.right < r1.left ||
		r2.top > r1.bottom ||
		r2.bottom < r1.top
	);
}

function shotCollisions() {
	for (let i = 0; i < enemies.length; i++) {
		let imgRight;
		let imgBottom;
		if (enemies[i].enemyImg === 1) {
			imgRight = enemy1.width;
			imgBottom = enemy1.height;
		}
		if (enemies[i].enemyImg === 2) {
			imgRight = enemy2.width;
			imgBottom = enemy2.height;
		}
		if (enemies[i].enemyImg === 3) {
			imgRight = enemy3.width;
			imgBottom = enemy3.height;
		}
		let r1 = {
			left: enemies[i].enemyX,
			top: enemies[i].enemyY,
			right: enemies[i].enemyX + imgRight,
			bottom: enemies[i].enemyY + imgBottom,
		};
		for (let j = 0; j < shots.length; j++) {
			let r2 = { left: 0, top: 0, right: 0, bottom: 0 };
			r2.left = shots[j].shotX;
			r2.top = shots[j].shotY;
			r2.right = shots[j].shotX + shotWidth;
			r2.bottom = shots[j].shotY + shotHeight;
			if (intersectRect(r1, r2)) {
				enemies[i].enemyAlive = false;
				shots.splice(j, 1);
				kill.pause();
				kill.currentTime = 0;
				kill.play();
				score += 5;
			}
		}
	}
}

function shipCollisions() {
	let shipRect = {
		left: shipX,
		top: shipY,
		right: shipX + ship.width,
		bottom: shipY + ship.height,
	};
	let enemyRect = { left: 0, top: 0, right: 0, bottom: 0 };

	for (let i = 0; i < enemies.length; i++) {
		let imgRight;
		let imgBottom;
		if (enemies[i].enemyImg === 1) {
			imgRight = enemy1.width;
			imgBottom = enemy1.height;
		}
		if (enemies[i].enemyImg === 2) {
			imgRight = enemy2.width;
			imgBottom = enemy2.height;
		}
		if (enemies[i].enemyImg === 3) {
			imgRight = enemy3.width;
			imgBottom = enemy3.height;
		}
		enemyRect.left = enemies[i].enemyX;
		enemyRect.top = enemies[i].enemyY;
		enemyRect.right = enemies[i].enemyX + imgRight;
		enemyRect.bottom = enemies[i].enemyY + imgBottom;
		if (intersectRect(shipRect, enemyRect)) {
			shipAlive = false;
			explosionSound.play();
			music.pause();
		}
	}
}

function shoot() {
	laser.pause();
	laser.currentTime = 0;
	laser.play();
	let shot = new Shot(shipX + ship.width / 2 - shotWidth / 2, shipY);
	shots.push(shot);
}

function createEnemies() {
	for (let i = 0; i < counter * 2; i++) {
		let enemy = new Enemy();
		enemies.push(enemy);
	}
}

// Update and draw enemies
function updateEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		let xDir;
		if (enemies[i].enemyDxDir === 1) {
			xDir = 1;
		} else {
			xDir = -1;
		}
		enemies[i].enemyX += enemies[i].enemyDx * xDir;
		enemies[i].enemyY += enemies[i].enemyDy;
		if (
			enemies[i].enemyX < 0 ||
			enemies[i].enemyX > canvas.width ||
			enemies[i].enemyY > canvas.height ||
			enemies[i].enemyAlive === false
		) {
			enemies.splice(i, 1);
		}
	}
}

function drawEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		let image;
		if (enemies[i].enemyImg === 1) {
			image = enemy1;
		}
		if (enemies[i].enemyImg === 2) {
			image = enemy2;
		}
		if (enemies[i].enemyImg === 3) {
			image = enemy3;
		}
		ctx.drawImage(image, enemies[i].enemyX, enemies[i].enemyY);
	}
}

// Update and draw shots
function updateShots() {
	for (let i = 0; i < shots.length; i++) {
		shots[i].shotY -= shotSpeed;
		if (shots[i].shotY < 0) {
			shots.splice(i, 1);
		}
	}
}

function drawShots() {
	for (let i = 0; i < shots.length; i++) {
		ctx.fillStyle = shotColor;
		ctx.fillRect(shots[i].shotX, shots[i].shotY, shotWidth, shotHeight);
	}
}

// Update and draw ship
function updateShip() {
	if (shipX <= 0) {
		shipX = 0;
	}
	if (shipX + ship.width >= canvas.width) {
		shipX = canvas.width - ship.width;
	}
	shipX = shipX + shipDx;
	if (shipY <= 0) {
		shipY = 0;
	}
	if (shipY + ship.height >= canvas.height) {
		shipY = canvas.height - ship.height;
	}
	shipY = shipY + shipDy;
}

function drawShip() {
	if (shipAlive) {
		ctx.drawImage(ship, shipX, shipY);
	}
	if (!shipAlive) {
		ctx.drawImage(explosion, shipX, shipY);
	}
}

// Update and draw background
function updateBackground() {
	if (shipAlive) {
		background1Y += backgroundSpeed;
		if (background1Y >= canvas.height) {
			background1Y = 0;
			counter++;
			createEnemies();
		}
	}
}

function drawBackground() {
	ctx.drawImage(background1, background1X, background1Y);
	ctx.drawImage(background2, background1X, background1Y - background1.height);
}
