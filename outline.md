# Outline
## Level object
#### Vars:
* actors array
* length
* height
* origin (middle of length and height)
* player

## Helper stuff
### Vector
#### Vars:
* x and Y
#### Methods
* plus
* times

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

