# CS 174a Group 20 Term Project


## Overview
3D aim trainer for First Person Shooter game. </br>The main goal of the game is for the player to shoot down as many targets as they can accurately and quickly.
  </br>Each round, targets that last 3 seconds are generated 2 at a time with total of 20 targets. Player will gain points by shooting down targets. Player will gain more points if they can shoot down targets faster.
  </br>At the end of the round, player can see how accurate their aim was and total points they got.

## Contribution
Bill Tang: Implementation of gun animation/firing, volumetric lighting, shadow-mapping, and skybox.
  </br>Harrison Yuan: Camera/player movement and jumping, map development, terrain generation, player-to-terrain collision, target collision, round scoring system
  </br>Evan Kim: Contributed on camera(player) movement, target generation/management/collision, map development, and html overlay.

## Instructions
To run the game, simply run the server by opening host.command or host.bat file. The game will run on localhost:8000.
  </br>There are serveral aspects in using our game. First, the player can move with keyboard and mouse movement. To enable mouse movement, it must be locked which is done simply by clicking on canvas area. Player can unlock their mouse anytime by pressing 'esc' button.
  </br>Player can move forward, left, back, right with w,a,s,d keyboard buttons respectively and change their view with mouse movement. Player can also jump with space button.
  </br>When player presses t keyboard button, a round of aim training starts.
  </br>To shoot, player simply needs to click the left mouse button. By clicking the right mouse button, player can zoom in their scope.

## Advanced topics covered: </br>
- collisions of bullets to targets, camera/player to map objects
- volumetric lighting
- shadows
- advanced camera movement


## Implementation Overviews

### Volumetric-Lighting:
Volumetric lighting is used to render a realistic sun with volumetric rays. This was implemented using a in post processing by first rendering the scene with obstrucing geometry rendered black to an occlusion texture. Then applying a filter based on the light position and occlusion texture in an post processing pass using custom GLSL shaders

### Skybox:
Skybox is implemented using a set of custom GLSL Shaders using WebGl's TEXTURE_CUBE_MAP texture. The skybox along with the sun is rendered with a fixed location.

### Shadows:
Our attempt at shadow implementation is done through shadow-mapping. The scene is first rendered from the light source's view using a set of custom GLSL shaders that encodes the vertex depth into a shadow map texture. This texture is then used in a heavily modifed Phong GLSL shader to compute when a pixel should be darkened due to being in shadow. 

### Collisions:
We have two types of collisions in the game implemented separately.

The first type of collision is a simplified spherical collision check for registering bullet hits on targets. The implementation is slightly hardcoded, relying on simply calculating the distance between the bullet and the target position. If the distance between the two is less than the sum of their radius/size, then we can assume that the bullet is definitely inside the target and has collided. The current limitation with this implementation is that as bullet velocity increases, the distances between each frame update step for the bullet position increase as well. If it gets too spaced apart, the bullet could pass through the target without ever being inside it.

The second type of collision involves the camera/player position, checking for collisions with terrain blocks in the map as well as map boundaries and floor. In this implementation, we check if the camera position is about to be inside a given box based on its movement direction. If the camera is inside the box, we check for the closest face direction to push the camera out of the box along the box collision boundaries. In addtion, we added a small collision radius buffer on the x-z plane and some height for the camera, such that its collision shape can be described as an upright capsule-like shape. This is to prevent the camera and gun model from clipping into the faces boxes with the extra collision buffer zone and approximate a humanoid-like shape. To simplifiy implementation, this collision only works accurately on unrotated blocks. 

### Camera:
Camera movement takes two inputs, the change in mouse.x and mouse.y positions.
</br>Using change in mouse.x, we calculate a yaw rotation matrix and using change in mouse.y, we calculate a pitch matrix.
</br>We multiply the two together to get the full rotation matrix.
</br>After updating the camera transform based on user input controls on movement and current look direction of the camera, we retrieve the camera's updated translation matrix.
</br>We update our final camera transform based on the full rotation matrix and the new translation matrix to complete our first person camera implementation.
