window.Term_Project_Scene = window.classes.Term_Project_Scene =
    class Term_Project_Scene extends Scene_Component {
        constructor(context, control_box)     // The scene begins by requesting the camera, shapes, and materials it will need.
        {
            super(context, control_box);    // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 25, 0), Vec.of(0, 25, 20), Vec.of(0, 1, 0));

            // *** Mouse controls: ***
            this.mouse = { "from_center": Vec.of( 0,0 ) };                           // Measure mouse steering, for rotating the flyaround camera:
               const mouse_position = ( e, rect = context.canvas.getBoundingClientRect() ) => 
                                            Vec.of( e.clientX - (rect.left + rect.right)/2, e.clientY - (rect.bottom + rect.top)/2 );
                                                 // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas.
               document.addEventListener( "click",   e => { context.canvas.requestPointerLock(); }, false );
               context.canvas  .addEventListener( "mousedown", e => { if(document.pointerLockElement === context.canvas) console.log("pointer lock"); else console.log("pointer unlock"); } );
//              // context.canvas  .addEventListener( "mousemove", e => { e.preventDefault(); this.mouse.from_center = mouse_position(e); } );
//               //context.canvas  .addEventListener( "mouseout",  e => { if( !this.mouse.anchor ) this.mouse.from_center.scale(0) } );  

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                box: new Cube(),
                axis: new Axis_Arrows(),
            };

            this.submit_shapes(context, shapes);


            this.materials =
                {
                    phong: context.get_instance(Phong_Shader).material(Color.of(0.5, 0.5, 0.5, 1), {ambient: 1}),
                    phong2: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), {ambient: 1,}),
                };
            this.lights = [new Light(Vec.of(-5, 5, 5, 1), Color.of(0, 1, 1, 1), 100000)];

        }

        make_control_panel() {
           this.key_triggered_button( "Forward",[ "w" ], () =>  this.forward =  true, undefined, () => this.forward = false);  this.new_line();
           this.key_triggered_button( "Left",   [ "a" ], () =>  this.left =  true, undefined, () => this.left = false );
           this.key_triggered_button( "Back",   [ "s" ], () =>  this.back = true, undefined, () => this.back = false );
           this.key_triggered_button( "Right",  [ "d" ], () =>  this.right = true, undefined, () => this.right = false );  this.new_line();
        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


            // Drawing map
            var base_map = Mat4.identity().times(Mat4.scale([100, 1, 100]))
                .times(Mat4.translation([0, -5, 0]));
            this.shapes.box.draw(graphics_state, base_map, this.materials.phong);

            var wall_1 = Mat4.identity().times(Mat4.translation([0, 20, -100]))
                .times(Mat4.scale([100, 25, 1]));
            var wall_2 = Mat4.identity().times(Mat4.translation([0, 20, 100]))
                .times(Mat4.scale([100, 25, 1]));
            var wall_3 = Mat4.identity().times(Mat4.translation([100, 20, 0]))
                .times(Mat4.scale([1, 25, 100]));
            var wall_4 = Mat4.identity().times(Mat4.translation([-100, 20, 0]))
                .times(Mat4.scale([1, 25, 100]));
            this.shapes.box.draw(graphics_state, wall_1, this.materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
            this.shapes.box.draw(graphics_state, wall_2, this.materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
            this.shapes.box.draw(graphics_state, wall_3, this.materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
            this.shapes.box.draw(graphics_state, wall_4, this.materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
            if(this.forward)
                graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.translation([0,0,-1.5]));
            if(this.left)
                graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.translation([-1.5,0,0]));
            if(this.right)
                graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.translation([1.5,0,0]));
            if(this.back)
                graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.translation([0,0,1.5]));
            
            ;        //

        }
    }
