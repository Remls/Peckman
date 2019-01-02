class Food {
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