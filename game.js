var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', function(event){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
window.addEventListener('click', checkClick);

function mark(x, y) {
	ctx.beginPath();
	ctx.ellipse(x, y, 2, 2, 0, 0, 2*Math.PI);
	ctx.fillStyle = "#ffffff";
	ctx.fill();
	ctx.closePath();
}

class Star {
	constructor() {
		this.size = 5;
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
	}

	draw() {
		ctx.beginPath();
		ctx.ellipse(this.x, this.y, this.size, this.size, 0, 0, 2*Math.PI);
		ctx.fillStyle = "#fff";
		ctx.fill();
		ctx.closePath();
	}
}

class Ship {
	constructor(colour, scoreColour, target) {
		this.minSpeed = 2;
		this.maxSpeed = 10;
		this.acceleration = 0;
		this.score = 0;
		this.colour = colour;
		this.scoreColour = scoreColour;

		this.size = 15;
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
		this.v = this.minSpeed;
		this.dir = 0;
		this.turningRadius = 0.3;
		this.target = target;
	}

	draw() {
		ctx.beginPath();
		ctx.ellipse(this.x, this.y, this.size, this.size, this.dir + Math.PI/4, 0, (3/2) * Math.PI);
		ctx.lineTo(this.x, this.y);
		ctx.fillStyle = this.colour;
		ctx.fill();
		ctx.closePath();
	}

	drawScore() {
		ctx.font = "20px Arial";
		ctx.fillStyle = this.scoreColour;
		ctx.textAlign = "center";
		var newPosX = (this.size * 2) * Math.cos(this.dir);
		var newPosY = (this.size * 2) * Math.sin(this.dir);
		ctx.fillText(this.score, this.x + newPosX, this.y + newPosY);
	}

	move() {
		var newX = this.v * Math.cos(this.dir);
		var newY = this.v * Math.sin(this.dir);
		this.x += newX;
		this.y += newY;

		// Reset if out of canvas
		if (this.x > canvas.width) {
			this.x = 0;
		} else if (this.x < 0) {
			this.x = canvas.width;
		}
		if (this.y > canvas.height) {
			this.y = 0;
		} else if (this.y < 0) {
			this.y = canvas.height;
		}

		// Reset player velocity
		this.v += this.acceleration;
		this.acceleration = -0.1;
		if (this.v < this.minSpeed) {
			this.v = this.minSpeed;
		}
		if (this.v > this.maxSpeed) {
			this.v = this.maxSpeed;
		}
	}

	propel() {
		this.acceleration = 3;
	}

	moveRight() {
		this.dir += this.turningRadius;
	}

	moveLeft() {
		this.dir -= this.turningRadius;
	}

	// for opponent
	angleToTarget() {
		var newX = this.x + (this.v * Math.cos(this.dir));
		var newY = this.y + (this.v * Math.sin(this.dir));
		var angle = Math.atan2(this.target.y - this.y, this.target.x - this.x) -
                	Math.atan2(newY - this.y, newX - this.x);
    		return angle;
	}

	correctTrajectory() {
		var angle = this.angleToTarget(this.target);
		if (angle > -2 * Math.PI && angle < -Math.PI) {
			this.moveRight();
		} else if (angle > -Math.PI && angle < 0) {
			this.moveLeft();
		} else if (angle > 0 && angle < Math.PI) {
			this.moveRight();
		} else if (angle > Math.PI && angle < 2 * Math.PI) {
			this.moveLeft();
		}
	}

	newTarget(target) {
		this.target = target;
	}
}

var totalFood = 5;
var food = new Array();
for (var i = 0; i < totalFood; i++) {
	food.push(new Star());
}

var firstTargetIndex = Math.floor(Math.random() * 5);
var player = new Ship("#4fb0c6", "#eff7f9", null);
var opponent = new Ship("#17301c", "#e9ecea", food[firstTargetIndex]);
var timeLeft = 30;
var paused = false;
var ended = false;

var drawFunction = function() {};
var timerFunction = function() {};
var opponentMovementFunction = function() {};
animate();
document.addEventListener('visibilitychange', function(event) {
	if (document.hidden) {
		paused = true;
	}
}, false);

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawStats();
	for (var i = 0; i < totalFood; i++) {
		food[i].draw();
	}
	player.draw();
	opponent.draw();

	for (var i = 0; i < totalFood; i++) {
		if (collisionOccurred(player, food[i])) {
			player.score += 1;
			timeLeft += 3;
			var takenOpponentsTarget = food[i] == opponent.target;
			food.splice(i, 1);
			food.push(new Star());
			if (takenOpponentsTarget) {
				var newTargetIndex = Math.floor(Math.random() * 5);
				opponent.newTarget(food[newTargetIndex]);
			}
		}
		if (collisionOccurred(opponent, food[i])) {
			opponent.score += 1;
			food.splice(i, 1);
			food.push(new Star());
			var newTargetIndex = Math.floor(Math.random() * 5);
			opponent.newTarget(food[newTargetIndex]);
		}
	}

	player.move();
	opponent.move();

	// Check if paused
	if (paused) {
		ctx.font = "50px Arial";
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
		ctx.font = "20px Arial";
		ctx.fillText("Press R to resume", canvas.width/2, canvas.height/2 + 30);

		haltAnimation("pause");
	}
}

function timer() {
	timeLeft -= 1;
	if (timeLeft < 0) {
		ctx.font = "50px Arial";
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
		ctx.font = "20px Arial";
		var result = "";
		if (player.score == opponent.score) {
			result = "You tied (" + player.score + " all)";
		} else if (player.score > opponent.score) {
			result = "You won (" + player.score + "-" + opponent.score + ")";
		} else {
			result = "You lost (" + player.score + "-" + opponent.score + ")";
		}
		ctx.fillText(result, canvas.width/2, canvas.height/2 + 30);
		ctx.fillText("Press R or tap to restart", canvas.width/2, canvas.height/2 + 50);
		
		ended = true;
		haltAnimation("endgame");
	}
}

function opponentMovement() {
	var rand = Math.random();
	if (rand > 0.9 && Math.abs(opponent.angleToTarget()) < Math.PI / 12) {
		opponent.propel();
	} else {
		opponent.correctTrajectory();
	}
}

function collisionOccurred(ship, star) {
	var minDistanceAllowed = ship.size/2 + star.size/2;
	var currentDistance = Math.sqrt(Math.pow(ship.x - star.x, 2) + Math.pow(ship.y - star.y, 2));
	return currentDistance <= minDistanceAllowed;
}

function drawStats() {
	player.drawScore();
	opponent.drawScore();

	if (timeLeft > 0) {
		ctx.font = "60px Arial";
		ctx.fillStyle = "#550000";
		ctx.textAlign = "center";
		ctx.fillText(timeLeft, canvas.width/2, canvas.height/2);
	}
}

var buttonMidpointX = canvas.width * 0.5;
var buttonMidpointY = canvas.height * 0.8;
function checkClick(e) {
	e = e || window.event;
	if (ended) {
		location.reload();
	} else {
		if(e.y >= buttonMidpointY) {
			if (e.x < buttonMidpointX) {
				player.moveLeft();
			} else {
				player.moveRight();
			}
		}
	}
}

function checkKey(e) {
	e = e || window.event;
	if (e.keyCode == '80') {
		paused = true;
	}	
	if (e.keyCode == '82') {
		location.reload();
	}
	if (e.keyCode == '32') {
		player.propel();
	}
	if (e.keyCode == '37') {
		player.moveLeft();
	}
	if (e.keyCode == '39') {
		player.moveRight();
	}
}

function checkRestart(e) {
	e = e || window.event;
	if (e.keyCode == '82') {
		location.reload();
	}
}

function checkUnpaused(e) {
	e = e || window.event;
	if (e.keyCode == '82') {
		paused = false;
		animate();
	}
}

function animate() {
	drawFunction = setInterval(draw, 10);
	timerFunction = setInterval(timer, 1000);
	opponentMovementFunction = setInterval(opponentMovement, 200);
	document.onkeydown = checkKey;
}

function haltAnimation(reason) {
	clearInterval(drawFunction);
	clearInterval(timerFunction);
	clearInterval(opponentMovementFunction);
	if (reason == "pause") {
		document.onkeydown = checkUnpaused;
	} else if (reason == "endgame") {
		document.onkeydown = checkRestart;
	}
}
