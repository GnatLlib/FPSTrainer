//constant that define the zoom magnitude and speed for scoping
const SCOPE_MAGNITUDE = 30;
const ZOOM_SPEED = 100;
const GRAVITY = -2;


window.Camera_Movement = window.classes.Camera_Movement = 
class Camera_Movement extends Scene_Component
{
    /*  Camera_Movement is a Scene_Component responsible for controlling first person
        camera and movement */

        constructor( context, control_box){
            super(context,control_box);
            this.context = context;
            this.canvas = context.canvas;
            this.target = function() { return context.globals.movement_controls_target() }
            context.globals.movement_controls_target = function(t) { return context.globals.graphics_state.camera_transform };
            
            // Add in hooks for locking pointer  
            context.canvas.addEventListener("click", () => this.lockPointer());

            // Add in hooks for detecting cursor lock state changes
            document.addEventListener("pointerlockchange", () => this.handlePointerLockChange());
            document.addEventListener("mozpointerlockchange", () => this.handlePointerLockChange());
            document.addEventListener("webkitpointerlockchange", () => this.handlePointerLockChange());
            
            //Initialize movement tracking variables
            this.forward, this.left, this.back, this.right = false, false, false, false;
            this.show = true;
            // Initialize camera angles
            this.eulers = Vec.of(0,0,0);
            this.camVector = Vec.of(0,0,0);
            this.height = 10;

            // Sensitivty and movement parameters
            this.lookSpeed = 0.002;
            this.walkSpeed = 1;

            //Bind class functions that need to be bound
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.applyMovementTransforms = this.applyMovementTransforms.bind(this);
            this.updateCameraView = this.updateCameraView.bind(this);
            this.applyZoomTransforms = this.applyZoomTransforms.bind(this);

            //initialize global pointer locked state
            this.context.globals.pointerLocked = false;

            // Initialize zoom state variable 
            this.currentZoom = 0;

            // Initialize jump states and parameters
            this.lastJumpTime = 0;
            this.jumpCoolDown = 0.5;
            this.jumpForceTime = 0.5;
            this.jumpForce = 7;

            // Initialize gun offset
            this.context.globals.gunOffset = Mat4.translation([0.65, -0.65, -3]).times(Mat4.scale([1.25,1.25,1.25,]));

        }

        //Create Movement control buttons
        make_control_panel() {
            this.key_triggered_button( "Forward",[ "w" ], () =>  this.forward =  true, undefined, () => this.forward = false);  this.new_line();
            this.key_triggered_button( "Left",   [ "a" ], () =>  this.left =  true, undefined, () => this.left = false );
            this.key_triggered_button( "Back",   [ "s" ], () =>  this.back = true, undefined, () => this.back = false );
            this.key_triggered_button( "Right",  [ "d" ], () =>  this.right = true, undefined, () => this.right = false );  this.new_line();
            this.key_triggered_button( "Jump",[ " " ], () =>  this.initiateJump());  
         }

        //Lock pointer handler
        lockPointer(){
            this.canvas.requestPointerLock();
        }

        initiateJump()
        {
            const t = this.context.globals.graphics_state.animation_time / 1000, dt = this.context.globals.graphics_state.animation_delta_time / 1000;
            if (t > this.lastJumpTime + this.jumpCoolDown)
            {

                this.lastJumpTime = t;
            }

        }

        handlePointerLockChange(){

            //If the pointerLockElement is the canvas, then the lock was just activated
            if( document.pointerLockElement === this.canvas ||
                document.mozPointerLockElement === this.canvas ||
                document.webkitPointerLockElement === this.canvas ){
                    //Add in the mousemove listener
                    document.addEventListener("mousemove", this.handleMouseMove);

                    //Toggle global pointer locked state
                    this.context.globals.pointerLocked = true;

                    //Show crosshair
                    //document.getElementById("crosshair").style.display = "block";
                }
            //Otherwise, the lock was just deactivated
            else{
                //Remove the mousemove listener
                document.removeEventListener("mousemove", this.handleMouseMove);

                //Toggle global pointer locked state
                this.context.globals.pointerLocked = false;

                //Hide crosshair
                //document.getElementById("crosshair").style.display = "none";
            }
        }

        //Mousemove event handler 
        handleMouseMove(e){
            // *** FPS camera handling should probably take place here 
            // console.log(e.movementX, e.movementY);
            this.eulers[1] += this.lookSpeed * e.movementX;              // yaw
            this.eulers[2] += this.lookSpeed * e.movementY;              // pitch

            const angleBound = 0.9;

            if (this.eulers[2] < -angleBound)
                this.eulers[2] = -angleBound;
            if (this.eulers[2] > angleBound)
                this.eulers[2] = angleBound;

            //this.updateCameraView();
        }

        // Camera Collision checks for simple unrotated boxes
        handleCameraCollision()
        { 
            const t = this.context.globals.graphics_state.animation_time / 1000, dt = this.context.globals.graphics_state.animation_delta_time / 1000;
            const cameraRadius = 4;
            var jumpForce = 0;
            var yPos = -this.camVector[1];

            // Calculate Jumping
            var diff = t - (this.lastJumpTime + this.jumpForceTime);    
            if (diff < 0)
            {
                // Smoothening the jump force over an impulse time so it isn't instant
               jumpForce = this.jumpForce*(-diff);
            }

            // Some basic kinematics from Physics 1A to update jump height with graviy=ty
            yPos = yPos + (jumpForce + GRAVITY)*(dt^2) * 0.5;

            // Update camera yPos tentatively to be used for collision calculations
            this.camVector[1] = -yPos;

            this.context.globals.workspace.map( (part) => {
                // Get Camera positions
                var xPos = -this.camVector[0];
                var yPos = -this.camVector[1];
                var zPos = -this.camVector[2];

                // Get part parameters
                var partPosition = part.position;
                var partSize = part.size;

                // Calculate box boundaries in world space
                var xUpperBound = partPosition[0] + partSize[0] + cameraRadius;
                var xLowerBound = partPosition[0] - partSize[0] - cameraRadius;

                // Extra height volume due to camera, as if it is a capsule collider
                var yUpperBound = partPosition[1] + partSize[1] + cameraRadius + this.height;           
                var yLowerBound = partPosition[1] - partSize[1] - cameraRadius;

                var zUpperBound = partPosition[2] + partSize[2] + cameraRadius;
                var zLowerBound = partPosition[2] - partSize[2] - cameraRadius;
                
                // Check if Camera position is completely contained inside our box boundaries
                if (xPos < xUpperBound && xPos > xLowerBound && zPos < zUpperBound && zPos > zLowerBound && yPos < yUpperBound && yPos > yLowerBound)
                {
                    // Camera is inside the box, we want to push in the direction closest to the edge
                    var xUpperDiff = Math.abs(xPos - xUpperBound);
                    var xLowerDiff = Math.abs(xPos - xLowerBound);

                    var yUpperDiff = Math.abs(yPos - yUpperBound);
                    var yLowerDiff = Math.abs(yPos - yLowerBound);

                    var zUpperDiff = Math.abs(zPos - zUpperBound);
                    var zLowerDiff = Math.abs(zPos - zLowerBound);

                    // Find the direction that takes the least change to push along box boundaries
                    if (xUpperDiff < xLowerDiff && xUpperDiff < zUpperDiff && xUpperDiff < zLowerDiff && xUpperDiff < yUpperDiff && xUpperDiff < yLowerDiff)
                        this.camVector[0] = -xUpperBound;
                    else if (xLowerDiff < xUpperDiff && xLowerDiff < zUpperDiff && xLowerDiff < zLowerDiff && xLowerDiff < yUpperDiff && xLowerDiff < yLowerDiff)
                        this.camVector[0] = -xLowerBound;
                    else if (zUpperDiff < zLowerDiff && zUpperDiff < xUpperDiff && zUpperDiff < xLowerDiff && zUpperDiff < yUpperDiff && zUpperDiff < yLowerDiff)
                        this.camVector[2] = -zUpperBound;
                    else if (zLowerDiff < zUpperDiff && zLowerDiff < xUpperDiff && zLowerDiff < xLowerDiff && zLowerDiff < yUpperDiff && zLowerDiff < yLowerDiff)
                        this.camVector[2] = -zLowerBound;
                    else if (yUpperDiff < zUpperDiff && yUpperDiff < zLowerDiff && yUpperDiff < xUpperDiff && yUpperDiff < xLowerDiff)
                        this.camVector[1] = -yUpperBound;
                }
            })
        }

        //Function to apply movement camera transforms to graphics_state.camera_transform
        applyMovementTransforms(){
            //Bind post_multiply operation to target and assign to doOperation
            //const doOperation = this.target()[ "post_multiply"].bind( this.target() );

            var dx = 0;
            var dz = 0;

            if(this.forward)
                dz = 2;
            if(this.back)
                dz = -2;
            if(this.left)
                dx = -2;
            if(this.right)
                dx = 2;

            var mat =  this.context.globals.graphics_state.camera_transform;

            
            var forward = Vec.of(mat[2][0], 0, mat[2][2]).times(-dz);               //
            var strafe = Vec.of(mat[0][0], 0, mat[0][2]).times(dx);                //mat[1][0]

            //if we are currently zooming, turn off forward/backward movement
            if(this.currentZoom > 0 && this.currentZoom < SCOPE_MAGNITUDE){
                forward = Vec.of(0,0,0);
            }

            var lookVector = forward.plus(strafe);
            if (lookVector.norm() > 0)
                lookVector = lookVector.normalized();
            //console.log(lookVector.norm());
            lookVector = lookVector.times(this.walkSpeed);
            this.camVector = this.camVector.minus(lookVector);


            // HANDLE COLLISION TEMPORARILY HERE
            this.handleCameraCollision();
        }

        /*  Function to calculate the zoom transform to handle scoping. 
            While this.context.globals.zoomed state is true, the camera will move forwards until it hits the 
            SCOPE_MAGNITUDE upper bound. If the zoomed state is false, the camera will move back towards a 
            zoom of zero.
            */
        applyZoomTransforms(dt){

            //get the current camera view direction
            const viewDirection = this.target()[2];
            //extract the 3-dimensional view vector
            const viewVector = Vec.of(viewDirection[0], viewDirection[1], viewDirection[2]);
            const zoomDirection = this.context.globals.zoomed? 1 : -1;

            const updatedCurrentZoom = this.currentZoom + dt * ZOOM_SPEED * zoomDirection;
            
            const r = this.context.width / this.context.height;
            //if updatedCurrentZoom if <=0 or >= SCOPE_MAGNITUDE, do nothing, otherwise undate currentZoom and move camera
            if (updatedCurrentZoom > 0 && updatedCurrentZoom < SCOPE_MAGNITUDE){
                this.currentZoom = updatedCurrentZoom;
                //this.camVector = this.camVector.plus(viewVector.times(dt * ZOOM_SPEED * zoomDirection));
            }
            else{
                if(updatedCurrentZoom< 0){
                    this.currentZoom = 0;
                }
                else if (updatedCurrentZoom> SCOPE_MAGNITUDE){
                    this.currentZoom = SCOPE_MAGNITUDE;
                }
            }

            if (this.context.globals.zoomed == true)
            {
                document.getElementById("crosshair").style.display = "none";
            }
            else
            {
                document.getElementById("crosshair").style.display = "block";
            }

            //interpolate gunOffset to simulate raising gun to eye based on currentzoom 
            const zoomRatio = 1 - (this.currentZoom/SCOPE_MAGNITUDE);
            this.context.globals.gunOffset = Mat4.translation([0 + 0.65 * zoomRatio, -0.55 - 0.1 * zoomRatio, -2 - 1* zoomRatio]).times(Mat4.scale([1.25,1.25,1.25,]));
            this.context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / (4 + this.currentZoom*0.1), r, .1, 1000);

        }

        updateCameraView(graphics_state){
            var matYaw = Mat4.identity();
            var matPitch = Mat4.identity();

            var yaw = this.eulers[1];
            var pitch = this.eulers[2];

            //console.log(yaw, pitch);
            var mat =  this.context.globals.graphics_state.camera_transform;

            matPitch = matPitch.times(Mat4.rotation(pitch, Vec.of(1, 0, 0)));   
            matYaw = matYaw.times(Mat4.rotation(yaw, Vec.of(0, 1, 0)));

            var matRotate = matPitch.times(matYaw);
            var matTranslate = Mat4.translation(this.camVector);

            var camMatrix = matRotate.times(matTranslate);
            
            // Instead of "post-multiplying" the camera matrix, we're actually just calculating and setting it manually
            this.context.globals.graphics_state.camera_transform = camMatrix;
            
            

        }

        display(graphics_state){
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

            //Apply the movement camera transforms
            this.applyMovementTransforms();
            this.applyZoomTransforms(dt);
            this.updateCameraView(graphics_state);
        }

}