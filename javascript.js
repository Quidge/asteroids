/* 	Glossary:
		Actors: elements that can interact with each other
			- ship is actor
			- ship missiles are actors
			- asteroids are actors
		AnimationTime(also often called "step"): time since last update frame, usually in milliseconds
		Viewport: boundary that actors can exist in
			- when actor goes past viewport boundary, actor will come back through inverse viewport location
				example: 
					- viewport boundary is 600x600
					- actor exits boundary at location 0x455
					- actor will reenter viewport with same trajectory and velocity at inverse of viewport boundary exit
					- actor reenters viewport at boundary location 600x145
		KeyList: list of keyCodes that will trigger events
		Level: object representing the state of Actors and all other moving objects


	Basic organization:
		- Game state is held inside Level
			- Level.animate(step, keys) is a method that takes a time increment (step), the keys pressed for that step, and animates the Level actors 
		- CanvasDisplay displays the default stuff that doesn't have to be handled by Level (borders, background, etc)
		- CanvasDisplay displays Level, including Level actors

	Basic operation:		
		- At each frame, CanvasDisplay
			- increments animationTime with time since last frame
			- clears canvas
			- draws background
			- interacts with Level:
				- passes animationTime increment to Level
				- receives new game state from Level
				- animates new game state onto canvas
			 
*/

// CanvasDisplay constructor
function CanvasDisplay(parent) {
	this.canvas = document.createElement("canvas");
	this.canvas.width = 600;
	this.canvas.height = 600;
	parent.appendChild(this.canvas);
	this.cx = this.canvas.getContext("2d");
	
	this.animationTime = 0;
	
} 
// Begin CanvasDisplay methods
CanvasDisplay.prototype.clear = function() {
	this.canvas.parentNode.removeChild(this.canvas);
}

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
	// empty
};

//var game = new CanvasDisplay(document.body);
//game.drawFrame(0);