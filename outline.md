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
* position (vector)
* size (vector)
* speed (vector)
* orient(ation) (in radians)
* turnSpeed
* accel (the value which is used to determine at which Player.speed can increase)
#### Methods
* shoot
* turn
* jet (only allows motion in direction of Player.orient)
* updatePosition (takes a step increment and vector. changes Player.pos based)
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

