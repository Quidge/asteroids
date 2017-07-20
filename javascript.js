
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
		
		var actor = this.level.actors[i];
		
		if (actor.type == "player") {
						
			this.cx.save();
			//offsets to Level "origin"
			this.cx.translate(this.level.origin.x + actor.pos.x,
								this.level.origin.y + actor.pos.y);
			this.cx.rotate(actor.orient + 0.5*Math.PI);
			
			this.cx.beginPath();
			this.cx.moveTo(0,0);
			this.cx.lineTo(-actor.size.x/2, actor.size.y);
			this.cx.lineTo(actor.size.x/2, actor.size.y);
			this.cx.closePath();
			this.cx.stroke();
			
			this.cx.restore();
		}
	}; 
};

function Level() {
	this.length = 600;
	this.height = 600;
	// game state default origin is in center of length and width
	this.origin = new Vector(this.length/2, this.height/2);
	// each actor present in actor is expected to have a position and size
	this.actors = [];	
	this.status = null;	
}

var maxStep = 0.05;

// step will be time since last animation frame
Level.prototype.animate = function(step, keys) {
	//if (this.status != null)
		// end game in some way
	
	while (step > 0) {
		var thisStep = Math.min(maxStep, step);
		this.actors.forEach(function(actor) {
			actor.act(thisStep, this, keys);
			console.log(actor.pos.x, actor.pos.y);
		}, this);
		// by decrementing step this way, animation frame times are chopped
		step -= thisStep;
	}
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
	this.size = new Vector(15, 20);
	this.turnSpeed = (180 / 180) * Math.PI; //turnSpeed in degrees
	this.velocity = new Vector(0, 0); // direction ship is drifting in
	this.accel = 100; // max velocity magnitude 
	this.orient = 0; //in radians; begin pointing north
}
Player.prototype.type = "player";
Player.prototype.act = function(step, level, keys) {
	this.turn(step, keys); // affects orientation
	this.jet(step, keys); // affects velocity
	this.updatePosition(); //applies new velocity to position
};
Player.prototype.turn = function(step, keys) {
	if (keys.left && !keys.right) {
		this.orient -= this.turnSpeed * step;
	} else if (!keys.left && keys.right) {
		this.orient += this.turnSpeed * step;
	}
};
Player.prototype.jet = function(step, keys) {
	if (keys.up) {
		var increment = step * this.accel;
		var jetVelocity = new Vector(Math.cos(this.orient) * increment,
									Math.sin(this.orient) * increment);
		this.velocity = this.velocity.plus(jetVelocity);
	}
};
Player.prototype.updatePosition = function() {
	this.pos.x = this.pos.x + this.velocity.x;
	this.pos.y = this.pos.y + this.velocity.y;
};
Player.prototype.shoot = function() {
	return // new Missile(stuff);
};

function Missile(pos) {
	this.pos = pos;
	this.size = new Vector(2, 2);
	this.speed = 20; 
}
Missile.prototype.type = "missile";
Missile.prototype.fizzle = function() {
	return; //not sure what to do here
};

// helper stuff
function Vector(x, y) {
	this.x = x;
	this.y = y;
}
Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
	return new Vector(this.x * factor, this.y * factor);
};

function runAnimation(frameFunc) {
	var lastTime = null;
	function frame(time) {
		var stop = false;
		if (lastTime != null) {
			// this will break frames into a max of 100 milliseconds
			var timeStep = Math.min(time - lastTime, 100) / 1000;
			stop = frameFunc(timeStep) === false;
		}
		lastTime = time;
		if (!stop)
			requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

var arrowCodes = {37: "left", 38: "up", 39: "right"}

function trackKeys(codes) {
	var pressed = Object.create(null);
	function handler(event) {
		var down = event.type == "keydown";
		pressed[codes[event.keyCode]] = down;
		event.preventDefault();
	}
	addEventListener("keydown", handler);
	addEventListener("keyup", handler);
	return pressed;
}

var arrows = trackKeys(arrowCodes);

function runLevel(level, Display) {
	var display = new Display(document.body, level);
	runAnimation(function(step) {
		level.animate(step, arrows);
		display.drawFrame(step);
	});
}

function runGame(Display) {
	var level = new Level();
	level.actors.push(new Player(new Vector(0,0)));
	runLevel(level, Display);
}

// end helper stuff


var simpleLevel = new Level();
simpleLevel.actors.push(new Player(new Vector(0,0)));


runGame(CanvasDisplay);
