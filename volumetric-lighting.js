//Create volumetric shading program
const CreatePostProgram = (gl) => {
    //console.log(gl);
    

    let volumetricVertScript = document.getElementById("volumetric_vert").textContent;
    let volumetricFragScript = document.getElementById("volumetric_frag").textContent;

    //Create volumetrics shaders
    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, volumetricVertScript);
    gl.compileShader(vertShader);

    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, volumetricFragScript);
    gl.compileShader(fragShader);


    //Creat postprocessing program and link shaders
    let postProcessProgram = gl.createProgram();
    gl.attachShader(postProcessProgram, vertShader);
    gl.attachShader(postProcessProgram, fragShader);

    gl.linkProgram(postProcessProgram);

    if ( !gl.getProgramParameter( postProcessProgram, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(postProcessProgram);
        throw new Error('Could not compile WebGL program. \n\n' + info);
      }

    //get uniform locations 
    const uniforms = 
    [ "density", "weight", "decay", "exposure", "numSamples", "occlusionTexture", "lightPosition", "outOfBounds"]
      .reduce( (acc, current) => {

        return {
            ...acc,
            [current]: gl.getUniformLocation(postProcessProgram, current)
        }
      }, {});

    return {
        program: postProcessProgram,
        uniforms: uniforms
    }

}

const RenderPostProcessing = (gl, postProcessBundle, graphicsState) => {
   
    let canvas = document.getElementById('main-canvas');
    let postProcessProgram = postProcessBundle.program;
    let uniforms = postProcessBundle.uniforms;
   

    //calculate light position on screen space
    let lightPosition = Vec.of(100,150,0,1);
    let outOfBounds = 0;
    lightPosition = graphicsState.camera_transform.times(lightPosition);
    lightPosition = graphicsState.projection_transform.times(lightPosition);
    lightPosition = lightPosition.times(1.0/lightPosition[3]);

    lightPosition = lightPosition.plus([1.0,1.0,0.0,0.0]);
    lightPosition = lightPosition.times(0.5);

    //keep lightPosition between 0 and 1
    if (lightPosition[0] < 0.0){
        outOfBounds = 1;
    }
    else if (lightPosition[0] > 1.0 ){
        outOfBounds = 1;
    }

    if (lightPosition[1] < 0.0){
        outOfBounds = 1;
    }
    else if (lightPosition[1] > 1.0 ){
        outOfBounds = 1;
    }

    
    //vertices for a rectangle that covers the entire viewport
    var vertices = [
        -1.0,1.0,0.0,
         -1.0,-1.0,0.0,
          1.0,-1.0,0.0,
          1.0,1.0,0.0
       
     ];
     
     indices = [3,2,1,3,1,0];
     
     // Create an empty buffer object to store vertex buffer
     var vertex_buffer = gl.createBuffer();

     // Bind appropriate array buffer to it
     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
     
     // Pass the vertex data to the buffer
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

     // Unbind the buffer
     gl.bindBuffer(gl.ARRAY_BUFFER, null);

     // Create an empty buffer object to store Index buffer
     var Index_Buffer = gl.createBuffer();

     // Bind appropriate array buffer to it
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

     // Pass the vertex data to the buffer
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
     
     // Unbind the buffer
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

     /* Activate the post processing program and set uniform values */
     gl.useProgram(postProcessProgram);

     gl.uniform1f(uniforms.density, 2.0);
     gl.uniform1f(uniforms.weight, 0.01);
     gl.uniform1f(uniforms.decay, 1.0);
     gl.uniform1f(uniforms.exposure, 1.0);
     gl.uniform1i(uniforms.numSamples, 100);
     gl.uniform1i(uniforms.occlusionTexture, 2);
     gl.uniform2fv(uniforms.lightPosition, [lightPosition[0],lightPosition[1]]);
     gl.uniform1i(uniforms.outOfBounds, outOfBounds);


     /*======= Associating shaders to buffer objects =======*/

     // Bind vertex buffer object
     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

     // Bind index buffer object
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
     
     // Get the attribute location
     var coord = gl.getAttribLocation(postProcessProgram, "coordinates");

     // Point an attribute to the currently bound VBO
     gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0); 
     
     // Enable the attribute
     gl.enableVertexAttribArray(coord);

     /*=========Draw the quad ===========*/

     // Clear the canvas
     gl.clearColor(0.0, 0.0, 0.0, 1.0);

     gl.enable(gl.BLEND);
     gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

     //Enable the depth test
     gl.enable(gl.DEPTH_TEST);

     // Draw the quad
     gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
     //gl.drawArrays(gl.TRIANGLES, 0, 3);
     gl.disable(gl.BLEND);
   

}


window.Godray_Shader = window.classes.Godray_Shader =
class Godray_Shader extends Shader            
{       
    //Use this functon to set properies of Godray shader                                     
    material( properties ) 
    { 
        Object.assign(this, properties );
        
        return { shader: this } 
    }     
    map_attribute_name_to_buffer_name( name )        
        {                                              
            return { 
                density: "density", 
                weight: "weight",
                decay: "decay",
                exposure: "exposure",
                numSamples: "numSamples",
                occlusionTexture: "occlusionTexture",
                screenSpaceLightPos: "screenSpaceLightPos",

                 }[ name ];    
        }

    update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
        { const [ P, C, M ] = [ g_state.projection_transform, g_state.camera_transform, model_transform ],
                        PCM = P.times( C ).times( M );
            gl.uniformMatrix4fv( gpu.projection_camera_model_transform_loc, false, Mat.flatten_2D_to_1D( PCM.transposed() ) );
        }
    shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        { return `

        `;
        }
    vertex_glsl_code()           // ********* VERTEX SHADER *********
        { return `
                    
            precision mediump float;

            attribute vec2 position;
            varying vec2 vUv;

            void main() {
                vUv = 0.5 * (position+1.0);

                gl_Position = vec4(position.xy, 0.0, 1.0);
            }`;
        }
    fragment_glsl_code()           // ********* FRAGMENT SHADER *********
        { return `
            precision highp float;
            uniform sampler2D uOcclusionTexture;
            varying vec2 vUv;
            
            uniform vec2 uScreenSpaceSunPos;
            
            uniform float uDensity;
            uniform float uWeight;
            uniform float uDecay;
            uniform float uExposure;
            uniform int uNumSamples;

            vec3 godrays(
            float density,
            float weight,
            float decay,
            float exposure,
            int numSamples,
            sampler2D occlusionTexture,
            vec2 screenSpaceLightPos,
            vec2 uv
            ) {
        
            vec3 fragColor = vec3(0.0,0.0,0.0);
        
            vec2 deltaTextCoord = vec2( uv - screenSpaceLightPos.xy );
        
            vec2 textCoo = uv.xy ;
            deltaTextCoord *= (1.0 /  float(numSamples)) * density;
            float illuminationDecay = 1.0;
        
        
            for(int i=0; i < 100 ; i++){
                if(numSamples < i) {
                    break;
                }
        
                textCoo -= deltaTextCoord;
                vec3 samp = texture2D(occlusionTexture, textCoo   ).xyz;
                samp *= illuminationDecay * weight;
                fragColor += samp;
                illuminationDecay *= decay;
            }
        
            fragColor *= exposure;
        
            return fragColor;
        }
            
            
            void main() {
            
            vec3 fragColor = godrays(
                uDensity,
                uWeight,
                uDecay,
                uExposure,
                uNumSamples,
                uOcclusionTexture,
                uScreenSpaceSunPos,
                vUv
                );
            
                gl_FragColor = vec4(fragColor , 1.0);
            }
            `;
        }
}