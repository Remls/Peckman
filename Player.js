class Player {
	constructor(colour, scoreColour) {
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
		this.dir = Math.random() * 2 * Math.PI;
		this.turningRadius = 0.3;
	}

	draw() {
		ctx.beginPath();
		var circleSize = (this.acceleration > 0)
							? this.size - 2
							: this.size;
		ctx.ellipse(this.x, this.y, circleSize, circleSize, this.dir + Math.PI/4, 0, (3/2) * Math.PI);
		ctx.lineTo(this.x, this.y);
		ctx.fillStyle = (this.acceleration > 0)
							? "white"
							: this.colour;
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
}