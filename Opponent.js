class Opponent extends Player {
	constructor(colour, scoreColour, target) {
		super(colour, scoreColour);
		this.target = target;
	}

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