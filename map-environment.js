window.Map_Environment = window.classes.Map_Environment = 
class Map_Environment extends Scene_Component
{
    /*
        Map_Environment is a Scene_Component responsible for rendering map elements/targets
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
            wall_material.ambient = 1;

            this.add_object("wall", [100, 25, 1], [0, 20, -100], this.shapes.box, wall_material);
            this.add_object("wall", [100, 25, 1], [0, 20, 100], this.shapes.box, wall_material);
            this.add_object("wall", [1, 25, 100], [100, 20, 0], this.shapes.box, wall_material);
            this.add_object("wall", [1, 25, 100], [-100, 20, 0], this.shapes.box, wall_material);

            // Skybox
            var sky_material = this.context.get_instance(Phong_Shader).material();
            sky_material.color = Color.of(135/255,206/255,250/255,1);
            sky_material.diffusivity = 0;
            sky_material.ambient = 1;
            sky_material.specularity = 0;

            this.add_object("sky", [500, 500, 1], [0, 20, -500], this.shapes.box, sky_material);
            this.add_object("sky", [500, 500, 1], [0, 20, 500], this.shapes.box, sky_material);
            this.add_object("sky", [1, 500, 500], [500, 20, 0], this.shapes.box, sky_material);
            this.add_object("sky", [1, 500, 500], [-500, 20, 0], this.shapes.box, sky_material);
            this.add_object("sky", [500, 0, 500], [0, 500, 0], this.shapes.box, sky_material);

            // Sun
            var sun_material = this.context.get_instance(Phong_Shader).material();
            sun_material.color = Color.of(255/255,206/255,100/255,1);
            sun_material.diffusivity = 0;
            sun_material.ambient = 1;
            sun_material.specularity = 0;
            
            this.add_object("sun", [10, 10, 10], [100, 150, 0], this.shapes.sphere, sun_material);

        }

        
        display(graphics_state){
            // Drawing map
            var shapes = this.context.globals.shapes;
            var materials = this.context.globals.materials;
            
            this.workspace.map( (part) => {
                const part_mat4 = Mat4.translation(part.position).times(Mat4.scale(part.size)).times(part.rotation);
                part.shapes.draw(graphics_state, part_mat4, part.material);
            })

        }
}