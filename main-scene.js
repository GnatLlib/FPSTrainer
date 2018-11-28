window.Term_Project_Scene = window.classes.Term_Project_Scene =
    class Term_Project_Scene extends Scene_Component {
        constructor(context, control_box)     // The scene begins by requesting the camera, shapes, and materials it will need.
        {
               
            super(context, control_box);    // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Camera_Movement(context, control_box.parentElement.insertCell()));
                context.register_scene_component(new Aiming_Manager(context, control_box.parentElement.insertCell()));
                context.register_scene_component(new Map_Environment(context, control_box.parentElement.insertCell()));
            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 25, 0), Vec.of(0, 25, 20), Vec.of(0, 1, 0));

            this.context = context;
            // *** Mouse controls: ***
            this.mouse = { "from_center": Vec.of( 0,0 ) };                           // Measure mouse steering, for rotating the flyaround camera:
               const mouse_position = ( e, rect = context.canvas.getBoundingClientRect() ) => 
                                            Vec.of( e.clientX - (rect.left + rect.right)/2, e.clientY - (rect.bottom + rect.top)/2 );
                                                 // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas.

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                box: new Cube(),
                axis: new Axis_Arrows,
                sphere: new Subdivision_Sphere(4),
            };

            this.submit_shapes(context, shapes);


            this.materials =
                {
                    phong: context.get_instance(Phong_Shader).material(Color.of(0.5, 0.5, 0.5, 1), {ambient: 1}),
                    phong2: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), {ambient: 1,}),
                };
            this.lights = [new Light(Vec.of(100, 500, 5, 1), Color.of(1, 1, 0.5, 1), 10000000000)];

            context.globals.shapes = this.shapes;
            context.globals.materials = this.materials;

        }   

        make_control_panel() {

        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        }
    }
