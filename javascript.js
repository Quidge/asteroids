
// CanvasDisplay constructor
function CanvasDisplay(parent, level) {
	this.canvas = document.createElement("canvas");
	this.canvas.width = 600;
	this.canvas.height = 600;
	parent.appendChild(this.canvas);
	this.cx = this.canvas.getContext("2d");
	
	this.animationTime = 0;
	
	this.isPaused = false;
	this.splashScreen = false;
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
	if (this.splashScreen)
		this.drawSplashScreen();
	if (this.level.status != 0 || this.isPaused)
		this.drawResolution(); 	// if level.status not 0 (normal running state),
								// will render some "won" or "lost" overlay
	this.drawPoints(); // draws playerPoints to top right
	this.drawCurrentStage() // writes current stage playerPoints
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
};
CanvasDisplay.prototype.drawCurrentStage = function() {
	var stageText;
	if (this.level.currentStage)
		stageText = 'stage: ' 
					+ (this.level.stages.indexOf(this.level.currentStage) + 1);
	else
		stageText = 'winner winner chicken dinner';
	
	this.cx.fillStyel = "red";
	this.cx.textAlign = "right";
	this.cx.textBaseLine = "top";
	this.cx.font = "small-caps 700 20px sans-serif";
	
	// draws underneath player points
	this.cx.fillText(stageText, this.canvas.width - 15, 48);
};
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
		
		if (actor.type == "alien") {
			var width = actor.size.x;
			var height = actor.size.y;
			
			this.cx.save();
			this.cx.translate(aX, aY);
			
			//draw alien ship outer bevel
			this.cx.beginPath();
			this.cx.moveTo(-width/2, 0);
			this.cx.lineTo(width/2, 0);
			this.cx.closePath();
			this.cx.stroke();
			
			//draw alien ship top half
			this.cx.beginPath();
			this.cx.moveTo((-width/2) * 0.75, 0);
			this.cx.quadraticCurveTo(0, - height * 0.25, (width/2) * 0.75, 0);
			this.cx.closePath();
			this.cx.stroke();
			
			// draw alien ship bottom half
			this.cx.beginPath();
			this.cx.moveTo((-width/2) * 0.75, 0);
			this.cx.quadraticCurveTo(0, height * 0.25, // control
									(width/2) * 0.75, 0); // goal
			this.cx.closePath();
			this.cx.stroke();
			
			// draw alien ship hatch
			this.cx.beginPath();
			this.cx.moveTo(-0.125*width, - height * 0.125);
			this.cx.quadraticCurveTo(0, - height * 0.5, // control
									 0.125*width, - height * 0.125) // goal
			// move back to path begin position so closePath doesn't
			// draw horizontal line
			this.cx.moveTo(-0.125*width, - height * 0.125);
			this.cx.closePath();
			this.cx.stroke();
			
			this.cx.restore();
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
};
CanvasDisplay.prototype.drawSplashScreen = function() {
	this.cx.globalAlpha = 0.8;
	this.cx.fillStyle = "black";
	this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.cx.globalAlpha = 1.0;
	
	var textSize = 16;
	var lineHeight = textSize * 1.2;
	this.cx.font = "small-caps 700 " + textSize + "px sans-serif"
	this.cx.textBaseline = "middle";
	this.cx.textAlign = "center";
	this.cx.fillStyle = "red";
	
	this.cx.fillText("use LEFT and RIGHT keys to STEER",
		this.canvas.width/2, this.canvas.height/2 + lineHeight * 0);
	this.cx.fillText("use UP ARROW key to JET",
		this.canvas.width/2, this.canvas.height/2 + lineHeight * 1);		
	this.cx.fillText("use SPACEBAR key to SHOOT",
		this.canvas.width/2, this.canvas.height/2 + lineHeight * 2);		
	this.cx.fillText("use ESCAPE key to PAUSE",
		this.canvas.width/2, this.canvas.height/2 + lineHeight * 3);		
	this.cx.fillText("use F key to WARP (be careful!)",
		this.canvas.width/2, this.canvas.height/2 + lineHeight * 4);		
	this.cx.fillText("press B key to BEGIN",
		this.canvas.width/2, this.canvas.height/2 + lineHeight * 6);		

};

function Level(stages, player) {
	this.length = 600;
	this.height = 600;
	// game state default origin is in center of length and width
	this.origin = new Vector(this.length/2, this.height/2);
	// each actor present in actor is expected to have a position and size
	this.actors = [];
	this.playerPoints = 0;
	this.status = 0; // -1 is lost, 0 is running, 1 is won
	this.elapsedGameTime = 0;
	this.stages = stages;
	this.currentStage = stages[0];
	
	this.player = player;
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
Level.prototype.checkForEnemies = function(actorArray) {
	function test(element) {
		return element.type != "player";
	}
	return actorArray.some(test);
}

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
		// levelUp
		// by decrementing step this way, animation frame times are chopped
		step -= thisStep;
	}
	/*
	Here's what I'm thinking:
		- have level also hold a elapsedStageTime property
		- create a new method, getEnemyQue, and call it with elapsedStageTime
		as an arg
		- getEnemyQue compares elapsedStageTime, against the stuff in
		 level.stage, and returns false if nothing is ready to spawn,
		 otherwise returning a list of enemies to spawn
		 - invoke spawnStageEnemies with what getEnemyQue returns
		 
		 - doing it this way makes it possible to pass through stages
		 without killing all the intended enemies in the stage. so, a bonus
		 if you're fast.
		
	
	*/
	
	
	if (!this.checkForEnemies(this.actors)) {
		var nextStage = this.stages[this.stages.indexOf(this.currentStage) + 1];
		console.log(nextStage);
		if (nextStage) {
			this.spawnStageEnemies(nextStage);
			this.currentStage = nextStage;
		} else
			this.status = 1;
	}
};
Level.prototype.spawnStageEnemies = function(stage) {
	// spawn in asteroids
	for (var i = 0; i < stage.asteroids; i++) {
		this.actors.push(this.getRandomAsteroid());
	}
	// spawn in aliens
	for (var i = 0; i < stage.aliens; i++) {
		this.actors.push(new Alien({
							'pos': new Vector(300, getRandom(-250,250)),
							'velocity': new Vector(200, 0)
							})
						);
	}
};
Level.prototype.resolveCollision = function(actor, collision) {
	// don't do anything if no collision, or, collision is "safe" and not "wall"
	if (!collision || 
		((actor.createdByType == collision.type) && collision != "wall")) {
		return false;
	}
	if (actor.type == "player" && collision.type == "asteroid") {
		this.status = -1; //-1 means lost; default (running) is 0
	}
	if (actor.type == "missile") {
		if (collision.type == "asteroid") {
			// getChildren returns array of children asteroids or false 
			// if asteroid is too small
			var children = collision.getChildren();
			if (children) {
				for (var i = 0; i < children.length; i++) {
					this.actors.push(children[i]);
				}
			}
			// if actor is missile, and originally from player, add points	
			if (actor.createdByType == "player") {
				this.playerPoints += this.calcPointVal(collision);
			}
		}
		if (collision.type == "player") {
			this.status = -1; 
			// this will only happen if collisions aren't "safe"
		}
		this.removeActor(actor); // finally, remove the missile actor
		this.removeActor(collision); // finally, remove the collision actor
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
Level.prototype.getRandomAsteroid = function() {
	var properties = Object.create(null);
	
	var rand1 = Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random();
		var rand2 = Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random();
	
	if (rand1 > rand2)
		properties.pos = new Vector(300*rand1, 300);
	else
		properties.pos = new Vector(300, 300*rand1);
	
	properties.spin = 5 * rand1;
	properties.velocity = new Vector(10 + 50 * rand1, 10 + 50 * rand2);
	properties.size = new Vector(15 + Math.abs(200 * rand1), 
								20 + Math.abs(200 * rand2));
	
	return new Asteroid(properties);
};

function Asteroid(
	// set defaults using destructuring
	{	pos = new Vector(300, 300),
		size = new Vector(35, 35),
		spin = 5,
		velocity = new Vector(35, 35)
	} = {}) {
	
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
Asteroid.prototype.getChildren = function() {

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
		
		var childAsteroids = [];
		var parent = this;
		
		var childA = Object.create(null);
		var childB = Object.create(null);
		var childC = Object.create(null);
		
		childA.pos = new Vector(parent.pos.x, parent.pos.y - parent.size.y/4);
		childA.size = new Vector(parent.size.x, parent.size.y/2);
		
		childB.pos = new Vector(parent.pos.x - parent.size.x/4,
			parent.pos.y + parent.size.y/4);
		childB.size = new Vector(parent.size.x/2, parent.size.y/2);
		
		childC.pos = new Vector(parent.pos.x + parent.size.x/4,
			parent.pos.y + parent.size.y/4);
		childC.size = new Vector(parent.size.x/2, parent.size.y/2);

		childA.orient = parent.orient;
		childB.orient = parent.orient;
		childC.orient = parent.orient;

		// childA will escape towards -0.5*PI off parent orient
		// childB will escape towards 0.75*PI off parent orient
		// childC will escape towards 0.25*PI off parent orient
		
		// velocity magnitude children will escape at
		var escapeMag = 5;
		
		childA.velocity = parent.velocity.plus(new Vector(
			Math.cos(childA.orient - 0.5*Math.PI) * escapeMag,
			Math.sin(childA.orient - 0.5*Math.PI) * escapeMag)
		);
		childB.velocity = parent.velocity.plus(new Vector(
			Math.cos(childB.orient + 0.75*Math.PI) * escapeMag,
			Math.sin(childB.orient + 0.75*Math.PI) * escapeMag)
		);
		childC.velocity = parent.velocity.plus(new Vector(
			Math.cos(childC.orient + 0.25*Math.PI) * escapeMag,
			Math.sin(childC.orient + 0.25*Math.PI) * escapeMag)
		);
		
		childA.spin = parent.spin * 0.1;
		childB.spin = parent.spin * 0.1;
		childC.spin = parent.spin * 0.1;
		
		childAsteroids.push(new Asteroid(childA));
		childAsteroids.push(new Asteroid(childB));
		childAsteroids.push(new Asteroid(childC));
		
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

function Player(pos) {
	this.pos = pos;
	this.size = new Vector(15, 20);
	this.hitRadius = Math.max(this.size.x, this.size.y) / 2;
	this.turnSpeed = (180 / 180) * Math.PI; //turnSpeed in degrees
	this.velocity = new Vector(0, 0); // direction ship is drifting in
	this.accel = gameOptions.playerAccel || 100; 
	this.orient = 0; //in radians; begin pointing north
	this.gunsReady = 100; //less than 100 means shoot method won't do anything
	this.warping = false;
}
Player.prototype.type = "player";
Player.prototype.act = function(step, level, keys) {
	this.warping = false;
	if (keys.warp) {
		this.pos = new Vector(Math.floor(300 * getRandom(-1, 1)),
								Math.floor(300 * getRandom(-1, 1)))
		this.warping = true;
	}
	this.shoot(step, level, keys);
	this.turn(step, keys); // affects orientation
	this.jet(step, keys); // affects velocity
	this.updatePosition(); //applies new velocity to position
	this.gunsReady += step * 500; //guns 'charge' over time
};
Player.prototype.shoot = function(step, level, keys) {	
	if (keys.space && this.gunsReady >= 100) {
			level.actors.push(new Missile({
				'initialPos': this.pos,
				'orient': this.orient,
				'createdByType': this.type
				}));
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

function Alien({pos = new Vector(300,0),
				velocity = new Vector(200,0),
				gunsReady = 0} = {}) {
	this.pos = pos;
	this.size = new Vector(30, 30);
	this.hitRadius = Math.max(this.size.x, this.size.y) / 2;
	this.velocity = velocity; 	// I treat this as a constant for now, like a
								// scaler instead of something with i and j
								// components that mean something directionally.
	this.gunsReady = gunsReady; //less than 1000 means shoot method won't do anything
	this.cycle = 0; // aliens move in sin wave behavior
	this.orient = 0;
}

Alien.prototype.type = "alien";
Alien.prototype.act = function(step, level) {
	this.cycle += step;
	this.shoot(step, level);
	this.updatePosition(step);
	this.gunsReady += step * 500;
};
Alien.prototype.shoot = function(step, level) {
	if (this.gunsReady >= 1000) {
		//figure out what direction to shoot
		var run = level.player.pos.x - this.pos.x;
		var rise = level.player.pos.y - this.pos.y;
		var hyp = Math.hypot(run, rise); 

		var alienMissile = new Missile({
			'initialPos': this.pos,
			'orient': 0, 	//this needs to be something other than 0, but i 
							// can't figure out how to get it
			'velocity': new Vector((run/hyp) * 5, (rise/hyp) * 5),
			'createdByType': this.type
			});
		level.actors.push(alienMissile);
		
		this.gunsReady = 0;
	}
};
Alien.prototype.updatePosition = function(step) {
	// sin wave behavior, scrolls right to left
	
	this.pos.x += this.velocity.x * step;
	this.pos.y += Math.sin(this.cycle * 2 * Math.PI) * this.velocity.x * step; 
};

function Missile({	initialPos = new Vector(0,0),
					orient = 0,
					velocity = undefined,
					createdByType = undefined} = {}) {
	this.pos = initialPos; //CanvasDisplay draws missiles beyond pos, in the opposite direction of orient (missiles have their body 'tail' behind their pos
	this.size = new Vector(5, 10);
	this.orient = orient;
	this.velocity = velocity || new Vector(	Math.cos(this.orient) * 5,
											Math.sin(this.orient) * 5);
	this.distTravel = 0;
	this.createdByType = createdByType;
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

function getRandom(min, max) {
	return Math.random() * (max - min) + min;
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

var arrowCodes = {37: "left", 38: "up", 39: "right", 32: "space", 70: "warp"};

function trackKeys(codes) {
	var pressed = Object.create(null);
	function handler(event) {
		var down = event.type == "keydown";
		event.preventDefault();
		pressed[codes[event.keyCode]] = down;
	}
	addEventListener("keydown", handler);
	addEventListener("keyup", handler);
	/*// special warp functionality, must come after the other two
	addEventListener("keyup", function(event) {
		if (event.keyCode == 70)
			pressed.warp = true;
		else
			pressed.warp = false;
	});*/

	return pressed;
}

var arrows = trackKeys(arrowCodes);

var gameOptions = Object.create(null);
gameOptions = {
	'showHitRadius': false,
	'playerAccel': 20
};

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
	display.splashScreen = true;
	//pausing event function
	function handleKey(event) {
		if (event.keyCode == 27	) { // keyCode 27 is escape key
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
	
	//splash screen event function; will become deregistered when splash
	//screen == false;
	function endSplashScreen(event) {
		if (event.keyCode == 66) { //keyCode 66 is b key
			display.splashScreen = false;
			runAnimation(animation);
		}
	}
	
	function animation(step) {
	
	/* 	Animation is designed to be run as a callback. Anytime it returns false, 
		it will not run again. Else, it loops endlessly, each time being passed
		a time delta from the last time it ran (usually ~.016 seconds, so ~16
		milliseconds).
	*/ 
	
		if (display.splashScreen) {
			display.drawFrame();
			addEventListener("keydown", endSplashScreen);
			return false;
		} else
			removeEventListener("keydown", endSplashScreen);
		
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

// Asteroid constructor: Asteroid(pos, size, spin, velocity)

function runGame(Display, stages) {
	var player = new Player(new Vector(0,0));
	var level = new Level(stages, player);
	level.actors.push(player);
	level.spawnStageEnemies(level.stages[0]);

	runLevel(level, Display);
}

var GAME_STAGES = [
	{	
		'asteroids': 1,
		'aliens': 1
	},
	{
		'asteroids': 3,
		'aliens': 2
	},
	{
		'asteroids': 5,
		'aliens': 3
	},
	{
		'asteroids': 7,
		'aliens': 4
	}
]

var GAME_STAGES_ALT = Object.create(null);
GAME_STAGES_ALT = {
	1: {'asteroids': {	'qty': 1,
						'nextEnemyTime': 20
					},
		'aliens': 	{	'qty': 1,
						'nextEnemyTime': 30
					}
		},
	2: {'asteroids': {	'qty': 3,
						'nextEnemyTime': 10
					},
		'aliens': 	{	'qty': 3,
						'nextEnemyTime': 20
					}
		},
	3: {'asteroids': {	'qty': 5,
						'nextEnemyTime': 20
					},
		'aliens': 	{	'qty': 5,
						'nextEnemyTime': 20
					}
		} 

}

// end helper stuff

runGame(CanvasDisplay, GAME_STAGES);
