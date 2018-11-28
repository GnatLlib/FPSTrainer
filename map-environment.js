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

        }
        
        display(graphics_state){
            // Drawing map

            var shapes = this.context.globals.shapes;
            var materials = this.context.globals.materials;

            var base_map = Mat4.identity().times(Mat4.scale([100, 1, 100]))
                .times(Mat4.translation([0, -5, 0]));

            shapes.box.draw(graphics_state, base_map, materials.phong);

            var wall_1 = Mat4.identity().times(Mat4.translation([0, 20, -100]))
                .times(Mat4.scale([100, 25, 1]));
            var wall_2 = Mat4.identity().times(Mat4.translation([0, 20, 100]))
                .times(Mat4.scale([100, 25, 1]));
            var wall_3 = Mat4.identity().times(Mat4.translation([100, 20, 0]))
                .times(Mat4.scale([1, 25, 100]));
            var wall_4 = Mat4.identity().times(Mat4.translation([-100, 20, 0]))
                .times(Mat4.scale([1, 25, 100]));
                
            shapes.box.draw(graphics_state, wall_1, materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
            shapes.box.draw(graphics_state, wall_2, materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
            shapes.box.draw(graphics_state, wall_3, materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
            shapes.box.draw(graphics_state, wall_4, materials.phong.override({color: Color.of([0.156, 0.486, 0.753, 1])}));
        }
}