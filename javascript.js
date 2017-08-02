
// CanvasDisplay constructor
function CanvasDisplay(parent, level) {
	this.canvas = document.createElement("canvas");
	this.canvas.width = 600;
	this.canvas.height = 600;
	parent.appendChild(this.canvas);
	this.cx = this.canvas.getContext("2d");
	
	this.animationTime = 0;
	
	this.isPaused = false;
	this.level = level;
	
} 
// Begin CanvasDisplay methods
CanvasDisplay.prototype.clear = function() {
	this.canvas.parentNode.removeChild(this.canvas);
};
CanvasDisplay.prototype.drawFrame = function(step) {
	// step will be the elapsed time since last frame
	this.animationTime += step; // total elapsed time;
	
	// entire display redraw after each frame
	this.clearDisplay();
	this.drawBackground();
	// both ship and asteroids are actors
	this.drawActors(); 
	if (this.level.status != 0 || this.isPaused)
		this.drawResolution(); 	// if level.status not 0 (normal running state),
								// will render some "won" or "lost" overlay
	this.drawPoints(); // draws playerPoints to top right
};
CanvasDisplay.prototype.clearDisplay = function() {
	this.cx.clearRect(0, 0, 
					this.canvas.width, this.canvas.height);
};
CanvasDisplay.prototype.drawBackground = function() {
	this.cx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
};
CanvasDisplay.prototype.drawPoints = function() {
	this.cx.fillStyle = "red";
	this.cx.textAlign = "right";
	this.cx.textBaseline = "top";
	this.cx.font = "small-caps 700 48px sans-serif";
	
	this.cx.fillText(this.level.playerPoints, 
		this.canvas.width - 15, 0);
}
CanvasDisplay.prototype.drawActors = function() {
	for (var i = 0; i < this.level.actors.length; i++) {
		
		var actor = this.level.actors[i];
		// x and y of actor pos
		var aX = this.level.origin.x + actor.pos.x;
		var aY = this.level.origin.y + actor.pos.y;
		
		// draw actor hitRadius (this is only for development)
		if (gameOptions.showHitRadius) {
			this.cx.beginPath();
			this.cx.arc(aX, aY, actor.hitRadius, 0, 7);
			this.cx.closePath();
			this.cx.stroke();
		}
		
		if (actor.type == "missile") {
			this.cx.beginPath();
			this.cx.moveTo(aX, aY);
			this.cx.lineTo(aX - Math.cos(actor.orient) * actor.size.y,
							aY - Math.sin(actor.orient) * actor.size.y);
			this.cx.closePath();
			this.cx.stroke();
		}
				
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
		this.cx.fillText("darn. you died.",
						this.canvas.width/2, this.canvas.height/2);
	} else if (this.level.status == 1) {
		this.cx.fillText("you won fool, props.",
						this.canvas.width/2, this.canvas.height/2);
	} else if (this.isPaused) {
		this.cx.fillText("we're paused homie",
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
	this.playerPoints = 0;
	this.status = 0; // -1 is lost, 0 is running, 1 is won
}

Level.prototype.checkClip = function(actor) {
	
	var clipType = false;
	
	// base state is not touching anything, hence false
	// first check if passed actor is touching anything in level.actors and
	// assign clipType to other.type
	// then check if actor is touching wall and assign "wall" to clipType if so
	// finally, return clipType
	
	for (var i = 0; i < this.actors.length; i++) {
		var other = this.actors[i];
		if (actor !== other) {
			// using these shorthand abbreviations to make things easier
			// to keep on fewer lines
			var ax = actor.pos.x, ay = actor.pos.y;
			var ox = other.pos.x, oy = other.pos.y;
			
			var ar, or; 
			if (actor.hitRadius) 
				ar = actor.hitRadius;
			else ar = 0;
			if (other.hitRadius)
				or = other.hitRadius;
			else or = 0;
				
			// This is a lot of logic. The pattern is this:
			// If actor and other were in only one dimension (x axis), would
			// their hit radii overlap? If yes, check to see if they would
			// also overlap in the y dimension. 
							
			// check right side (actorX > otherX)
			if (ax > ox && ax - ar < ox + or) {
					// check below (py < ay)
				if ((ay < oy && ay + ar > oy - or) ||
					// check above (py > ay)
					(ay > oy && ay - ar < oy + or)) {
					clipType = other;
				}
			// check left side (actorX < otherX)
			} else if (ax < ox && ax + ar > ox - or) {
					// check below (py < ay)
				if ((ay < oy && ay + ar > oy - or) ||
					// check above (py > ay)
					(ay > oy && ay - ar < oy + or)) {
					clipType = other;
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
Level.prototype.calcPointVal = function(actor) {
	return Math.floor(Math.max(actor.size.x, actor.size.y) * 10);
};
Level.prototype.removeActor = function(actor) {
	var index = this.actors.indexOf(actor);
	if (index > -1) {
		this.actors.splice(index, 1);
		return true;
	}
	else {
		return false;
	}
};

var maxStep = 0.05;

// step will be time since last animation frame
Level.prototype.animate = function(step, keys) {
	
	while (step > 0) {
		var thisStep = Math.min(maxStep, step);
		this.actors.forEach(function(actor) {
			// first run through actor's act method (usually just updates 
			// position/orientation/velocity of actor)
			actor.act(thisStep, this, keys);
			// next remove 'spent' missiles, and short circuit if so
			if (actor.type == "missile" && actor.distTravel > 400) {
				this.removeActor(actor);
				return;
			}
			// resolve collisions with check clip
				// checkClip returns either false, "wall", or the actual object
				// of whatever actor collided with
			this.resolveCollision(actor, this.checkClip(actor));
		}, this);
		this.elapsedGameTime += thisStep;
		// by decrementing step this way, animation frame times are chopped
		step -= thisStep;
	}
};
Level.prototype.resolveCollision = function(actor, collision) {
	if (!collision)
		return false;
	if (actor.type == "player" && collision.type == "asteroid") {
		this.status = -1; //-1 means lost; default (running) is 0
	}
	if (actor.type == "missile" && collision.type == "asteroid") {
		this.removeActor(actor);
		// fractureChildren returns array of children asteroids or false
		var children = collision.fractureChildren();
		if (children) {
			for (var i = 0; i < children.length; i++)
				this.actors.push(children[i]);	
		}
		this.playerPoints += this.calcPointVal(collision);
		this.removeActor(collision);
	}
	// if wall is tripped, capture how much the actor has gone past the wall
	// (that is overStep)
	// switch tripped axis coord and add back overstep * a slight bump
	if (collision == "wall") {
		if (Math.abs(actor.pos.x) > this.length/2) {
			var overStep = actor.pos.x % (this.length/2);
			actor.pos.x *= - 1;
			actor.pos.x = actor.pos.x + overStep * 1.5;
		}
		if (Math.abs(actor.pos.y) > this.height/2) {
			var overStep = actor.pos.y % (this.height/2);
			actor.pos.y *= -1;
			actor.pos.y = actor.pos.y + overStep * 1.5;
		}
	}
	
};
Level.prototype.spawnAsteroid = function(pos, size, spin, velocity) {
	
	if (pos && size && spin && velocity) { 
		// only take parameters if all are present
		var asteroid = new Asteroid(pos, size, spin, velocity);
	} else {
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
	
		var asteroid = new Asteroid(pos, size, spin, velocity);
	}
	this.actors.push(asteroid);
};

// Begin different actor types
function Asteroid(pos, size, spin, velocity) {
	this.pos = pos;
	this.size = size;
	this.hitRadius = (this.size.x / 2 + this.size.y / 2) / 2; // average
	this.spin = spin || 0;
	this.velocity = velocity;
	this.orient = 0;
}
Asteroid.prototype.type = "asteroid";
Asteroid.prototype.act = function(step) {
	this.rotate(step); // applies spin to current orientation
	this.updatePosition(step); // applies velocity to current position
};
Asteroid.prototype.fractureChildren = function() {
	var childAsteroids = [];
	
	/*
	Asteroids fracture in this pattern (whole square is parent asteroid):
	
	 ------------------
	|         |        |
	|    B    |   C    |
	|         |        |
	|------------------|
	|                  |
	|         A        |
	|                  |
	 ------------------
	
	A = childA
	B = childB
	C = childC
	
	*/
	
	if (Math.min(this.size.x, this.size.y) > 15) {
		
		var aPos = new Vector(this.pos.x, this.pos.y - this.size.y/4)
		var aSize = new Vector(this.size.x, this.size.y/2);
		
		var bPos = new Vector(this.pos.x - this.size.x/4,
			this.pos.y + this.size.y/4);
		var bSize = new Vector(this.size.x/2, this.size.y/2);
		
		var cPos = new Vector(this.pos.x + this.size.x/4,
			this.pos.y + this.size.y/4);
		var cSize = new Vector(this.size.x/2, this.size.y/2);
		
		var childA = new Asteroid(aPos, aSize);
		var childB = new Asteroid(bPos, bSize);
		var childC = new Asteroid(cPos, cSize);
		
		childA.orient = this.orient;
		childB.orient = this.orient;
		childC.orient = this.orient;

		// childA will escape towards -0.5*PI off parent orient
		// childB will escape towards 0.75*PI off parent orient
		// childC will escape towards 0.25*PI off parent orient
		
		// velocity magnitude children will escape at
		var escapeMag = 5;
		
		childA.velocity = this.velocity.plus(new Vector(
			Math.cos(childA.orient - 0.5*Math.PI) * escapeMag,
			Math.sin(childA.orient - 0.5*Math.PI) * escapeMag)
		);
		childB.velocity = this.velocity.plus(new Vector(
			Math.cos(childB.orient + 0.75*Math.PI) * escapeMag,
			Math.sin(childB.orient + 0.75*Math.PI) * escapeMag)
		);
		childC.velocity = this.velocity.plus(new Vector(
			Math.cos(childC.orient + 0.25*Math.PI) * escapeMag,
			Math.sin(childC.orient + 0.25*Math.PI) * escapeMag)
		);
		
		childAsteroids.push(childA);
		childAsteroids.push(childB);
		childAsteroids.push(childC);
		
		return childAsteroids;
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
/*Asteroid.prototype.wallBump = function(axis) {
	if (axis != 'x')
		throw new Error("Was expecting 'x' or 'y' string, but received: " + axis);
	console.log(this.pos.x, this.pos.y, 'going to increment ' + axis);
	console.log(this.pos[axis]);
	this.pos[axis] > 0 ? this.pos[axis] -= 1 : this.pos[axis] += 1;
	console.log(this.pos[axis]);
	return this.pos;
}*/

function Player(pos) {
	this.pos = pos;
	this.size = new Vector(15, 20);
	this.hitRadius = Math.max(this.size.x, this.size.y) / 2;
	this.turnSpeed = (180 / 180) * Math.PI; //turnSpeed in degrees
	this.velocity = new Vector(0, 0); // direction ship is drifting in
	this.accel = gameOptions.playerAccel || 100; 
	this.orient = 0; //in radians; begin pointing north
	this.gunsReady = 100; //less than 100 means guns aren't ready
}
Player.prototype.type = "player";
Player.prototype.act = function(step, level, keys) {
	this.shoot(step, level, keys);
	this.turn(step, keys); // affects orientation
	this.jet(step, keys); // affects velocity
	this.updatePosition(); //applies new velocity to position
	this.gunsReady += step * 500; //guns 'charge' over time
};
Player.prototype.shoot = function(step, level, keys) {	
	if (keys.space && this.gunsReady >= 100) {
			level.actors.push(new Missile(this.pos, this.velocity, this.orient));
		this.gunsReady = 0; //this forces a delay after firing 
	}
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

function Missile(initialPos, velocity, orient) {
	this.pos = initialPos; //CanvasDisplay draws missiles beyond pos, in the opposite direction of orient (missiles have their body 'tail' behind their pos
	this.size = new Vector(5, 10);
	this.orient = orient;
	this.velocity = new Vector(Math.cos(this.orient) * 5,
								Math.sin(this.orient) * 5);
	this.distTravel = 0;
}
Missile.prototype.type = "missile";
Missile.prototype.act = function(step) {
	this.updatePosition(); // also updates distTravel
};
Missile.prototype.updatePosition = function() {
	var oldPos = this.pos;
	this.pos = this.pos.plus(this.velocity);
	this.distTravel += Math.hypot(this.pos.x - oldPos.x, this.pos.y - oldPos.y);
}

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

var arrowCodes = {37: "left", 38: "up", 39: "right", 32: "space"};

function trackKeys(codes) {
	var pressed = Object.create(null);
	function handler(event) {
		var down = event.type == "keydown";
		event.preventDefault();
		pressed[codes[event.keyCode]] = down;
	}
	addEventListener("keydown", handler);
	addEventListener("keyup", handler);

	return pressed;
}

var gameOptions = Object.create(null);
gameOptions = {
	'showHitRadius': false,
	'playerAccel': 20
};

var arrows = trackKeys(arrowCodes);

/* Okay, so this part is hard because it's fairly abstracted and uses recursion.

- The escape key alters var running to yes/pausing/no.
- Animation takes an amount of time (called step), and has Level and Display
	do their thing with that amount of time.
	- 	In some cases (game is paused, level status != 0), animation can return
		false.
- runAnimation is a wrapper for requestAnimation. It takes a function that
	expects an amount of time (...like animation). At the end of runAnimation, 
	it runs itself again. This is the recursion. It will run itself over and 
	over unless the argument function returns false.
	
*/

function runLevel(level, Display) {
	var display = new Display(document.body, level, gameOptions);
	var running = "yes";
	function handleKey(event) {
		if (event.keyCode == 27) { // keyCode 27 is escape key
			if (running == "no") {
				running = "yes";
				display.isPaused = false;
				runAnimation(animation)
			} else if (running == "yes") {
				running = "pausing";
			} else if (running == "pausing") {
				running = "yes";
			}
		}
	}
	addEventListener("keydown", handleKey);
	
	function animation(step) {
		if (running == "pausing") {
			running = "no";
			display.isPaused = true;
			display.drawFrame();
			return false;
		}
		
		level.animate(step, arrows);
		display.drawFrame(step);
		if (level.status !== 0) {
			return false;
		}
	}
	runAnimation(animation);
}

function runGame(Display) {
	var level = new Level();
	var player = new Player(new Vector(0,0));
	level.actors.push(player);
	level.spawnAsteroid();
	//level.spawnAsteroid();
	//level.spawnAsteroid();
	//level.spawnAsteroid();
	
	runLevel(level, Display);
}

// end helper stuff

runGame(CanvasDisplay);
