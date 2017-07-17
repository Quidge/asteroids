
// CanvasDisplay constructor
function CanvasDisplay(parent, level) {
	this.canvas = document.createElement("canvas");
	this.canvas.width = 600;
	this.canvas.height = 600;
	parent.appendChild(this.canvas);
	this.cx = this.canvas.getContext("2d");
	
	this.animationTime = 0;
	
	this.level = level;
	
} 
// Begin CanvasDisplay methods
CanvasDisplay.prototype.clear = function() {
	this.canvas.parentNode.removeChild(this.canvas);
};
CanvasDisplay.prototype.drawFrame = function(step) {
	// step will be the elapsed time since last frame
	this.animationTime += step;
	
	// entire display redraw after each frame
	this.clearDisplay();
	this.drawBackground();
	// both ship and asteroids are actors
	this.drawActors();
};
CanvasDisplay.prototype.clearDisplay = function() {
	this.cx.clearRect(0, 0, 
					this.canvas.width, this.canvas.height);
};
CanvasDisplay.prototype.drawBackground = function() {
	this.cx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
};
CanvasDisplay.prototype.drawActors = function() {
	for (var i = 0; i < this.level.actors.length; i++) {
		// draw each actor
	}; 
};

function Level() {
	this.width = 600;
	this.length = 600;
	// each actor present in actor is expected to have a position and size
	this.actors = [];	
	
};

// Begin different actor types
function Asteroid(pos, size, rotation, speed) {
	this.pos = pos;
	this.size = size;
	this.rotation = rotation;
	this.speed = speed;
}
Asteroid.prototype.type = "asteroid";
Asteroid.prototype.fracture = function() {
	if (this.size > 2) {
		return //an array with 2-3 spawned child asteroids
	} else
		// if an asteroid is under a certain size, it won't split smaller
		return false;
};

function Player(pos) {
	this.pos = pos;
	this.size = new Vector(2, 2);
	this.speed = new Vector(0, 0);
	this.orient = 0; //begin pointing east
}
Player.prototype.type = "player";
Player.prototype.shoot = function() {
	return // new Missile(stuff);
};

function Missile(pos) {
	this.pos = pos;
	this.size = new Vector(.2, .2);
	this.speed = 20; 
}
Missile.prototype.type = "missile";
Missile.prototype.fizzle = function() {
	return; //not sure what to do here
};

// helper stuff
function Vector(x, y) {
	this.x = x, this.y = y;
}
Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
	return new Vector(this.x * factor, this.y * factor);
};

//var game = new CanvasDisplay(document.body);
//game.drawFrame(0);