//Global constants controlling bullet properties
const BULLET_VELOCITY = 3000;
const BULLET_SIZE = 0.1;
const BULLET_LIFETIME = 1;


window.Aiming_Manager = window.classes.Aiming_Manager = 
class Aiming_Manager extends Scene_Component
{
    /*
        Aiming_Manager is a Scene_Component responsible for rendering the aim cusor and 
        keeping track of the aimed location of the player
        */

        constructor( context, control_box){

            super(context, control_box);
            this.context = context;
            this.canvas = context.canvas;

            
            this.target = function() { return context.globals.movement_controls_target() }
            context.globals.movement_controls_target = function(t) { return context.globals.graphics_state.camera_transform };

            //create firing callback function and attach to context.globals
            this.fireBullet = this.fireBullet.bind(this);
            this.context.globals.fireBullet = this.fireBullet;

            //create bullet array to keep track of the current bullets and attach to context.globals
            this.activeBullets = [];
            this.context.globals.activeBullets = this.activeBullets;

            const shapes = {
                bullet: new Subdivision_Sphere(4),
            }

            this.submit_shapes(context, shapes);
            this.materials =
                {
                    phong: context.get_instance(Phong_Shader).material(Color.of(0.5, 0.5, 0.5, 1), {ambient: 1}),
                };

               
        }

        fireBullet(){

            //get the current camera view direction
            const viewDirection = this.target()[2];
            //extract the 3-dimensional view vector
            const viewVector = Vec.of(viewDirection[0], viewDirection[1], viewDirection[2]);

            //get the current camera position 
            const inverseCameraMatrix = Mat4.inverse(this.target());
            const cameraPosition = Vec.of(inverseCameraMatrix[0][3], inverseCameraMatrix[1][3], inverseCameraMatrix[2][3]);

            //create the transform matrix for the new bullet
            const translationMatrix = Mat4.translation(cameraPosition).times(Mat4.translation([viewDirection[0]*-3, viewDirection[1]*-3, viewDirection[2]*-3]));

            //create the model_transform for the initial position of the new bullet and scale according to BULLET_SIZE
            let bulletTransform = Mat4.identity().times(translationMatrix).times(Mat4.scale([BULLET_SIZE, BULLET_SIZE, BULLET_SIZE]));

            //create the bullet object to keep track of this bullet
            let bullet = {
                location: bulletTransform,
                direction: viewVector,
                firedTime: this.context.globals.graphics_state.animation_time/1000,
            };

            this.activeBullets.push(bullet);
      
        }
        
        display(graphics_state){
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;
            
            //const test_sphere = Mat4.identity().times(Mat4.translation([0, 10, -15]));
            //console.log(dt);

            this.activeBullets.map( (bullet) => {
                
                //check to see if bullet lifetime has expired
                if( t - bullet.firedTime > BULLET_LIFETIME){
                    this.activeBullets.shift();
                    return;
                }
                
                const bulletDisplacement= -dt * BULLET_VELOCITY;
                //translate bullet based on elapsed time
                const bulletTransform = bullet.location
                    .times(Mat4.translation([bullet.direction[0] * bulletDisplacement, bullet.direction[1] * bulletDisplacement, bullet.direction[2] * bulletDisplacement]));
                this.shapes.bullet.draw(graphics_state, bulletTransform, this.materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));

                //update bullet location 
                bullet.location = bulletTransform;
             })
        }
    }