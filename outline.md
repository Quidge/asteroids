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
* wallAt (takes actor arg): if middle of actor.hitbox touches wall, translate actor.pos to inverse wall coords


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
###### Constants
* size (vector)
* hitRadius (collision detection "box", but as a circle)
* turnSpeed (max speed player can turn 
* accel (the value which is used to determine at which Player.speed can increase)
#### Methods
* turn
* jet (affects change in velocity)
* updatePosition (takes new velocity and applies it to position)
#### Properties
* type ("player")

### Asteroid
#### Vars
* position (vector)
* size (vector)
* speed (vector)
* rotation 
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

