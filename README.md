# CS 174a Group 20 Term Project


## Overview
3D aim trainer for First Person Shooter game. </br>The main goal of the game is for the player to shoot down as many targets as they can accurately and quickly.
  </br>Each round, targets that last 3 seconds are generated 2 at a time with total of 20 targets. Player will gain points by shooting down targets. Player will gain more points if they can shoot down targets faster.
  </br>At the end of the round, player can see how accurate their aim was and total points they got.

## Contribution
Bill Tang: Implementation of gun animation/firing, volumetric lighting, shadow-mapping, and skybox.
  </br>Harrison Yuan:
  </br>Evan Kim: Contributed on camera(player) movement, target management, map development, and html overlay.

## Instructions
To run the game, simply run the server by opening host.command or host.bat file. The game will run on localhost:8000.
  </br>There are serveral aspects in using our game. First, the player can move with keyboard and mouse movement. To enable mouse movement, it must be locked which is done simply by clicking on canvas area. Player can unlock their mouse anytime by pressing 'esc' button.
  </br>Player can move forward, left, back, right with w,a,s,d keyboard buttons respectively and change their view with mouse movement. Player can also jump with space button.
  </br>When player presses t keyboard button, a round of aim training starts.
  </br>To shoot, player simply needs to click the left mouse button. By clicking the right mouse button, player can zoom in their scope.

## Advanced topics covered: </br>
collision of bullets and targets, collision of player and map objects
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

