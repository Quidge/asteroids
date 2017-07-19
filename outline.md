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
#### Methods
* shoot
* turn
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

