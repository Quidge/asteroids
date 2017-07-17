## Glossary
#### Actors: elements that can interact with each other
* ship is an actor
* ship missiles are actors
* asteroids are actors
#### AnimationTime(also often called "step"): time since last update frame, usually in milliseconds
#### Viewport: boundary that actors can exist in
* when actor goes past viewport boundary, actor will come back through inverse viewport location
  * example: 
    * viewport boundary is 600x600
    * actor exits boundary at location 0x455
    * actor will reenter viewport with same trajectory and velocity at inverse of viewport boundary exit
    * actor reenters viewport at boundary location 600x145
#### KeyList: list of keyCodes that will trigger events
#### Level: object representing the state of Actors and all other moving objects

## Basic organization:
#### Game state is held inside Level
* Level.animate(step, keys) is a method that takes a time increment (step), the keys pressed for that step, and animates the Level actors 
* CanvasDisplay displays the default stuff that doesn't have to be handled by Level (borders, background, etc)
* CanvasDisplay displays Level, including Level actors

## Basic operation:		
#### At each frame, CanvasDisplay
1. increments animationTime with time since last frame
2. clears canvas
3. draws background
4. interacts with Level:
  1. passes animationTime increment to Level
  2. receives new game state from Level
  3. animates new game state onto canvas