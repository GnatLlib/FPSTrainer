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
        
            this.workspace = [];
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

            this.workspace.push(part);
        }

        build_map() {
            // Baseplate
            var ground_material = this.context.get_instance(Phong_Shader).material();
            ground_material.color = Color.of(105/255,105/255,105/255,1);
            ground_material.ambient = 1;
            this.add_object("base", [100, 1, 100], [0, -5, 0], this.shapes.box, ground_material);

            // Walls
            var wall_material = this.context.get_instance(Phong_Shader).material();
            wall_material.color = Color.of(125/255,105/255,105/255,1);
            wall_material.ambient = 0.2;

            this.add_object("wall", [100, 20, 1], [0, 5, -100], this.shapes.box, wall_material);
            this.add_object("wall", [100, 20, 1], [0, 5, 100], this.shapes.box, wall_material);
            this.add_object("wall", [1, 20, 100], [100, 5, 0], this.shapes.box, wall_material);
            this.add_object("wall", [1, 20, 100], [-100, 5, 0], this.shapes.box, wall_material);

            // Sun
            var sun_material = this.context.get_instance(Phong_Shader).material()
                .override({ useFixed: true});
            sun_material.color = Color.of(255/255,255/255,255/255,1);
            sun_material.diffusivity = 0;
            sun_material.ambient = 1;
            sun_material.specularity = 0;

        
            this.add_object("sun", [6, 6, 6], this.context.globals.graphics_state.sunPosition, this.shapes.sphere, sun_material);
            

            // Targets
            var target_material = this.context.get_instance(Phong_Shader).material();
            target_material.color = Color.of(125/255,115/255,115/255,1);
            target_material.ambient = 1;

            this.add_object("target", [1, 10, 4], [10, 0, 0], this.shapes.box, target_material, Mat4.rotation(1, Vec.of(0,1,0)));
            this.add_object("target", [1, 10, 4], [20, 0, 20], this.shapes.box, target_material, Mat4.rotation(2, Vec.of(0,1,0)));
        }

        
        display(graphics_state){
            // Drawing map
            var shapes = this.context.globals.shapes;
            var materials = this.context.globals.materials;
            
            this.workspace.map( (part) => {

                
                const part_mat4 = part.rotation.times(Mat4.translation(part.position))
                                               .times(Mat4.scale(part.size));

                /* !-- VERY HACKY delay rendering of sun and save for rendering with volumetric lighting
                        This is done to avoid the lag between rendering the sun object and rendering the volumetric lighting 
                        */
                if(part.name == "sun"){
                    this.context.globals.graphics_state.sunRender = () => {
                        part.shapes.draw(graphics_state, part_mat4, part.material);
                    }
                    
                }
                else {
                    part.shapes.draw(graphics_state, part_mat4, part.material);
                }
            })
        }
}