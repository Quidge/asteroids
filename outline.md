# Outline
## Level object(stages, player)
#### Vars:
* actors array
* length
* height
* origin (middle of length and height)
* status (game running, game ended, etc; default is null (running)
* elapsedGameTime (total gametime that has been 'stepped'
* elapsedStageTime (total time spent on current stage, gets reset back to 0 after advancing stages)
* stages: holds the array of game stages
* currentStage: holds the current 'stage' or 'level' that the player is on
* player: direct reference to the controlled Player object, doesn't go through this.actors. (I don't feel comfortable always assuming player will be actors[0]). 
* playerRespawnAt (either false or a timeStamp that is usually at some point ahead of gameElapsedTime)
* livesLeft (player lives remaining)

#### Methods:
* animate  
  * runs if actions this.status != null
  * runs actor.act on all actors
  * runs level.checkClip on all actors stores (adds to playerPoints if missile collides with asteroid)
  * runs getEnemyQue which returns a que of enemies to populate and an updated stage (reflecting the new enemies that have been given to que (if any))
  * runs spawnStageEnemies and adds any que enemies from getEnemyQue to the actors list
  * finally, runs checks to determine if game should move on to the next stage
* transport (takes actor, new Vector): changes actor.pos to second arg Vector
* checkClip (takes actor) returns actor.type (or "wall") if actor.hitRadius is touching anything   
* parseStage(stageObject): builds an array of enemies from the stage passed to it
* getEnemyQue(elapsedStageTime, parsedStage, forceSpawn = true/false): returns a que of what to spawn, and an updated parsedStage that reflects any additions to the que
* spawnStageEnemies(simple array list of enemies): given a simple of things to spawn (["asteroid", "alien", "alien"]), spawnStageEnemies creates the actual enemy Actor Objects and returns them in an array
* getRandomAsteroid: returns new Asteroid with random attributes (though pos is always from one of the walls)
* removeActor(actor) if actor is in this.actors array, remove actor from array and return true else return false
* resolveCollision(actor, collision) does stuff to actor based on the collision object
* calcPointVal(actor) returns a rounded number that is based on the size of the actor
* checkForEnemies(array) returns true if any elements in the supplied array are asteroid
* spawnStageEnemies(stage) spawns the enemies listed in the arg stage

## Helper stuff
### Vector
#### Vars:
* x and Y
#### Methods
* plus
* times
### gameOptions (object with various properties, most having boolean values)
### getRandom(min, max) returns floating point number between min and max

### runLevel (function itself)
* takes level object and Display constructor
* creates new object from passed Display constructor
* in charge of using runAnimation

### runGame (function itself)
* takes Display constructor
* constructs new Level object 
* pushes a new Player actor to actors in the newly created Level object
* runs runLevel with the level object and passed Display constructor


### runAnimation (function itself)
### arrowCodes (global var)
* stores keys to search through when keydown or keyup event is heard
### trackKeys(codes) (function itself)
* expects object list of keys and keycodes
* returns object holding true or false for the keys in codes evaluating to "keydown"

## Actors

### Player
#### Vars
* position (vector) (this is in reference to global origin)
* velocity (vector) 
* orient(ation) (in radians) (this is reference to global origin)
* gunsReady (at 100 they are ready to fire, firing sets gunsReady to 0 and 
* playerPoints
* warping: boolean
###### Constants
* size (vector)
* hitRadius (collision detection "box", but as a circle); radius is avg between actor.size.x/2 and actor.size.y/2
* turnSpeed (max speed player can turn)
* accel (the value which is used to determine at which Player.speed can increase)
#### Methods
* act
* shoot: triggers when spacebar event is detected. adds Missile to level.actors
* turn
* jet (affects change in velocity)
* updatePosition (takes new velocity and applies it to position)
* warp
#### Properties
* type = "player"

### Asteroid
#### Vars
* position (vector)
* size (vector)
* hitRadius
* spin 
* velocity (vector)
#### Methods
* fracture
#### Properties
* type ("asteroid")

### Missiles
#### Vars
* position (vector)
* size (vector)
* speed
#### Properties
* type ("missile")
* createdByType: undefined if not explicitly set, otherwise set at instantiation (ostensibly to "alien" or "player")

### Alien
#### Vars
* position (vector)
* size (vector)
* hitRadius (circle thing again)
* velocity
* gunsReady
* cycle (incremented by step, needed to calc sin wave position)
* orient
#### Methods
* act (this will be run in level.animate > actors.forEach loop)
* shoot (fire if guns are 'ready')
* update position oscillating cosine behavior

