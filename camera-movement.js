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
        }

        //Create Movement control buttons
        make_control_panel() {
            this.key_triggered_button( "Forward",[ "w" ], () =>  this.forward =  true, undefined, () => this.forward = false);  this.new_line();
            this.key_triggered_button( "Left",   [ "a" ], () =>  this.left =  true, undefined, () => this.left = false );
            this.key_triggered_button( "Back",   [ "s" ], () =>  this.back = true, undefined, () => this.back = false );
            this.key_triggered_button( "Right",  [ "d" ], () =>  this.right = true, undefined, () => this.right = false );  this.new_line();
         }

        //Lock pointer handler
        lockPointer(){
            this.canvas.requestPointerLock();
        }

        handlePointerLockChange(){

            //If the pointerLockElement is the canvas, then the lock was just activated
            if( document.pointerLockElement === this.canvas ||
                document.mozPointerLockElement === this.canvas ||
                document.webkitPointerLockElement === this.canvas ){
                    //Add in the mousemove listener
                    document.addEventListener("mousemove", this.handleMouseMove);

                    //Show crosshair
                    document.getElementById("crosshair").style.display = "block";
                }
            //Otherwise, the lock was just deactivated
            else{
                //Remove the mousemove listener
                document.removeEventListener("mousemove", this.handleMouseMove);

                //Hide crosshair
                document.getElementById("crosshair").style.display = "none";
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

            //console.log(forward);
            //console.log(this.camVector);

            var lookVector = forward.plus(strafe);
            if (lookVector.norm() > 0)
                lookVector = lookVector.normalized();
            //console.log(lookVector.norm());
            lookVector = lookVector.times(this.walkSpeed);
            this.camVector = this.camVector.minus(lookVector);

            // HANDLE COLLISION TEMPORARILY HERE
            const mapBound = 90;
            this.camVector[1] = -this.height;
            if (this.camVector[0] > mapBound)
                this.camVector[0] = mapBound;
            if (this.camVector[0] < -mapBound)
                this.camVector[0] = -mapBound;
            if (this.camVector[2] > mapBound)
                this.camVector[2] = mapBound;
            if (this.camVector[2] < -mapBound)
                this.camVector[2] = -mapBound;
        }

        updateCameraView(){
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

            //Apply the movement camera transforms
            this.applyMovementTransforms();
            this.updateCameraView();
        }

}