window.Term_Project_Scene = window.classes.Term_Project_Scene =
class Term_Project_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
        context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,5 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { 
            box:   new Cube(),
            axis:  new Axis_Arrows(),
        }

        this.submit_shapes( context, shapes );


        this.materials =
          { 
            phong: context.get_instance( Phong_Shader ).material( Color.of( 0.5,0.5,0.5,1 ), {ambient:1} ),
            phong2: context.get_instance( Phong_Shader ).material( Color.of( 1,1,1,1 ), {ambient:1,} ),
          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];

      }
    make_control_panel()
      { 
        //this.key_triggered_button( "Toggle Rotation", [ "c" ], this.toggle_rotation );
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


        // Drawing map
        var base_map = Mat4.identity().times(Mat4.scale([100,1,100]))
                                       .times(Mat4.translation([0,-5,0]));
        this.shapes.box.draw( graphics_state, base_map, this.materials.phong );
        //

      }
  }
