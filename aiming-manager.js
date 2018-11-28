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

            console.log(this.canvas);
            this.target = function() { return context.globals.movement_controls_target() }
            context.globals.movement_controls_target = function(t) { return context.globals.graphics_state.camera_transform };

         
        }
        
        display(graphics_state){
            //console.log(graphics_state.camera_transform);
            

        }
    }