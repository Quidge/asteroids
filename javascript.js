
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
	if (this.level.status != 0)
		this.drawResolution(); 	// if level.status not 0 (normal running state),
								// will render some "won" or "lost" overlay
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
		// x and y of actor pos
		var aX = this.level.origin.x + actor.pos.x;
		var aY = this.level.origin.y + actor.pos.y;
		
		// draw actor hitRadius (this is only for development)

		this.cx.beginPath();
		this.cx.arc(aX, aY, actor.hitRadius, 0, 7);
		this.cx.closePath();
		this.cx.stroke();
		
		console.log(actor.size.x, actor.hitRadius);
		
		if (actor.type == "player") {
			this.cx.save(); 
			this.cx.translate(aX, aY); //offset to actor location
			this.cx.rotate(actor.orient + 0.5*Math.PI);
			
			this.cx.beginPath();
			// actor.size divided by 2 to draw actor "centered" on actor.pos
			this.cx.moveTo(0,-actor.size.y/2);
			this.cx.lineTo(-actor.size.x/2, actor.size.y/2);
			this.cx.lineTo(actor.size.x/2, actor.size.y/2);
			this.cx.closePath();
			this.cx.stroke();
			
			this.cx.restore();	
		}
		
		if (actor.type == "asteroid") {
			
			// Asteroids are rectangles. A rectangle has four corners. The
			// position of those corners can be found with triangles. 
			// The distance from the center of the rectangle to any corner is
			// the hypotenuse of a right triangle with vertices origin and
			// corner. 
			// So, dist to corner = sqrt( (height/2)^2 + (width/2)^2 ).
			// The angle of that right triangle, from the horizontal is
			// atan( (h/2)/(w/2) ). We'll call it ø.
			// 
			// Because the sum of all angles in a square (and rectangle) is 
			// 360º, we can find the second angle (to
			// the top left corner) by 180 - ø. We can find the third angle (to
			// the bottom left corner by 180 + ø. The last corner (bottom right)
			// with 360 - ø.
			// 
			// Remember that these angles have been from the horizontal. Some
			// methods expect you to be starting from the vertical.
			
			var hyp = Math.hypot(actor.size.x/2, actor.size.y/2);
			
			// Define the start position so everything is shorter.
			// this.level.origin.x + actor.pos.x is pretty long.
			
			// corner angle
			var theta = Math.atan( (actor.size.y/2) / (actor.size.x/2) );
			
			this.cx.beginPath();
			// first corner
			this.cx.moveTo(aX + hyp * Math.cos(theta + actor.orient),
						aY + hyp * Math.sin(theta + actor.orient));
			// second corner
			this.cx.lineTo(aX + hyp * Math.cos(Math.PI - theta + actor.orient),
						aY + hyp * Math.sin(Math.PI - theta + actor.orient));
			// third corner
			this.cx.lineTo(aX + hyp * Math.cos(Math.PI + theta + actor.orient),
						aY + hyp * Math.sin(Math.PI + theta + actor.orient));
			// fourth corner
			this.cx.lineTo(aX + hyp * Math.cos(-theta + actor.orient),
						aY + hyp * Math.sin(-theta + actor.orient));
			// closePath draws line back to first location in path and completes
			// the path
			this.cx.closePath();
			this.cx.stroke();
		}
	}; 
};
CanvasDisplay.prototype.drawResolution = function() {
	this.cx.globalAlpha = 0.8;
	this.cx.fillStyle = "black";
	this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.cx.globalAlpha = 1.0;
	
	this.cx.font = "small-caps 700 48px sans-serif"
	this.cx.textBaseline = "middle";
	this.cx.textAlign = "center";
	this.cx.fillStyle = "red";
	
	if (this.level.status == -1) {
		this.cx.fillText("damn. you died homie.",
						this.canvas.width/2, this.canvas.height/2);
	} else if (this.level.status == 1) {
		this.cx.fillText("you won homie, props.",
						this.canvas.width/2, this.canvas.height/2);
	}
}

function Level() {
	this.length = 600;
	this.height = 600;
	// game state default origin is in center of length and width
	this.origin = new Vector(this.length/2, this.height/2);
	// each actor present in actor is expected to have a position and size
	this.actors = [];	
	this.status = 0; // -1 is lost, 0 is running, 1 is won	
}

Level.prototype.checkClip = function(actor) {
	
	// base state is not touching anything, hence false
	// first check if passed actor is touching anything in level.actors and
	// assign clipType to other.type
	// then check if actor is touching wall and assign "wall" to clipType if so
	// finally, return clipType
	var clipType = false;
	
	for (var i = 0; i < this.actors.length; i++) {
		var other = this.actors[i];
		if (actor !== other) {
			// This is a lot of logic. The pattern is this:
			// If actor and other were in only one dimension (x axis), would
			// their hit radii overlap? If yes, check to see if they would also
			// overlap in the y dimension. 

			var ax = actor.pos.x, ay = actor.pos.y, ar = actor.hitRadius;
			var ox = other.pos.x, oy = other.pos.y, or = other.hitRadius;
			
			//console.log(actor.pos.x, ay = actor.pos.y, ar = actor.hitRadius,						other.pos.x, oy = other.pos.y, or = other.hitRadius);
			
			// check right side (actorX > otherX)
			if (ax > ox && ax - ar < ox + or) {
					// check below (py < ay)
				if ((ay < oy && ay + ar > oy - or) ||
					// check above (py > ay)
					(ay > oy && ay - ar < oy + or)) {
					clipType = other.type;
				}
			// check left side (actorX < otherX)
			} else if (ax < ox && ax + ar > ox - or) {
					// check below (py < ay)
				if ((ay < oy && ay + ar > oy - or) ||
					// check above (py > ay)
					(ay > oy && ay - ar < oy + or)) {
					clipType = other.type;
				}
			}
		}
	}
	
	// check for wall collision
	// Wall collisions don't have to check for hit radius. This reduces the 
	// sense of "teleporting" that objects can generate when moving from once
	// side of the level to the other.
	if (Math.abs(actor.pos.x) > this.length/2 ||
		Math.abs(actor.pos.y) > this.height/2)
		clipType = "wall";

	return clipType;
};
Level.prototype.transport = function(actor, newPos) {
	actor.pos = newPos;
};

var maxStep = 0.05;

// step will be time since last animation frame
Level.prototype.animate = function(step, keys) {
	
	while (step > 0) {
		var thisStep = Math.min(maxStep, step);
		this.actors.forEach(function(actor) {
			actor.act(thisStep, this, keys);
			var collision = this.checkClip(actor);
			if (actor.type == "player" && collision == "asteroid") {
				console.log('hit!');
				this.status = -1; //-1 means lost; default (running) is 0
			}
			if (collision == "wall")
				this.transport(actor, actor.pos.times(-1));
		}, this);
		// by decrementing step this way, animation frame times are chopped
		step -= thisStep;
	}
};
Level.prototype.spawnAsteroid = function() {
	
	var rand1 = Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random();
	var rand2 = Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random();

	// Sets start position to be at random location on some wall
	// If in the extraordinarily unlikely scenario that rand1 == rand2, 
	// start position is set at 300,300 (bottom right corner)
	if (rand1 > rand2)
		var pos = new Vector(300*rand1, 300);
	else if (rand1 < rand2)
		var pos = new Vector(300, 300*rand1);
	else
		var pos = new Vector(300, 300);
	var spin = 5 * rand1;
	var velocity = new Vector(10 + 50 * rand1, 10 + 50 * rand2);
	// can't have negative sizes
	// minimum size is 15x20
	var size = new Vector(15 + Math.abs(200 * rand1), 
							20 + Math.abs(200 * rand2));
	
	//manually set size, don't mess with randoms
	//var size = new Vector(50, 300);
	
	var asteroid = new Asteroid(pos, size, spin, velocity)
	this.actors.push(asteroid);
};

// Begin different actor types
function Asteroid(pos, size, spin, velocity) {
	this.pos = pos;
	this.size = size;
	this.hitRadius = (this.size.x / 2 + this.size.y / 2) / 2; // average
	this.spin = spin;
	this.velocity = velocity;
	this.orient = 0;
}
Asteroid.prototype.type = "asteroid";
Asteroid.prototype.act = function(step) {
	this.rotate(step); // applies spin to current orientation
	this.updatePosition(step); // applies velocity to current position
};
Asteroid.prototype.fracture = function() {
	if (this.size > 2) {
		return //an array with 2-3 spawned child asteroids
	} else
		// if an asteroid is under a certain size, it won't split smaller
		return false;
};
Asteroid.prototype.updatePosition = function(step) {
	this.pos.x = this.pos.x + this.velocity.x * step;
	this.pos.y = this.pos.y + this.velocity.y * step;
};
Asteroid.prototype.rotate = function(step) {
	this.orient = this.orient + this.spin * step;
};

function Player(pos) {
	this.pos = pos;
	this.size = new Vector(15, 20);
	this.hitRadius = Math.max(this.size.x, this.size.y) / 2;
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
		if (level.status !== 0) {
			return false;
		};
	});
}

function runGame(Display) {
	var level = new Level();
	level.actors.push(new Player(new Vector(0,0)));
	level.spawnAsteroid();
	level.spawnAsteroid();
	level.spawnAsteroid();
	level.spawnAsteroid();
	
	runLevel(level, Display);
}

// end helper stuff

runGame(CanvasDisplay);
