const NUM_PARTS = 50;
const MAP_BOUNDS = 200;

window.Map_Environment = window.classes.Map_Environment =
class Map_Environment extends Scene_Component
{
    /*
        Map_Environment is a Scene_Component responsible for rendering static map elements
        and objects that should be affected by collisions
        */
        constructor( context, control_box){

            super(context, control_box);
            this.context = context;
            this.canvas = context.canvas;
            this.target = function() { return context.globals.movement_controls_target() }

            context.globals.movement_controls_target = function(t) { return context.globals.graphics_state.camera_transform };
            
            const shapes = {
                box: new Cube(),
                axis: new Axis_Arrows,
                sphere: new Subdivision_Sphere(4),
            };

            this.submit_shapes(context, shapes);

            //save global sun Position
            this.context.globals.graphics_state.sunPosition = Vec.of(50,100,100);

            //bind sunRender
            this.context.globals.graphics_state.sunRender = () => {console.log("SUN RENDER")};
        
            this.context.globals.workspace = [];
            this.build_map();
        }

        add_object(name, size, position, shape, material, rotation){        
            if (rotation == null){
               rotation = Mat4.rotation(0, Vec.of(1,0,0));
            }

            let part = {
                name: name,
                size: size,
                position: position,
                rotation: rotation,
                shapes: shape,
                material: material,
            }

            this.context.globals.workspace.push(part);
        }

        getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }

        build_map() {
            // Baseplate
            var ground_material = this.context.get_instance(Phong_Shader).material();
            ground_material.color = Color.of(35/255,55/255,35/255,1);
            ground_material.ambient = 1;
            this.add_object("base", [MAP_BOUNDS, 1, MAP_BOUNDS], [0, -5, 0], this.shapes.box, ground_material);

            // Walls
            var wall_material = this.context.get_instance(Phong_Shader).material();
            wall_material.color = Color.of(125/255,105/255,105/255,1);
            wall_material.ambient = 0.2;

            this.add_object("wall", [MAP_BOUNDS, 20, 1], [0, 5, -MAP_BOUNDS], this.shapes.box, wall_material);
            this.add_object("wall", [MAP_BOUNDS, 20, 1], [0, 5, MAP_BOUNDS], this.shapes.box, wall_material);
            this.add_object("wall", [1, 20, MAP_BOUNDS], [MAP_BOUNDS, 5, 0], this.shapes.box, wall_material);
            this.add_object("wall", [1, 20, MAP_BOUNDS], [-MAP_BOUNDS, 5, 0], this.shapes.box, wall_material);

            // Sun
            var sun_material = this.context.get_instance(Phong_Shader).material()
                .override({ useFixed: true, alwaysWhite:true});
            sun_material.color = Color.of(255/255,255/255,255/255,1);
            sun_material.diffusivity = 0;
            sun_material.ambient = 1;
            sun_material.specularity = 0;

        
            this.add_object("sun", [6, 6, 6], this.context.globals.graphics_state.sunPosition, this.shapes.sphere, sun_material);
            

            // Targets
            var terrain_material = this.context.get_instance(Phong_Shader).material();
            terrain_material.color = Color.of(125/255,115/255,115/255,1);
            terrain_material.ambient = 1;

            this.add_object("terrain", [40, 5, 40], [50, 0, 200], this.shapes.box, terrain_material, Mat4.rotation(0, Vec.of(0,1,0)));
            this.add_object("terrainl", [4, 10, 4], [20, 0, 20], this.shapes.box, terrain_material, Mat4.rotation(0, Vec.of(0,1,0)));
            
            var i = 0;
            for (i = 0; i < NUM_PARTS; i++)
            {
                console.log("adding parts"+i);
                var xSize = this.getRandomInt(1,20);
                var ySize = this.getRandomInt(5,20);
                var zSize = this.getRandomInt(1,20);

                var xPos = this.getRandomInt(-MAP_BOUNDS,MAP_BOUNDS);
                var yPos = 0;
                var zPos = this.getRandomInt(-MAP_BOUNDS,MAP_BOUNDS);

                this.add_object("terrain", [xSize, ySize, zSize], [xPos, yPos, zPos], this.shapes.box, terrain_material, Mat4.rotation(0, Vec.of(0,1,0)));
            }
        }

        
        display(graphics_state){
            // Drawing map
            var shapes = this.context.globals.shapes;
            var materials = this.context.globals.materials;
            
            this.context.globals.workspace.map( (part) => {
                const part_mat4 = part.rotation.times(Mat4.translation(part.position))
                                               .times(Mat4.scale(part.size));

                /* !-- VERY HACKY delay rendering of sun for rendering with volumetric lighting
                        This is done to avoid the lag between rendering the sun object and rendering the volumetric lighting 
                        */
                if(part.name === "sun"){
                    this.context.globals.graphics_state.sunRender = () => {
                        part.shapes.draw(graphics_state, part_mat4, part.material);
                    }
                    
                }
                 /* !-- Doing hacky thing again with the ground for shadow rendering lol
                */
                else if (part.name === "base"){
                    this.context.globals.graphics_state.groundRender = () => {
                        part.shapes.draw(graphics_state, part_mat4, part.material);
                    }
                }
                else {
                    part.shapes.draw(graphics_state, part_mat4, part.material);
                }

               
            
            })
        }
}