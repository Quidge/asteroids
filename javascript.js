
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

function Level() {

};

//var game = new CanvasDisplay(document.body);
//game.drawFrame(0);