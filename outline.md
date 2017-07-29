# Outline
## Level object
#### Vars:
* actors array
* length
* height
* origin (middle of length and height)
* player
* status (game running, game ended, etc; default is null (running)
#### Methods:
* animate  
  * runs if actions this.status != null
  * runs actor.act on all actors
  * runs level.checkClip on all actors stores 
* transport (takes actor, new Vector): changes actor.pos to second arg Vector
* checkClip (takes actor) returns actor.type (or "wall") if actor.hitRadius is touching anything   
* spawnAsteroid: creates new Asteroid with random attributes and adds it to the level.actors array
* removeActor(actor) if actor is in this.actors array, remove actor from array and return true else return false
* resolveCollition(actor, collision) does stuff to actor based on the collision object

## Helper stuff
### Vector
#### Vars:
* x and Y
#### Methods
* plus
* times

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
#### Methods
* fizzle
#### Properties
* type ("missile")

