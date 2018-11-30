//Global constants controlling target properties
const TARGET_SIZE = 2.5;
const TARGET_LIFETIME = 3;

window.Target_Manager = window.classes.Target_Manager =
    class Target_Manager extends Scene_Component {
        /*
            Target_Manager is a Scene_Component responsible for rendering the target in the map
            */

        constructor(context, control_box) {

            super(context, control_box);
            this.context = context;
            this.canvas = context.canvas;


            this.target = function () {
                return context.globals.movement_controls_target()
            }
            context.globals.movement_controls_target = function (t) {
                return context.globals.graphics_state.camera_transform
            };

            //bind functions
            this.generateTargets = this.generateTargets.bind(this);
            this.drawTargets = this.drawTargets.bind(this);
            this.randomCoord = this.randomCoord.bind(this);

            //create target array to keep track of the current targets and attach to context.globals
            this.activeTarget = [];
            this.context.globals.activeTarget = this.activeTarget;

            const shapes = {
                target: new Subdivision_Sphere(4),
            }

            this.submit_shapes(context, shapes);

            this.materials =
                {
                    phong: context.get_instance(Phong_Shader).material(Color.of(125 / 255, 115 / 255, 115 / 255, 1), {ambient: 1}),
                };
        }

        randomCoord() {
            //get the current camera view direction
            const viewDirection = this.target()[2];
            //extract the 3-dimensional view vector
            const viewVector = Vec.of(viewDirection[0], viewDirection[1], viewDirection[2]);

            //get the current camera position
            const inverseCameraMatrix = Mat4.inverse(this.target());
            const cameraPosition = Vec.of(inverseCameraMatrix[0][3], inverseCameraMatrix[1][3], inverseCameraMatrix[2][3]);

            const randx = Math.random()*80 + 70;
            const randy = Math.random()*80 + 70;
            const randz = Math.random()*80 + 70;
            
            let trans = Mat4.translation(cameraPosition).times(Mat4.translation([viewVector[0] * -randx, viewVector[1] * -randy, viewVector[2] * -randz]));
            return trans;
        }

        generateTargets() {
            //create the model_transform for the two targets
            let targetTransform1 = this.randomCoord().times(Mat4.scale([TARGET_SIZE, TARGET_SIZE, TARGET_SIZE]));
            let targetTransform2 = this.randomCoord().times(Mat4.scale([TARGET_SIZE, TARGET_SIZE, TARGET_SIZE]));
            

            //console.log(targetTransform1);

            //create the target object to keep track of this bullet
            let target1 = {
                location: targetTransform1,
                genTime: this.context.globals.graphics_state.animation_time / 1000,
            };

            let target2 = {
                location: targetTransform2,
                genTime: this.context.globals.graphics_state.animation_time / 1000,
            };
            if(this.activeTarget.length < 2){
                this.activeTarget.push(target1);
                this.activeTarget.push(target2);
            }
        }

        drawTargets(graphics_state, t) {
            this.activeTarget.map((target) => {

                //check to see if target lifetime has expired
                if(t - target.genTime > TARGET_LIFETIME
        )
            {
                this.activeTarget.shift();
                return;
            }
            const p = t%TARGET_LIFETIME/TARGET_LIFETIME;
            this.shapes.target.draw(graphics_state, target.location, this.materials.phong.override({ color: Color.of(0+p,0,1-p,1) }));
        })
        }

        display(graphics_state) {
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
               

            if (Math.floor(t%TARGET_LIFETIME) == 0)
                this.generateTargets();

           this.drawTargets(graphics_state, t);
        }
    }
