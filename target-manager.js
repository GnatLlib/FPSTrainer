//Global constants controlling target properties
const TARGET_SIZE = 2.5;
const TARGET_LIFETIME = 3;
const TARGET_SCORE_FACTOR = 100;

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
            this.moveWithinMap_xz = this.moveWithinMap_xz.bind(this);
            this.moveWithinMap_y = this.moveWithinMap_y.bind(this);

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
            
            this.roundScore = 0;
            this.roundActive = false;  
            this.roundTargetsLeft = 0;

            this.globals.totalShots = 0;
            this.globals.totalHits = 0;
        }

        make_control_panel() {
            this.key_triggered_button( "Begin round",[ " " ], () =>  this.startRound());  
            this.new_line();
            this.new_line();
            
            /* doesn't update live, not sure what this uses
            this.control_panel.innerHTML += "Round Active: " + (this.roundActive ? "true" : "false");
            this.new_line();
            this.control_panel.innerHTML += "Round Score: " + (this.roundScore);
            this.new_line();
            this.control_panel.innerHTML += "Targets Left: " + (this.roundTargetsLeft);
            */
        }

        startRound()
        {
            console.log("Start round");
            if (this.roundActive == false)
            {
                this.roundActive = true;
                this.roundScore = 0;
                this.roundTargetsLeft = 20;
                this.globals.totalShots = 0;
                this.globals.totalHits = 0;
            }
        }

        endRound()
        {
            console.log("End round")
            this.roundActive = false;
            this.roundTargetsLeft = 0;
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
            
            targetTransform1[0][3] = this.moveWithinMap_xz(targetTransform1[0][3]);
            targetTransform1[2][3] = this.moveWithinMap_xz(targetTransform1[2][3]);
            targetTransform1[1][3] = this.moveWithinMap_y(targetTransform1[1][3]);

            targetTransform2[0][3] = this.moveWithinMap_xz(targetTransform2[0][3]);
            targetTransform2[2][3] = this.moveWithinMap_xz(targetTransform2[2][3]);
            targetTransform2[1][3] = this.moveWithinMap_y(targetTransform2[1][3]);

            //create the target object to keep track of this bullet
            let target1 = {
                location: targetTransform1,
                genTime: this.context.globals.graphics_state.animation_time / 1000,
            };

            let target2 = {
                location: targetTransform2,
                genTime: this.context.globals.graphics_state.animation_time / 1000,
            };
            
            if (this.activeTarget.length < 2){
                this.activeTarget.push(target1);
                this.activeTarget.push(target2);
                this.roundTargetsLeft -= 2;
                console.log(this.roundTargetsLeft + " targets left");
            }
        }

        moveWithinMap_xz(pos) {
                if(pos < -97.5)
                        return -97.5
                else if(pos > 97.5)
                        return 97.5
                return pos
        }
        moveWithinMap_y(pos) {
                if(pos < 0)
                        return 10
                return pos
        }

        drawTargets(graphics_state, t) {
            this.activeTarget.map((target) => {
                //check to see if target lifetime has expired
                if (t - target.genTime > TARGET_LIFETIME)
                {
                    this.activeTarget.shift();
                    return;
                }
                const p = t%TARGET_LIFETIME/TARGET_LIFETIME;
                if (target.hit == true)
                {
                    this.shapes.target.draw(graphics_state, target.location, this.materials.phong.override({ color: Color.of(0,1,0,1) }));
                    var score = Math.ceil((TARGET_LIFETIME - (target.hitTime - target.genTime)) / TARGET_LIFETIME * TARGET_SCORE_FACTOR);
                    if (target.scored != true)
                    {
                        this.roundScore += score;   
                        console.log("score", score);
                        console.log("total score", this.roundScore);
                        console.log("accuracy", this.globals.totalHits/this.globals.totalShots);
                        target.scored = true;
                    }
                }
                else
                {   
                    this.shapes.target.draw(graphics_state, target.location, this.materials.phong.override({ color: Color.of(0+p,0,1-p,1) }));
                }
                
            })

        }

        display(graphics_state) {
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
               
            if (this.roundActive == true)
            {
                if (this.roundTargetsLeft > 0 && Math.floor(t%TARGET_LIFETIME) == 0)
                    this.generateTargets();

                if (this.roundTargetsLeft <= 0)
                    this.endRound();
            }
            this.drawTargets(graphics_state, t);

            this.scoreNode.nodeValue = this.roundScore;
            this.targetsNode.nodeValue = this.roundTargetsLeft;
               
        }
    }
