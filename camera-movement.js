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

            //Bind class functions that need to be bound
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.applyMovementTransforms = this.applyMovementTransforms.bind(this);

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
                }
            //Otherwise, the lock was just deactivated
            else{
                //Remove the mousemove listener
                document.removeEventListener("mousemove", this.handleMouseMove);
            }
        }

        //Mousemove event handler 
        handleMouseMove(e){
            // *** FPS camera handling should probably take place here 
            console.log(e);
        }

        //Function to apply movement camera transforms to graphics_state.camera_transform
        applyMovementTransforms(){
            //Bind post_multiply operation to target and assign to doOperation
            const doOperation = this.target()[ "post_multiply"].bind( this.target() );

            if(this.forward)
                doOperation(Mat4.translation([0,0,-1.5]));
            if(this.left)
                doOperation(Mat4.translation([-1.5,0,0]));
            if(this.right)
                doOperation(Mat4.translation([1.5,0,0]));
            if(this.back)
                doOperation(Mat4.translation([0,0,1.5]));
        }


        display(graphics_state){

            //Apply the movement camera transforms
            this.applyMovementTransforms();
        }

}