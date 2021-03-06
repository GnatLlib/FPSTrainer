//Global constants controlling bullet properties
const BULLET_VELOCITY = 2000;
const BULLET_SIZE = 0.1;
const BULLET_LIFETIME = 3;


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

            //bind functions
            this.fireBullet = this.fireBullet.bind(this);
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.toggleZoom = this.toggleZoom.bind(this);
            this.drawBullets = this.drawBullets.bind(this);
            this.drawGun = this.drawGun.bind(this);

            //add document listeners 
            document.addEventListener('mousedown', this.handleMouseDown);
            document.addEventListener('mouseup', this.handleMouseUp);

            //initialize zoom state
            this.context.globals.zoomed = false;

            //create bullet array to keep track of the current bullets and attach to context.globals
            this.activeBullets = [];
            this.context.globals.activeBullets = this.activeBullets;

            const shapes = {
                bullet: new Subdivision_Sphere(4),
                rifle: new Shape_From_File("/assets/M16.obj"),
            }

            this.submit_shapes(context, shapes);
            this.materials =
                {
                    phong: context.get_instance(Phong_Shader).material(Color.of(0.5, 0.5, 0.5, 1), {ambient: 1}),
                    gun: context.get_instance(Phong_Shader).material( Color.of( 0,0,0,1),       
            { ambient: 1, texture: this.context.get_instance( "/assets/M16_diffuse.jpeg" ) } )
                };

               
        }

        handleMouseDown(e){

            //if the pointer is not in the locked state, do nothing
            if (!this.context.globals.pointerLocked){
                return;
            }

            //if left click, fire bullet
            if(e.button === 0){
                this.fireBullet();
            }

            //if right click, toggle zoom in 
            if (e.button === 2){
                this.toggleZoom();
            }

        }

        handleMouseUp(e){
            //if the pointer is not in the locked state, do nothing
            if (!this.context.globals.pointerLocked){
                return;
            }

            //if right mouse button released, toggle zoom in
            if (e.button === 2){
                this.toggleZoom();
            }
        }

        toggleZoom(){

            //toggle global zoomed variable
            this.context.globals.zoomed = !this.context.globals.zoomed; 
            //console.log(this.context.globals.zoomed);  
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
            this.globals.totalShots += 1;
      
        }

        checkCollision(bulletPosition, t){
            var bulletPos = Vec.of(bulletPosition[0][3], bulletPosition[1][3], bulletPosition[2][3]);

            var hit = false
            const targets = this.context.globals.activeTarget;
            targets.map(target => {
                var targetPos = Vec.of(target.location[0][3], target.location[1][3],target.location[2][3]);
                var diff = targetPos.minus(bulletPos);
                var distance = Math.sqrt(diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2]);
                if (distance <= 2.5 && target.hit != true)
                {
                    target.hit = true;
                    target.hitTime = t;
                    hit = true;
                }
            })
            return hit;
        }

        drawBullets(graphics_state, t, dt){
            this.activeBullets.map( (bullet) => {
                
                // check to see if bullet lifetime has expired
                if( t - bullet.firedTime > BULLET_LIFETIME){
                    this.activeBullets.shift();
                    return;
                }
                
                const bulletDisplacement= -dt * BULLET_VELOCITY;
                //translate bullet based on elapsed time
                const bulletTransform = bullet.location
                    .times(Mat4.translation([bullet.direction[0] * bulletDisplacement, bullet.direction[1] * bulletDisplacement, bullet.direction[2] * bulletDisplacement]));

                //check to see if new bullet location is a collision
                if (this.checkCollision(bulletTransform, t) == true){
                    this.activeBullets.shift();
                    this.globals.totalHits += 1;
                    return;
                }

                this.shapes.bullet.draw(graphics_state, bulletTransform, this.materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
                //update bullet location 
                bullet.location = bulletTransform;
             })
        }

        drawGun(graphics_state){
            
            var gunTransform = this.context.globals.gunOffset;
            var gunMatrix = Mat4.inverse(this.target()).times(gunTransform);
               
            var shapes = this.context.globals.shapes;
            var materials = this.context.globals.materials;
    
            this.shapes.rifle.draw(graphics_state, gunMatrix, this.materials.gun);
        }
   
        display(graphics_state){
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

            this.drawGun(graphics_state);
            
            this.drawBullets(graphics_state, t, dt);
        
        }
    }