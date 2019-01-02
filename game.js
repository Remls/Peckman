var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', function(event){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
window.addEventListener('click', checkClick);

var totalFood = 5;
var food = new Array();
for (var i = 0; i < totalFood; i++) {
	food.push(new Food());
}

var player = new Player("#4fb0c6", "#eff7f9");
var opponent = new Opponent("#17301c", "#e9ecea", food[Math.floor(Math.random() * totalFood)]);
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
			food.push(new Food());
			if (takenOpponentsTarget) {
				var newTargetIndex = Math.floor(Math.random() * totalFood);
				opponent.newTarget(food[newTargetIndex]);
			}
		}
		if (collisionOccurred(opponent, food[i])) {
			opponent.score += 1;
			food.splice(i, 1);
			food.push(new Food());
			var newTargetIndex = Math.floor(Math.random() * totalFood);
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
