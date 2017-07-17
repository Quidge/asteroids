# Outline
## Level object
#### Vars:
* actors array
* boundaries (top, bottom, left, right)
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
#### Methods
* shoot
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
* position (vector)
* speed (vector)
#### Methods
* fizzle
#### Properties
* type ("missile")

